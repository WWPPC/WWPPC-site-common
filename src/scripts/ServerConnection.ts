import { isDev } from '#/index';
import { globalModal } from '#/modal';
import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { reactive } from 'vue';

import { AccountOpResult, useAccountManager } from './AccountManager';
import crossDomainStorage from './CrossDomainStorage';
import recaptcha from './recaptcha';

// send HTTP wakeup request before trying socket.io
export const serverHostname = isDev ? 'https://localhost:8000' : 'https://server.wwppc.tech';
export const socket = io(serverHostname, {
    path: '/web-socketio',
    autoConnect: false,
    reconnection: false
});
let connectionAttempts = 0;
const connectAttemptHandlers: Set<() => any> = new Set();
const connectErrorHandlers: Set<() => any> = new Set();
const attemptConnect = () => {
    connectionAttempts++;
    connectAttemptHandlers.forEach((h) => h());
    fetch(serverHostname + '/wakeup').then(() => {
        socket.connect();
        apiFetch('GET', '/config').then((config) => {
            if (config instanceof Error) {
                console.error('Failed to fetch server config!');
                const modal = globalModal();
                modal.showModal({ title: 'Failed to fetch server config!', content: 'The server configuration could not be fetched! This may cause issues with the website!', color: 'red' });
            } else state.serverConfig = config;
        });
    }, () => {
        console.info(`HTTP wakeup failed, retrying in ${10 * connectionAttempts} seconds...`);
        setTimeout(attemptConnect, 10000 * connectionAttempts);
        state.connectError = true;
        connectErrorHandlers.forEach((h) => h());
    });
};

let handshakeResolve: (v: any) => void = () => { };
let loginResolve: (v: any) => void = () => { };
const state = reactive<{
    handshakeComplete: boolean
    handshakePromise: Promise<undefined>
    connectError: boolean
    loggedIn: boolean
    loginPromise: Promise<undefined>
    manualLogin: boolean,
    encryptedPassword: ArrayBuffer | string | null,
    serverConfig: {
        maxProfileImgSize: number,
        contests: {
            [key: string]: {
                rounds: boolean
                submitSolver: boolean
                acceptedSolverLanguages: string[]
                maxSubmissionSize: number
            } | undefined
        }
    }
}>({
    handshakeComplete: false,
    handshakePromise: new Promise((resolve) => handshakeResolve = resolve),
    connectError: false,
    loggedIn: false,
    loginPromise: new Promise((resolve) => loginResolve = resolve),
    manualLogin: true,
    encryptedPassword: null,
    serverConfig: {
        maxProfileImgSize: 65535,
        contests: {}
    }
});
const RSA: {
    publicKey: CryptoKey | null,
    sessionID: number,
    encrypt(text: string): Promise<ArrayBuffer | string>
} = {
    publicKey: null,
    sessionID: 0,
    async encrypt(text) {
        if (RSA.publicKey != null) return await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, RSA.publicKey, new TextEncoder().encode(text));
        else return text;
    }
};

export interface CredentialsSignupData {
    firstName: string
    lastName: string
    email: string
    school: string
    grade: number
    experience: number
    languages: string[]
}

// RSA keys + autologin
socket.on('getCredentials', async (session) => {
    if (state.handshakeComplete) return;
    if (window.crypto.subtle === undefined) {
        console.warn('<h1>Insecure context!</h1><br>The page has been opened in an insecure context and cannot perform encryption processes. Credentials and submissions will be sent in PLAINTEXT!');
    } else {
        RSA.publicKey = await window.crypto.subtle.importKey('jwk', session.key, { name: "RSA-OAEP", hash: "SHA-256" }, false, ['encrypt']);
    }
    RSA.sessionID = session.session;
    Object.defineProperty(window, 'crossDomainStorage', {
        value: crossDomainStorage
    })
    console.debug('letterbeforea')
    const sessionCreds = await crossDomainStorage.getItem('sessionCredentials');
    console.debug('a')
    // autologin if possible
    if (sessionCreds != null && RSA.sessionID.toString() === await crossDomainStorage.getItem('sessionId')) {
        console.debug('b')
        const creds = JSON.parse(sessionCreds);
        const res = await sendCredentials(creds.username, creds.password, await recaptcha.execute('autologin'));
        if (res == AccountOpResult.SUCCESS) {
            state.loggedIn = true;
            state.manualLogin = false;
        } else {
            await Promise.all([
                crossDomainStorage.removeItem('sessionCredentials'),
                crossDomainStorage.removeItem('sessionId')
            ]);
        }
        console.debug('c')
    }
    state.handshakeComplete = true;
    handshakeResolve(undefined);
});
export const sendCredentials = async (username: string, password: string | number[], token: string, signupData?: CredentialsSignupData): Promise<AccountOpResult> => {
    return await new Promise(async (resolve, reject) => {
        if (state.loggedIn) {
            resolve(AccountOpResult.NOT_CONNECTED);
            return;
        }
        try {
            const accountManager = useAccountManager();
            const password2 = password instanceof Array ? Uint32Array.from(password).buffer : await RSA.encrypt(password);
            const res: AccountOpResult = await socket.emitWithAck('credentials', {
                username: username,
                password: password2,
                token: token,
                session: RSA.sessionID,
                signupData: signupData !== undefined ? {
                    firstName: signupData.firstName,
                    lastName: signupData.lastName,
                    email: signupData.email,
                    school: signupData.school,
                    grade: signupData.grade,
                    experience: signupData.experience,
                    languages: signupData.languages,
                } : undefined
            });
            if (res === AccountOpResult.SUCCESS) {
                console.debug('y')
                await Promise.all([
                    crossDomainStorage.setItem('sessionCredentials', JSON.stringify({
                        username: username,
                        password: password2 instanceof ArrayBuffer ? Array.from(new Uint32Array(password2)) : password2,
                    })),
                    crossDomainStorage.setItem('sessionId', RSA.sessionID.toString())
                ]);
                console.debug('z')
                state.encryptedPassword = password2;
                state.loggedIn = true;
                loginResolve(undefined);
                accountManager.username = username;
                accountManager.updateOwnUserData();
            }
            resolve(res);
        } catch (err) {
            reject(err);
        }
    });
};

const apiPath = serverHostname + '/api';
export const apiFetch = async (method: 'GET' | 'POST', path: string, body?: string): Promise<any | Error> => {
    try {
        const res = await fetch(apiPath + (path.startsWith('/') ? path : ('/' + path)), {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: body != undefined ? JSON.stringify(body) : undefined
        });
        if (res.ok) return await res.json();
        return new Error(res.status + (res.statusText != '' ? ' - ' + res.statusText : ''));
    } catch (err) {
        if (err instanceof Error) return err;
        return new Error('' + err);
    }
};

export const useServerConnection = defineStore('serverconnection', {
    state: () => state,
    getters: {
        socket: () => socket,
        connected: () => socket.connected,
        RSAsessionId: () => RSA.sessionID
    },
    actions: {
        RSAencrypt: RSA.encrypt,
        emit(event: string, ...data: any) {
            return socket.emit(event, ...data);
        },
        emitWithAck(event: string, ...data: any): Promise<any> {
            return socket.emitWithAck(event, ...data);
        },
        on(event: string, handler: (...args: any[]) => any) {
            return socket.on(event, handler);
        },
        once(event: string, handler: (...args: any[]) => any) {
            return socket.once(event, handler);
        },
        off(event: string, handler: (...args: any[]) => any) {
            return socket.off(event, handler);
        },
        removeAllListeners(event: string) {
            socket.removeAllListeners(event);
        },
        onattemptconnect(handler: () => boolean | void | Promise<boolean | void>) {
            const h = () => {
                if (handler()) connectAttemptHandlers.delete(h);
            };
            connectAttemptHandlers.add(h);
        },
        onconnect(handler: () => boolean | void | Promise<boolean | void>) {
            const h = () => {
                if (handler()) socket.off('connect', h);
            };
            socket.on('connect', h);
        },
        onconnecterror(handler: () => boolean | void | Promise<boolean | void>) {
            const h = () => {
                if (handler()) {
                    socket.off('connect_error', h);
                    socket.off('connect_fail', h);
                    connectErrorHandlers.delete(h);
                }
            };
            socket.on('connect_error', h);
            socket.on('connect_fail', h);
            connectErrorHandlers.add(h);
        },
        ondisconnect(handler: () => boolean | void | Promise<boolean | void>) {
            const h = () => {
                if (handler()) {
                    socket.off('disconnect', h);
                    socket.off('timeout', h);
                    socket.off('error', h);
                }
            };
            socket.on('disconnect', h);
            socket.on('timeout', h);
            socket.on('error', h);
        }
    }
});

const onConnectError = (message: string) => {
    console.error(`ServerConnection: Connection ${message} for ${serverHostname}`);
    state.connectError = true;
};
const onDisconnected = (message: string) => {
    console.error(`ServerConnection: ${message}`);
    console.info('ServerConnection: Reconnecting...');
    state.handshakeComplete = false;
    state.handshakePromise = new Promise((resolve) => handshakeResolve = resolve);
    state.loginPromise = new Promise((resolve) => loginResolve = resolve);
    state.loggedIn = false;
    state.manualLogin = true;
    connectionAttempts = 0;
    setTimeout(attemptConnect, 5000);
};
socket.on('connect', () => {
    state.connectError = false;
    console.info(`ServerConnection: Connected to ${serverHostname}`);
});
socket.on('connect_error', () => onConnectError('error'));
socket.on('connect_fail', () => onConnectError('failed'));
socket.on('disconnect', (reason) => onDisconnected('Disconnected: ' + reason));
socket.on('timeout', () => onDisconnected('Timed out'));
socket.on('error', (err) => onDisconnected('Error: ' + err));

window.addEventListener('load', attemptConnect);
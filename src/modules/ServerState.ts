import { globalModal } from '#/modal';
import { debounce } from '#/util/inputLimiting';
import { apiFetch } from '#/util/netUtil';
import { defineStore } from 'pinia';
import { reactive, ref, watch } from 'vue';

import type { AccountData } from './AccountManager';

export type ServerContestConfig = {
    rounds: boolean
    restrictiveRounds: boolean
    scoreFreezeTime: number
    withholdResults: number
    submitSolver: boolean
    acceptedSolverLanguages: string[]
    maxSubmissionSize: number
};

const state = reactive<{
    connected: boolean
    loggedIn: boolean
    config: {
        maxProfileImgSize: number
        contests: { [key: string]: ServerContestConfig | undefined }
    }
}>({
    connected: false,
    loggedIn: false,
    config: {
        maxProfileImgSize: 65535,
        //TODO: remove contests from config and into the ContestManager class
        contests: {}
    }
});

const RSA: {
    publicKey: CryptoKey | null,
    encrypt(text: string): Promise<ArrayBuffer | string>
} = {
    publicKey: null,
    async encrypt(text) {
        if (RSA.publicKey !== null) {
            const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, RSA.publicKey, new TextEncoder().encode(text)); if (typeof encrypted == 'string') return encrypted;
            return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
        }
        console.warn("Attempted encryption without public key");
        return text;
    }
};

export const RSAencrypt = RSA.encrypt;

// re-fetch server config if session changes
const sessionId = ref('');
const checkLoggedIn = async () => {
    // will detect if disconnected/session expired
    try {
        const res = await apiFetch('GET', '/auth/login');
        sessionId.value = await res.text();
        if (res.ok) {
            // connected & logged in
            state.connected = true;
            state.loggedIn = true;
        } else if (res.status == 401) {
            // connected but not logged in
            state.connected = true;
            state.loggedIn = false;
        } else {
            // oh no
            state.connected = false;
            state.loggedIn = false;
        }
    } catch (err) {
        // failed to fetch - no internet is common cause for error
        state.connected = false;
        state.loggedIn = false;
    }
};
watch(sessionId, (prev, curr) => {
    if (prev != curr) {
        apiFetch('GET', '/auth/publicKey', undefined, undefined, { cache: 'no-store' }).then(async (res) => {
            if (window.crypto.subtle === undefined) {
                console.warn('<h1>Insecure context!</h1><br>The page has been opened in an insecure context and cannot perform encryption processes. Credentials and submissions will be sent in PLAINTEXT!');
            } else {
                RSA.publicKey = await window.crypto.subtle.importKey('jwk', await res.json(), { name: "RSA-OAEP", hash: "SHA-256" }, false, ['encrypt']);
            }
        });
        apiFetch('GET', '/api/config', undefined, undefined, { cache: 'no-store' }).then(async (res) => {
            if (!res.ok) {
                const errText = `${res.status} - ${await res.text()}`;
                console.error(`Failed to fetch configuration:\n${errText}`);
                const modal = globalModal();
                modal.showModal({
                    title: 'Configuration fetch failed',
                    content: `Failed to fetch server configuration. This may interfere with some functionality.\n${errText}`,
                    color: 'var(--color-2)'
                });
            } else {
                state.config = await res.json();
                console.info('Server configuration fetched');
            }
        });
    }
});
watch(() => state.connected, () => console.debug('Connected: ' + state.connected));

export const useServerState = defineStore('serverState', {
    state: () => state,
    getters: {
        encryptionReady: (): boolean => RSA.publicKey !== null
    },
    actions: {
        init() {
            checkLoggedIn();
            setInterval(() => checkLoggedIn(), 30000);
            document.addEventListener('visibilitychange', debounce(() => {
                // debounce stops spam if for say someone is switching tabs a lot (sometimes this fires a lot)
                if (document.visibilityState == 'visible') checkLoggedIn();
            }, 3000));
        },
        // auth
        async login(username: string, password: string): Promise<Response> {
            const res = await apiFetch('POST', '/auth/login', {
                username: username,
                password: await RSAencrypt(password)
            });
            if (res.ok) state.loggedIn = true;
            return res;
        },
        async signup(username: string, password: string, data: Omit<AccountData, 'username' | 'displayName' | 'profileImage' | 'bio' | 'pastRegistrations' | 'team'>): Promise<Response> {
            const res = await apiFetch('POST', '/auth/signup', {
                username: username,
                password: await RSAencrypt(password),
                email: await RSAencrypt(data.email),
                email2: await RSAencrypt(data.email2),
                firstName: data.firstName,
                lastName: data.lastName,
                organization: data.organization,
                grade: data.grade,
                experience: data.experience,
                languages: data.languages
            });
            if (res.ok) state.loggedIn = true;
            return res;
        },
        async requestRecovery(username: string, email: string): Promise<Response> {
            return await apiFetch('POST', '/auth/requestRecovery', {
                username: username,
                email: await RSAencrypt(email)
            });
        },
        async recoverAccount(username: string, recoveryPassword: string, newPassword: string): Promise<Response> {
            return await apiFetch('POST', '/auth/recovery', {
                username: username,
                recoveryPassword: await RSAencrypt(recoveryPassword),
                newPassword: await RSAencrypt(newPassword)
            });
        },
        async changePassword(currentPass: string, newPass: string): Promise<Response> {
            return await apiFetch('PUT', '/auth/changePassword', {
                password: await RSAencrypt(currentPass),
                newPassword: await RSAencrypt(newPass)
            })
        },
        async deleteAccount(password: string): Promise<Response> {
            const res = await apiFetch('DELETE', '/auth/delete', {
                password: await RSAencrypt(password),
            });
            if (res.ok) state.loggedIn = false;
            return res;
        },
        async logout(): Promise<Response> {
            const res = await apiFetch('DELETE', '/auth/logout');
            if (res.ok) state.loggedIn = false;
            return res;
        },
    }
});
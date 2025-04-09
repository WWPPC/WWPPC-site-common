import { isDev } from '#/index';
import { globalModal } from '#/modal';
import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const serverHostname = isDev ? 'https://localhost:8000' : 'https://server.wwppc.tech';

/**
 * Execute an HTTP request to the server and get a response.
 * @param method HTTP method
 * @param path URL path
 * @param body Optional request body, sent as JSON
 * @returns Response
 * @throws Typical errors thrown by `fetch` calls
 */
export async function apiFetch(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: any): Promise<Response> {
    return await fetch(serverHostname + (path.startsWith('/') ? path : ('/' + path)), {
        method: method,
        headers: body != undefined ? {
            "Content-Type": "application/json"
        } : undefined,
        mode: 'cors',
        credentials: 'include',
        body: body != undefined ? JSON.stringify(body) : undefined
    });
}

let resolveHandshake: () => void;
const state = reactive<{
    loggedIn: boolean
    manualLogin: boolean,
    handshakePromise: Promise<void>
    serverConfig: {
        maxProfileImgSize: string,
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
    loggedIn: false,
    manualLogin: true,
    handshakePromise: new Promise<void>((resolve) => resolveHandshake = resolve),
    serverConfig: {
        maxProfileImgSize: '4kb',
        contests: {}
    }
});

const RSA: {
    publicKey: CryptoKey | null,
    encrypt(text: string): Promise<ArrayBuffer | string>
} = {
    publicKey: null,
    async encrypt(text) {
        await state.handshakePromise;
        if (RSA.publicKey != null) return await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, RSA.publicKey, new TextEncoder().encode(text));
        else return text;
    }
};

export const RSAencrypt = RSA.encrypt;

export const useServerState = defineStore('serverState', {
    state: () => state
});

try {
    apiFetch('GET', '/auth/publicKey').then(async (res) => {
        if (window.crypto.subtle === undefined) {
            console.warn('<h1>Insecure context!</h1><br>The page has been opened in an insecure context and cannot perform encryption processes. Credentials and submissions will be sent in PLAINTEXT!');
        } else {
            RSA.publicKey = await window.crypto.subtle.importKey('jwk', await res.json(), { name: "RSA-OAEP", hash: "SHA-256" }, false, ['encrypt']);
        }
    }).then(() => apiFetch('GET', '/auth/login').then((res) => {
        state.loggedIn = res.ok;
        state.manualLogin = !state.loggedIn;
        resolveHandshake();
    }));
    apiFetch('GET', '/api/config').then(async (res) => {
        if (!res.ok) {
            console.error(`Failed to fetch configuration: ${res.status} - ${res.statusText}`);
            const modal = globalModal();
            modal.showModal({
                title: 'Configuration fetch failed',
                content: 'Failed to fetch server configuration. This may interfere with some functionality.',
                color: 'var(--color-2)'
            });
        } else {
            state.serverConfig = await res.json();
            console.info('Server configuration fetched');
        }
    });
} catch (err) {
    console.error('Failed to fetch public key or check login status');
    console.error(err);
    const modal = globalModal();
    modal.showModal({
        title: 'Authentication error',
        content: 'Failed to fetch public key or check login status',
        color: 'var(--color-2)'
    });
    resolveHandshake!();
}
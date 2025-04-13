import { globalModal } from '#/modal';
import { apiFetch, LongPollEventReceiver } from '#/util/netUtil';
import { defineStore } from 'pinia';
import { reactive } from 'vue';

export type ServerContestConfig = {
    rounds: boolean
    submitSolver: boolean
    acceptedSolverLanguages: string[]
    maxSubmissionSize: number
};

const state = reactive<{
    loggedIn: boolean
    manualLogin: boolean
    serverConfig: {
        maxProfileImgSize: number
        contests: { [key: string]: ServerContestConfig | undefined }
    }
}>({
    loggedIn: false,
    manualLogin: true,
    serverConfig: {
        maxProfileImgSize: 65535,
        //TODO: remove contests from serverConfig and into the ContestManager class
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

export const useServerState = defineStore('serverState', {
    state: () => state,
    getters: {
        encryptionReady: (): boolean => RSA.publicKey !== null
    },
    actions: {
        init() {
            try {
                this.checkLoggedIn();
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
                setInterval(() => this.checkLoggedIn(), 30000);
            } catch (err) {
                console.error('Failed to fetch public key or check login status');
                console.error(err);
                const modal = globalModal();
                modal.showModal({
                    title: 'Authentication error',
                    content: 'Failed to fetch public key or check login status',
                    color: 'var(--color-2)'
                });
            }
        },
        checkLoggedIn() {
            apiFetch('GET', '/auth/login').then((res) => {
                if (!res.ok) {
                    // avoid triggering reactivity if the state doesn't change
                    state.loggedIn = false;
                    state.manualLogin = true;
                    // if not logged in then assume RSA keypairs rotated too
                    RSA.publicKey = null;
                } else if (RSA.publicKey === null) {
                    apiFetch('GET', '/auth/publicKey').then(async (res) => {
                        if (window.crypto.subtle === undefined) {
                            console.warn('<h1>Insecure context!</h1><br>The page has been opened in an insecure context and cannot perform encryption processes. Credentials and submissions will be sent in PLAINTEXT!');
                        } else {
                            RSA.publicKey = await window.crypto.subtle.importKey('jwk', await res.json(), { name: "RSA-OAEP", hash: "SHA-256" }, false, ['encrypt']);
                        }
                    });
                }
            });
        }
    }
});
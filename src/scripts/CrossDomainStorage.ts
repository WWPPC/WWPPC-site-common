import { isDev } from '#/index';

class WWPPCXDStorage {
    readonly #origin: string = isDev ? 'http://localhost:5175' : 'https://session.wwppc.tech';
    readonly #contentWindow: Window;
    readonly #loadPromise: Promise<void>;

    readonly #listeners: { ev: string, cb: (res: any) => any }[] = [];
    #messageCount: number = 0;

    constructor() {
        const iframe = document.createElement('iframe');
        iframe.src = this.#origin;
        iframe.width = '0px';
        iframe.height = '0px';
        iframe.style.display = 'none';
        iframe.style.position = 'absolute'
        document.body.appendChild(iframe);
        if (iframe.contentWindow == null) throw new Error('No access to embed window');
        this.#contentWindow = iframe.contentWindow;
        this.#loadPromise = new Promise((resolve) => {
            iframe.onload = () => {
                console.log('loaded')
                // ping the iframe and wait for response, then resolve
                this.#contentWindow.postMessage('connect', this.#origin);
                const handleResponse = (e: MessageEvent) => {
                    if (e.source != this.#contentWindow || e.data !== 'connect') return;
                    console.log('connected')
                    resolve();
                    window.removeEventListener('message', handleResponse);
                    // the actual handler
                    window.addEventListener('message', (e) => {
                        if (e.source != this.#contentWindow || e.data == null || e.data.ev == null) return;
                        for (const listener of this.#listeners) {
                            if (e.data.ev == listener.ev) {
                                listener.cb(e.data.res);
                                this.#listeners.splice(this.#listeners.indexOf(listener), 1);
                                break;
                            }
                        }
                    });
                };
                window.addEventListener('message', handleResponse);
            };
        });
    }

    async #message(ev: string, data: any): Promise<any> {
        await this.#loadPromise;
        return await new Promise((resolve) => {
            console.log(ev, data)
            const ev2 = ev + ':' + this.#messageCount++;
            this.#contentWindow.postMessage({ ev: ev2, data: data }, this.#origin);
            this.#listeners.push({ ev: ev2, cb: (res) => resolve(res) });
        });
    }

    async getItem(key: string): Promise<string | null> {
        const res = await this.#message('get', key);
        if (typeof res == 'string' || res === null) return res;
        return null;
    }

    async setItem(key: string, value: string): Promise<void> {
        await this.#message('set', [key, value]);
    }

    async removeItem(key: string): Promise<void> {
        await this.#message('delete', key);
    }
}

const crossDomainStorage = isDev ? window.localStorage : (new WWPPCXDStorage());

export default crossDomainStorage;
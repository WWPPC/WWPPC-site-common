import { isDev } from '#/index';

/**
 * Cross-domain local storage & authentication session for all sites.
 */
class SiteSession {
    private readonly origin: string = isDev ? 'http://localhost:5175' : 'https://session.wwppc.tech';
    private readonly contentWindow: Window;
    private readonly loadPromise: Promise<void>;

    private readonly listeners: Map<string, (res: any) => any> = new Map();
    private messageCount: number = 0;

    constructor() {
        const iframe = document.createElement('iframe');
        iframe.src = this.origin;
        iframe.width = '0px';
        iframe.height = '0px';
        iframe.style.display = 'none';
        iframe.style.position = 'absolute'
        document.body.appendChild(iframe);
        if (iframe.contentWindow == null) throw new Error('No access to embed window');
        this.contentWindow = iframe.contentWindow;
        this.loadPromise = new Promise((resolve) => {
            iframe.onload = () => {
                // ping the iframe and wait for response, then resolve
                const handleResponse = (e: MessageEvent) => {
                    if (e.source != this.contentWindow || e.data !== 'connect') return;
                    resolve();
                    window.removeEventListener('message', handleResponse);
                    // the actual handler
                    window.addEventListener('message', (e) => {
                        if (e.source != this.contentWindow || e.data == null || e.data.ev == null) return;
                        for (const [ev, cb] of this.listeners) {
                            if (e.data.ev == ev) {
                                cb(e.data.res);
                                this.listeners.delete(ev);
                            }
                        }
                    });
                };
                window.addEventListener('message', handleResponse);
                this.contentWindow.postMessage('connect', this.origin);
            };
        });
    }

    private async message(ev: string, data: any): Promise<any> {
        await this.loadPromise;
        return await new Promise((resolve) => {
            const ev2 = ev + ':' + this.messageCount++;
            this.contentWindow.postMessage({ ev: ev2, data: data }, this.origin);
            this.listeners.set(ev, (res) => resolve(res));
        });
    }

    /**
     * Get a shared storage item.
     * @param key Key
     * @returns Item or null
     */
    async getStorage(key: string): Promise<string | null> {
        const res = await this.message('get', key);
        if (typeof res == 'string' || res === null) return res;
        return null;
    }

    /**
     * Set a shared storage item
     * @param key Key
     * @param value Item
     */
    async setStorage(key: string, value: string): Promise<void> {
        await this.message('set', [key, value]);
    }

    /**
     * Delete a shared storage item.
     * @param key Key
     */
    async removeStorage(key: string): Promise<void> {
        await this.message('delete', key);
    }
}

const siteSession = isDev ? window.localStorage : (new SiteSession());

export default siteSession;
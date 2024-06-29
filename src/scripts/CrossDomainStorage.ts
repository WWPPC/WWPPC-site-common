import createGuest from 'cross-domain-storage/guest';
import { isDev } from '..';

class WWPPCXDStorage {
    #storage;

    constructor() {
        this.#storage = createGuest('https://session.wwppc.tech');
    }

    async getItem(key: string): Promise<string | null> {
        return await new Promise((resolve, reject) => {
            this.#storage.get(key, (err: ErrorEvent | undefined, val: string | null) => {
                if (err) reject(err);
                else resolve(val);
            });
        });
    }

    async setItem(key: string, value: string): Promise<void> {
        return await new Promise((resolve, reject) => {
            this.#storage.set(key, value, (err: ErrorEvent | undefined) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async removeItem(key: string): Promise<void> {
        return await new Promise((resolve, reject) => {
            this.#storage.remove(key, (err: ErrorEvent | undefined) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

const crossDomainStorage = isDev ? window.localStorage : (new WWPPCXDStorage());

export default crossDomainStorage;
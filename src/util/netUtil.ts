import { isDev } from '#/index';
import { ref } from 'vue';

import type { Ref } from 'vue';

export const serverHostname = isDev ? 'https://localhost:8000' : 'https://server.wwppc.tech';

/**
 * Execute an HTTP request to the server and get a response.
 * @param method HTTP method
 * @param path URL path
 * @param body Optional request body, sent as JSON
 * @param query Optional query parameters, as an object of key-value pairs
 * @returns Response
 * @throws Typical errors thrown by `fetch` calls
 */
export async function apiFetch(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: any, query?: Record<string, string>): Promise<Response> {
    return await fetch(serverHostname + (path.startsWith('/') ? path : ('/' + path) + (query !== undefined ? new URLSearchParams(Object.entries(query)).toString() : '')), {
        method: method,
        headers: body != undefined ? {
            "Content-Type": "application/json"
        } : undefined,
        mode: 'cors',
        credentials: 'include',
        body: body != undefined ? JSON.stringify(body) : undefined
    });
}

/**
 * HTTP long-polling wrapper that produces a reactive ref.
 */
export class LongPollEventReceiver<E> {
    private readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    readonly path: string;
    /**Most recent value published by server endpoint */
    readonly ref: Ref<E | undefined>;
    private running: boolean = true;

    /**
     * @param method HTTP method
     * @param path Path to endpoint on server
     */
    constructor(method: LongPollEventReceiver<E>['method'], path: string) {
        this.method = method;
        this.path = path;
        this.ref = ref();
        this.fetchLoop();
    }

    private async fetchLoop() {
        // initial request
        const res = await apiFetch(this.method, this.path, undefined, { init: '1' }).catch(() => new Response(null, { status: 503 }));
        if (res.ok) {
            if (res.status != 204) this.ref.value = await res.json() as E;
        } else {
            await new Promise<void>((r) => setTimeout(() => r(), 10000));
        }
        let retryTime = 10000;
        while (this.running) {
            const res = await apiFetch(this.method, this.path).catch(() => new Response(null, { status: 503 }));
            if (res.ok) {
                if (res.status != 204) this.ref.value = await res.json() as E;
                retryTime = 10000;
            } else {
                await new Promise<void>((r) => setTimeout(() => r(), Math.min(120000, retryTime)));
                retryTime *= 1.5;
            }
        }
    }

    get value(): E | undefined {
        return this.ref.value;
    }

    /**
     * Stops long-polling requests indefinitely.
     */
    stop(): void {
        this.running = false;
    }
}
import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useServerState } from './ServerState';

import type {RouteLocationNormalizedGeneric} from 'vue-router';

const state = reactive<{
    /**Enforce login requirements on paths that partially match */
    readonly include: Set<string>
    /**Do not enforce login requirements on paths that partially match */
    readonly exclude: Set<string>
    /**Enforce login requirements on paths that exactly match */
    readonly includeExact: Set<string>
    /**Do not enforce login requirements on paths that exactly match */
    readonly excludeExact: Set<string>
}>({
    include: new Set(),
    exclude: new Set(),
    includeExact: new Set(),
    excludeExact: new Set()
});

export const useLoginEnforcer = defineStore('loginEnforcer', {
    state: () => state,
    actions: {
        init() {
            const serverState = useServerState();
            const route = useRoute();
            const router = useRouter();
            // redirect to login if not logged in
            const checkLogin = (to: RouteLocationNormalizedGeneric) => {
                const trimmed = to.path.replace(/\/*$/, '');
                if ((!serverState.loggedIn && route.query.ignore_server === undefined
                    && Array.from(state.include.values()).some((p) => trimmed.startsWith(p)) || state.includeExact.has(trimmed))
                    && !(Array.from(state.exclude.values()).some((p) => trimmed.startsWith(p)) || state.excludeExact.has(trimmed))) {
                    router.push({ path: '/login', query: { redirect: to.fullPath, clearQuery: 1 } });
                }
            };
            router.afterEach((to) => checkLogin(to));
            watch(() => serverState.loggedIn, () => checkLogin(route));
        }
    }
});
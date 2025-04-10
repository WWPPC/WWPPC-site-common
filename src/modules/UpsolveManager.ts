import { defineStore } from 'pinia';
import { reactive } from 'vue';

import { useServerState } from './ServerState';
import type { Submission } from './ContestManager';
import { apiFetch } from '#/util/netUtil';


const state = reactive<{
    submissionsCache: Map<string, Submission[]>
    submissionsUpdated: number // for watch hooks
}>({
    submissionsCache: new Map(),
    submissionsUpdated: 0
});

export const useUpsolveManager = defineStore('upsolveManager', {
    state: () => state,
    actions: {
    }
});
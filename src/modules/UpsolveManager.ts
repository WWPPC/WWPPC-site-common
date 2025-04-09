import { defineStore } from 'pinia';
import { reactive } from 'vue';

import { apiFetch, useServerState } from './ServerState';


const state = reactive<{
    submissionsCache: Map<string, UpsolveSubmission[]>
    submissionsUpdated: number // for watch hooks
}>({
    submissionsCache: new Map(),
    submissionsUpdated: 0
});

export const useUpsolveManager = defineStore('upsolveManager', {
    state: () => state,
    actions: {
        async getContestList(): Promise<string[] | Error> {
            return await apiFetch('GET', '/upsolveContestList');
        },
        async getContestData(contest: string): Promise<UpsolveContest | Error> {
            return await apiFetch('GET', `/upsolve/${contest}`);
        },
        async getRoundData(contest: string, round: number): Promise<UpsolveRound | Error> {
            return await apiFetch('GET', `/upsolve/${contest}/${round}`);
        },
        async getProblemData(contest: string, round: number, problem: number): Promise<UpsolveProblem | Error> {
            return await apiFetch('GET', `/upsolve/${contest}/${round}/${problem}`);
        },
        async updateSubmission(problemId: string, lang: string, file: string): Promise<ContestUpdateSubmissionResult> {
            const serverState = useServerState();
            if (!serverState.loggedIn) return ContestUpdateSubmissionResult.NOT_CONNECTED;
            return await serverState.emitWithAck('updateUpsolveSubmission', { id: problemId, file, lang });
        },
        async refreshSubmission(problemId: string): Promise<UpsolveSubmission[] | null> {
            const serverState = useServerState();
            if (!serverState.loggedIn) return null;
            const res: UpsolveSubmission[] | null = await serverState.emitWithAck('refreshUpsolveSubmission', { id: problemId });
            if (res != null) state.submissionsCache.set(problemId, res);
            return res;
        },
        async getSubmissions(problemId: string): Promise<UpsolveSubmission[] | null> {
            if (state.submissionsCache.has(problemId)) return state.submissionsCache.get(problemId)!;
            return await this.refreshSubmission(problemId);
        },
        async getSubmissionCode(problemId: string): Promise<string> {
            const serverState = useServerState();
            if (!serverState.loggedIn) return '';
            return await serverState.emitWithAck('getUpsolveSubmissionCode', { id: problemId });
        }
    }
});

// prevent circular dependency nuke
window.addEventListener('DOMContentLoaded', () => {
    socket.on('upsolveSubmissionStatus', (submissions: UpsolveSubmission[]) => {
        if (submissions.length == 0) return;
        state.submissionsCache.set(submissions[0].problemId, submissions);
        state.submissionsUpdated++;
    });
    const serverState = useServerState();
    serverState.ondisconnect(() => {
        state.submissionsCache.clear();
    });
});
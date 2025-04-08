import { globalModal } from '#/modal';
import { defineStore } from 'pinia';
import { reactive } from 'vue';

import { useAccountManager } from './AccountManager';
import { apiFetch, useServerState } from './ServerState';

type UUID = string;

export type Contest = {
    readonly id: string
    type: string
    rounds: Round[]
    startTime: number
    endTime: number
}
export type Round = {
    readonly contest: string
    readonly round: number
    problems: UUID[]
    startTime: number
    endTime: number
}
export type Problem = {
    readonly id: UUID
    readonly contest: string
    readonly round: number
    readonly number: number
    name: string
    author: string
    content: string
    constraints: {
        time: number
        memory: number
    }
}
export type Submission = {
    time: number
    language: string
    scores: Score[]
    status: ProblemCompletionState
    analysis: boolean
}
export type Score = {
    state: ScoreState
    time: number
    memory: number
    subtask: number
}
export enum ScoreState {
    CORRECT = 1,
    INCORRECT = 2,
    TIME_LIM_EXCEEDED = 3,
    MEM_LIM_EXCEEDED = 4,
    RUNTIME_ERROR = 5,
    COMPILE_ERROR = 6
}
export enum ProblemCompletionState {
    NOT_UPLOADED = 0,
    UPLOADED = 1,
    SUBMITTED = 2,
    GRADED_FAIL = 3,
    GRADED_PARTIAL = 4,
    GRADED_PASS = 5
}
export function completionStateString(status: ProblemCompletionState): string {
    return status == ProblemCompletionState.NOT_UPLOADED ? 'Not uploaded' :
        status == ProblemCompletionState.UPLOADED ? 'Uploaded' :
            status == ProblemCompletionState.SUBMITTED ? 'Submitted' :
                status == ProblemCompletionState.GRADED_PASS ? 'Accepted' :
                    status == ProblemCompletionState.GRADED_FAIL ? 'Failed' :
                        status == ProblemCompletionState.GRADED_PARTIAL ? 'Partially accepted' : 'Error fetching status'
}

export type ScoreboardEntry = {
    username: string
    score: number
}

export class ContestHost {

}

const state = reactive<{
    contests: Record<string, ContestHost | undefined>
}>({
    contests: {}
});

export const useContestManager = defineStore('contestManager', {
    state: () => state,
    getters: {
        config: () => {
            const serverState = useServerState();
            return serverState.serverConfig.contests
        }
    },
    actions: {
        async getContestList(): Promise<Response> {
            return await apiFetch('GET', '/contestList');
        }
    }
});
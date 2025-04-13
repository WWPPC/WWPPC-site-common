import { globalModal } from '#/modal';
import { debounce } from '#/util/inputLimiting';
import { apiFetch, LongPollEventReceiver } from '#/util/netUtil';
import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';

import { useServerState } from './ServerState';

import type { Ref } from 'vue';
import type { ServerContestConfig } from './ServerState';

type UUID = string;

/**Contest info outside of contests */
export type ContestMetadata = {
    id: string
    type: string
    exclusions: string[]
    maxTeamSize: number
    startTime: number
    endTime: number
}

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
    team: string
    score: number
    penalty: number
}

export class ContestHost {
    readonly id: string;
    readonly type: string;
    readonly config: ServerContestConfig;
    readonly longPolling: {
        readonly contestData: LongPollEventReceiver<Contest>
        readonly contestScoreboards: LongPollEventReceiver<ScoreboardEntry[]>
        readonly contestNotifications: LongPollEventReceiver<never>
        readonly submissionData: Map<UUID, LongPollEventReceiver<Submission[]>>
    };

    constructor(metadata: ContestMetadata) {
        this.id = metadata.id;
        this.type = metadata.type;
        this.config = useServerState().serverConfig.contests[metadata.type]!;
        if (this.config === undefined) throw new TypeError(`Could not load contest as contest type ${metadata.type} not in server config`);
        this.longPolling = {
            contestData: new LongPollEventReceiver<Contest>('GET', `/api/contest/${this.id}/data`),
            contestScoreboards: new LongPollEventReceiver<ScoreboardEntry[]>('GET', `/api/contest/${this.id}/scoreboards`),
            contestNotifications: new LongPollEventReceiver<never>('GET', `/api/contest/${this.id}/notifications`),
            submissionData: new Map()
        };
    }

    // this stuff is still unsure
    // should we use a ref or reactive object?
    // does making the whole class reactive break things? (probably does)
    // if this is taken from res.json() will it break reactivity since the object came from outside?
    get contest(): Contest | undefined {
        return this.longPolling.contestData.ref.value;
    }

    get scoreboard(): ScoreboardEntry[] | undefined {
        return this.longPolling.contestScoreboards.ref.value;
    }

    async getProblem(problemId: UUID): Promise<Problem | Response> {
        const res = await apiFetch('GET', `/api/contest/${this.id}/problem/${problemId}`);
        if (res.ok) return await res.json();
        return res;
    }
    async getProblemIndexed(roundIndex: number, problemIndex: number): Promise<Problem | Response> {
        //best function name ever
        const res = await apiFetch('GET', `/api/contest/${this.id}/problem/${roundIndex}-${problemIndex}`);
        if (res.ok) return await res.json();
        return res;
    }

    async submitProblem(problemId: UUID, solution: File, language: string): Promise<Response> {
        return await apiFetch('POST', `/api/contest/${this.id}/submit/${problemId}`, {
            // idk???????
            file: solution,
            language: language
        });
    }

    getSubmissions(problemId: UUID): Ref<Submission[] | undefined> {
        if (!this.longPolling.submissionData.has(problemId))
            this.longPolling.submissionData.set(problemId, new LongPollEventReceiver('GET', '/api/contest/submissions/' + problemId))
        return this.longPolling.submissionData.get(problemId)!.ref;
    }

    close(): void {
        this.longPolling.contestData.stop();
        this.longPolling.contestScoreboards.stop();
        this.longPolling.contestNotifications.stop();
        this.longPolling.submissionData.forEach((p) => p.stop());
    }
}

const state = reactive<{
    readonly contests: Record<string, ContestHost | undefined>
}>({
    contests: {}
});

// automatically create contest hosts for new contests (debounce just in case it updates a lot)
const runningContests = new LongPollEventReceiver<string[]>('GET', '/api/contest/running');
watch(runningContests.ref, debounce(() => {
    if (runningContests.ref.value !== undefined) {
        for (const contest of runningContests.ref.value) {
            if (state.contests[contest] === undefined) {
                // microoptimization that'll never see any use moment
                (async () => {
                    if ((await apiFetch('GET', '/api/contest/access/' + contest)).ok) {
                        try {
                            const res = await useContestManager().getContestInfo(contest);
                            if (res instanceof Response) throw res;
                            state.contests[contest] = new ContestHost(res);
                        } catch (err) {
                            globalModal().showModal({
                                title: 'Could not connect ContestHost',
                                content: `ContestHost init failed for ${contest}:<br>${err instanceof Response ? `${err.status} - ${await err.text()}` : err}`,
                                color: 'var(--color-2)'
                            });
                        }
                    }
                })();
            }
        }
        for (const contest in state.contests) {
            if (!runningContests.ref.value.includes(contest)) {
                state.contests[contest]!.close();
                state.contests[contest] = undefined;
            }
        }
    }
}, 1000));

export const useContestManager = defineStore('contestManager', {
    state: () => state,
    getters: {
        config: () => {
            const serverState = useServerState();
            return serverState.serverConfig.contests
        },
        runningContests: () => Object.keys(state.contests)
    },
    actions: {
        async getUpcoming(): Promise<string[] | Response> {
            const res = await apiFetch('GET', '/api/contest/upcoming');
            if (res.ok) return await res.json();
            return res;
        },
        async getOpenRegistrations(): Promise<string[] | Response> {
            const res = await apiFetch('GET', '/api/contest/open');
            if (res.ok) return await res.json();
            return res;
        },
        async getContestInfo(contest: string): Promise<ContestMetadata | Response> {
            const res = await apiFetch('GET', '/api/contest/info/' + contest);
            if (res.ok) return await res.json();
            return res;
        }
    }
});
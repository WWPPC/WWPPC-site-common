import { globalModal } from '#/modal';
import { debounce } from '#/util/inputLimiting';
import { apiFetch, LongPollEventReceiver } from '#/util/netUtil';
import { defineStore } from 'pinia';
import { reactive, toRaw, watch } from 'vue';

import { useServerState } from './ServerState';

import type { ServerContestConfig } from './ServerState';
import { useAccountManager } from './AccountManager';

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
    problems: (Problem | string)[]
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
    id: UUID
    time: number
    language: string
    scores: Score[]
    status: ProblemCompletionState
    analysis: boolean
}
export type SubmissionFull = Submission & {
    username: string
    team: string | null
    problemId: UUID
    file: string
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

/**Stores all the data about when/how/number of wa before solving a problem */
export type ProblemSolveStatus = {
    /**round */
    round: number
    /**problem id */
    problem: number
    /**solve time */
    solveTime: number
    /**solved */
    solved: boolean
    /**number of submissions that were not correct */
    incorrectSubmissions: number
}
export type ScoreboardEntry = {
    team: number,
    solveStatus: ProblemSolveStatus[],
    score: number,
    penalty: number
}
export type Scoreboard = {
    scores: ScoreboardEntry[]
    frozen: boolean
}

export class ContestHost {
    readonly id: string;
    readonly type: string;
    readonly config: ServerContestConfig;
    readonly longPolling: {
        readonly contestData: LongPollEventReceiver<Contest>
        readonly contestScoreboards: LongPollEventReceiver<Scoreboard>
        readonly contestNotifications: LongPollEventReceiver<never>
        readonly submissionData: Map<UUID, LongPollEventReceiver<Submission[]>>
    };
    readonly data = reactive<{
        contest: Contest | undefined,
        scoreboard: Scoreboard | undefined
        submissions: Map<UUID, Submission[] | undefined>
    }>({
        contest: undefined,
        scoreboard: undefined,
        submissions: new Map()
    });
    private readonly problemCache: Map<UUID, Problem> = new Map();

    constructor(metadata: ContestMetadata) {
        this.id = metadata.id;
        this.type = metadata.type;
        this.config = useServerState().config.contests[metadata.type]!;
        if (this.config === undefined) throw new TypeError(`Could not load contest as contest type ${metadata.type} not in server config`);
        console.info('Loading contest ' + this.id);
        this.longPolling = {
            contestData: new LongPollEventReceiver<Contest>('GET', `/api/contest/${this.id}/data`),
            contestScoreboards: new LongPollEventReceiver<Scoreboard>('GET', `/api/contest/${this.id}/scoreboards`),
            contestNotifications: new LongPollEventReceiver<never>('GET', `/api/contest/${this.id}/notifications`),
            submissionData: new Map()
        };
        // automatically load new problems in the background
        watch(this.longPolling.contestData.ref, async () => {
            if (this.longPolling.contestData.ref.value === undefined) return;
            // structuredClone prevents reactivity triggering itself when problems are added
            const dat = reactive(structuredClone(toRaw(this.longPolling.contestData.ref.value)));
            for (let i = 0; i < dat.rounds.length; i++) {
                const round = dat.rounds[i];
                for (let j = 0; j < round.problems.length; j++) {
                    const pId = round.problems[j] as string;
                    if (this.problemCache.has(pId)) round.problems[j] = this.problemCache.get(pId)!;
                    else (async () => {
                        // immediately invoked function to async load all problems
                        const res = await apiFetch('GET', `/api/contest/${this.id}/problem/${pId}`);
                        if (res.ok) {
                            const p: Problem = await res.json();
                            dat.rounds[i].problems[j] = p;
                            this.problemCache.set(p.id, p);
                            this.longPolling.submissionData.set(p.id, new LongPollEventReceiver('GET', `/api/contest/${this.id}/submissions/${p.id}`));
                            watch(() => this.longPolling.submissionData.get(p.id)?.value, () => {
                                this.data.submissions.set(p.id, this.longPolling.submissionData.get(p.id)?.value);
                            });
                        } else {
                            const errText = `${res.status} - ${await res.text()}`;
                            console.error(`Failed to fetch problem:\n${errText}`);
                            const modal = globalModal();
                            modal.showModal({
                                title: 'Problem fetch failed',
                                content: `Failed to fetch problem ${pId}.\n${errText}`,
                                color: 'var(--color-2)'
                            });
                        }
                    })();
                }
            }
            this.data.contest = dat;
        }, { immediate: true });
        watch(this.longPolling.contestScoreboards.ref, () => {
            this.data.scoreboard = this.longPolling.contestScoreboards.value
        });
    }

    async submitProblem(problemId: UUID, solution: string, language: string): Promise<Response> {
        return apiFetch('POST', `/api/contest/${this.id}/submit/${problemId}`, {
            file: solution,
            language: language
        });
    }

    async getSubmission(submissionId: UUID): Promise<SubmissionFull | Response> {
        const res = await apiFetch('GET', `/api/contest/${this.id}/submission/${submissionId}`);
        if (res.ok) return res.json();
        return res;
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
const updateRunningContests = debounce(() => {
    if (runningContests.ref.value !== undefined) {
        for (const contest of runningContests.ref.value) {
            if (state.contests[contest] === undefined) {
                // microoptimization that'll never see any use moment
                (async () => {
                    if ((await apiFetch('GET', '/api/contest/access/' + contest)).ok) {
                        try {
                            const res = await useContestManager().getContestInfo(contest);
                            if (res instanceof Response) throw res;
                            //contest type not the contest id (for example "WWPIT" instead of "WWPIT Spring 2025")
                            state.contests[res.type] = new ContestHost(res);
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
                state.contests[contest]?.close();
                state.contests[contest] = undefined;
            }
        }
    }
}, 1000);
watch(runningContests.ref, updateRunningContests);

export const useContestManager = defineStore('contestManager', {
    state: () => state,
    getters: {
        config: () => useServerState().config.contests,
        runningContests: () => Object.keys(state.contests)
    },
    actions: {
        init() {
            const serverState = useServerState();
            const accountManager = useAccountManager();
            // a little bit spaghetti but it should work
            watch(() => accountManager.team?.registrations, () => updateRunningContests());
            watch(() => serverState.loggedIn, () => updateRunningContests())
        },
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
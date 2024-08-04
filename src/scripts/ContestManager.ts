import { globalModal, ModalMode } from '#/modal';
import { defineStore } from 'pinia';
import { io, Socket as SocketIOSocket } from 'socket.io-client';
import { reactive, watch } from 'vue';

import { useAccountManager } from './AccountManager';
import { apiFetch, serverHostname, socket, useServerConnection } from './ServerConnection';

export interface Contest {
    readonly id: string
    rounds: ContestRound[]
    startTime: number
    endTime: number
}
export interface ContestRound {
    readonly contest: string
    readonly number: number
    problems: ContestProblem[]
    startTime: number
    endTime: number
}
export interface ContestProblem {
    readonly id: string
    readonly contest: string
    readonly round: number
    readonly number: number
    name: string
    author: string
    content: string
    constraints: { memory: number, time: number }
    submissions: ContestSubmission[]
    status: ContestProblemCompletionState
}
export interface ContestSubmission {
    time: number
    lang: string
    scores: ContestScore[]
    status: ContestProblemCompletionState
}
export interface ContestScore {
    state: ContestScoreState
    time: number
    memory: number
    subtask: number
}
export enum ContestScoreState {
    CORRECT = 1,
    INCORRECT = 2,
    TIME_LIM_EXCEEDED = 3,
    MEM_LIM_EXCEEDED = 4,
    RUNTIME_ERROR = 5,
    COMPILE_ERROR = 6
}
export enum ContestProblemCompletionState {
    /**Not attempted */
    NOT_UPLOADED = 0,
    /**Uploaded but not graded, can still be changed */
    UPLOADED = 1,
    /**Submitted but not graded, submissions locked */
    SUBMITTED = 2,
    /**Submitted, graded, and passed all subtasks */
    GRADED_PASS = 3,
    /**Submitted, graded, and failed all subtasks */
    GRADED_FAIL = 4,
    /**Submitted, graded, passed at least one subtask and failed at least one subtask */
    GRADED_PARTIAL = 5,
    /**Error loading status */
    ERROR = 6
}
export enum ContestUpdateSubmissionResult {
    SUCCESS = 0,
    FILE_TOO_LARGE = 1,
    LANGUAGE_NOT_ACCEPTABLE = 2,
    PROBLEM_NOT_SUBMITTABLE = 3,
    ERROR = 4,
    NOT_CONNECTED = 5
}
export const completionStateString = (status: ContestProblemCompletionState) => {
    return status == ContestProblemCompletionState.NOT_UPLOADED ? 'Not uploaded' :
        status == ContestProblemCompletionState.UPLOADED ? 'Uploaded' :
            status == ContestProblemCompletionState.SUBMITTED ? 'Submitted' :
                status == ContestProblemCompletionState.GRADED_PASS ? 'Accepted' :
                    status == ContestProblemCompletionState.GRADED_FAIL ? 'Failed' :
                        status == ContestProblemCompletionState.GRADED_PARTIAL ? 'Partially accepted' : 'Error fetching status'
};
export const getUpdateSubmissionMessage = (res: ContestUpdateSubmissionResult): string => {
    return res == ContestUpdateSubmissionResult.SUCCESS ? 'Success' : res == ContestUpdateSubmissionResult.FILE_TOO_LARGE ? 'File too large' : res == ContestUpdateSubmissionResult.LANGUAGE_NOT_ACCEPTABLE ? 'Selected language not allowed' : res == ContestUpdateSubmissionResult.PROBLEM_NOT_SUBMITTABLE ? 'Problem not accepting submissions' : res == ContestUpdateSubmissionResult.ERROR ? 'Database error' : res == ContestUpdateSubmissionResult.NOT_CONNECTED ? 'Not connected to server' : 'Unknown response code (this is a bug?)';
};

export interface ScoreboardEntry {
    username: string
    score: number
}

export interface ContestHostInterface {
    connected: boolean
    contest: Contest | null
    scoreboard: ScoreboardEntry[]
    waitForContestLoad(): Promise<void>
    getProblemData(round: number, number: number): Promise<ContestProblem | null>
    getProblemDataId(id: string): Promise<ContestProblem | null>
    updateSubmission(problemId: string, lang: string, file: string): Promise<ContestUpdateSubmissionResult>
    getSubmissionCode(problemId: string): Promise<string>
}
export class ContestHost implements ContestHostInterface {
    private readonly socket: SocketIOSocket;
    connected = false;
    contest: Contest | null = null;
    scoreboard: ScoreboardEntry[] = [];

    constructor(sid: string, token: string) {
        this.socket = io(`${serverHostname}/contest-${sid}/`, {
            path: '/web-socketio'
        });
        this.socket.connect();
        // mild spaghetti unfortunately
        const modal = globalModal();
        const serverConnection = useServerConnection();
        const accountManager = useAccountManager();
        const onConnectError = (message: string) => {
            console.error(`ContestHost-${sid}: Connection ${message}`);
            this.connected = false;
            modal.showModal({ title: 'ContestHost Connect Error', content: 'ContestHost could not connect to the server! Click "yes" to reload.', mode: ModalMode.INPUT, color: 'var(--color-2)' });
        };
        const onDisconnected = (message: string) => {
            console.error(`ContestHost-${sid}: ${message}`);
            this.connected = false;
            if (serverConnection.connected) modal.showModal({ title: 'ContestHost Disconnected', content: 'ContestHost was disconnected from the server! Click "yes" to reload.', mode: ModalMode.INPUT, color: 'var(--color-2)' });
            this.socket.disconnect();
        };
        this.socket.on('connect', async () => {
            const success = await this.socket.emitWithAck('auth', { username: accountManager.username, token: token });
            if (success === true) {
                console.info(`ContestHost-${sid}: Connected`);
                this.connected = true;
            }
            // if it's not true the server would have disconnected the socket and this would be an error
        });
        this.socket.on('connect_error', (err) => onConnectError('error: ' + err));
        this.socket.on('connect_fail', () => onConnectError('failed'));
        this.socket.on('disconnect', (reason) => onDisconnected('Disconnected: ' + reason));
        this.socket.on('timeout', () => onDisconnected('Timed out'));
        this.socket.on('error', (err) => onDisconnected('Error: ' + err));

        // other listeners
        this.socket.on('contestData', (data: Contest) => {
            this.contest = reactive(data);
        });
        this.socket.on('scoreboard', (data: ScoreboardEntry[]) => {
            this.scoreboard = reactive(data);
        });
    }

    async waitForContestLoad() {
        if (this.contest != null) return;
        await new Promise<void>((resolve) => watch(() => this.contest, () => {
            console.log('a')
            if (this.contest != null) resolve();
        }));
    }

    async getProblemData(round: number, number: number): Promise<ContestProblem | null> {
        return this.contest?.rounds[round]?.problems[number] ?? null;
    }
    async getProblemDataId(id: string): Promise<ContestProblem | null> {
        for (const round of (this.contest?.rounds ?? [])) {
            const p = round.problems.find((p) => p.id === id);
            if (p != undefined) return p;
        }
        return null;
    }
    async updateSubmission(problemId: string, lang: string, file: string): Promise<ContestUpdateSubmissionResult> {
        if (!this.connected) return ContestUpdateSubmissionResult.NOT_CONNECTED;
        return await this.socket.emitWithAck('updateSubmission', { id: problemId, file, lang });
    }
    async getSubmissionCode(problemId: string): Promise<string> {
        if (!this.connected) return '';
        return await this.socket.emitWithAck('getSubmissionCode', { id: problemId });
    }
}

socket.on('joinContestHost', ({ type, sid, token }: { type: string, sid: string, token: string }) => {
    state.contests[type] = reactive(new ContestHost(sid, token));
});

const state = reactive<{
    contests: {
        [key: string]: ContestHostInterface | undefined
    }
}>({
    contests: {}
});

export const useContestManager = defineStore('contestManager', {
    state: () => state,
    getters: {
        config: () => {
            const serverConnection = useServerConnection();
            return serverConnection.serverConfig.contests
        }
    },
    actions: {
        async getContestList(): Promise<string[] | Error> {
            return await apiFetch('GET', '/contestList');
        }
    }
});
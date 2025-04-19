import { apiFetch } from '#/util/netUtil';
import { defineStore } from 'pinia';
import { reactive, ref, watch } from 'vue';

import { RSAencrypt, useServerState } from './ServerState';
import { debounce } from '#/util/inputLimiting';
import { globalModal } from '#/modal';

/**Descriptor for an account (see server docs) */
export type AccountData = {
    username: string
    email: string
    email2: string
    firstName: string
    lastName: string
    displayName: string
    profileImage: string
    bio: string
    organization: string
    grade: number
    experience: number
    languages: string[]
    pastRegistrations: string[]
    team: number | null
}
/**Descriptor for a team (see server docs) - note "join code" is base 36 representation of `id` + `joinKey` */
export type TeamData = {
    id: number
    name: string
    bio: string
    members: string[]
    registrations: string[]
    joinKey: string
}

// dropdown options keep getting reused
export const gradeMaps = [
    { text: 'Pre-High School', value: '8' },
    { text: '9', value: '9' },
    { text: '10', value: '10' },
    { text: '11', value: '11' },
    { text: '12', value: '12' },
    { text: 'College Student', value: '13' },
    { text: 'Graduated', value: '14' }
];
export const experienceMaps = [
    { text: 'Beginner / AP CSA', value: '0' },
    { text: 'USACO Bronze-Silver / CF < 1600', value: '1' },
    { text: 'USACO Gold-Platinum / CF 1600-2100', value: '2' },
    { text: 'USACO Camp / IOI / CF > 2100', value: '3' },
    { text: 'N/A', value: '4' },
];
export const languageMaps = [
    { text: 'Python', value: 'python' },
    { text: 'C', value: 'c' },
    { text: 'C++', value: 'cpp' },
    { text: 'C#', value: 'cs' },
    { text: 'Java', value: 'java' },
    { text: 'JavaScript', value: 'js' },
    { text: 'SQL', value: 'sql' },
    { text: 'Assembly', value: 'asm' },
    { text: 'PHP', value: 'php' },
    { text: 'Swift', value: 'swift' },
    { text: 'Pascal', value: 'pascal' },
    { text: 'Ruby', value: 'ruby' },
    { text: 'Rust', value: 'rust' },
    { text: 'Scratch', value: 'scratch' },
    { text: 'LabVIEW', value: 'g' },
    { text: 'Kotlin', value: 'ktx' },
    { text: 'Lua', value: 'lua' },
    { text: 'Bash', value: 'bash' },
];

// automatically save data
const unsaved = ref(false);
const unsaved2 = ref(false);
const state = reactive<{
    user: AccountData,
    team: TeamData | null,
    writeUserErr: string | undefined,
    writeTeamErr: string | undefined,
    loaded: boolean,
    teamCache: Map<number, TeamData>
}>({
    user: {
        username: '',
        email: '',
        email2: '',
        firstName: '',
        lastName: '',
        displayName: '',
        profileImage: '',
        bio: '',
        organization: '',
        grade: 0,
        experience: 0,
        languages: [],
        pastRegistrations: [],
        team: null
    },
    team: null,
    writeUserErr: undefined,
    writeTeamErr: undefined,
    loaded: false,
    teamCache: new Map()
});

export const useAccountManager = defineStore('accountManager', {
    state: () => state,
    getters: {
        unsavedUserChanges: () => unsaved.value,
        unsavedTeamChanges: () => unsaved2.value
    },
    actions: {
        init() {
            const serverState = useServerState();
            // fetch on connect and unload on disconnect
            watch(() => serverState.loggedIn, () => {
                if (serverState.loggedIn) this.fetchSelf(true, true);
                else this.loaded = false;
            });
            // autosave only when actually loaded  
            const writeUser = debounce(async () => {
                // when loading data unsaved will be set to false, prevents saving data that was just loaded
                if (!unsaved.value) return;
                const res = await apiFetch('PUT', '/api/self/userData', {
                    ...state.user,
                    email: await RSAencrypt(state.user.email),
                    email2: await RSAencrypt(state.user.email2)
                });
                if (res.ok) {
                    unsaved.value = false;
                    state.writeUserErr = undefined;
                } else {
                    state.writeUserErr = res.status + ' - ' + (await res.text());
                }
            }, 3000);
            const writeTeam = debounce(async () => {
                // don't write when null
                if (state.team === null) return;
                // when loading data unsaved will be set to false, prevents saving data that was just loaded
                if (!unsaved2.value) return;
                const res = await apiFetch('PUT', '/api/self/teamData', state.team);
                if (res.ok) {
                    unsaved2.value = false;
                    state.writeTeamErr = undefined;
                } else {
                    state.writeTeamErr = res.status + ' - ' + (await res.text());
                }
            }, 3000);
            watch(() => state.user, () => {
                if (state.loaded) {
                    unsaved.value = true;
                    writeUser();
                }
            }, { deep: true });
            watch(() => state.team, () => {
                if (state.loaded) {
                    unsaved2.value = true;
                    writeTeam();
                }
            }, { deep: true });
            // "your changes may not be saved" warning
            window.addEventListener('beforeunload', (e) => {
                if ((unsaved.value || unsaved2.value) && state.loaded) e.preventDefault();
            });
        },
        // account data
        async fetchAccountData(username: string): Promise<AccountData | Response> {
            const res = await apiFetch('GET', '/api/userData/' + username);
            if (res.ok) return await res.json();
            return res;
        },
        async fetchTeamData(team: number): Promise<TeamData | Response> {
            if (state.teamCache.has(team)) return state.teamCache.get(team)!;
            const res = await apiFetch('GET', '/api/teamData/' + team);
            if (res.ok) {
                state.teamCache.set(team, await res.json());
                return state.teamCache.get(team)!;
            }
            return res;
        },
        async fetchSelf(showErrors: boolean = true, forceReload: boolean = false): Promise<void> {
            this.loaded = false;
            const res = await Promise.all([
                new Promise(async (resolve) => {
                    const res = await apiFetch('GET', '/api/self/userData', undefined, undefined, { cache: forceReload ? 'reload' : 'default' });
                    if (res.ok) {
                        state.user = await res.json();
                        unsaved.value = false;
                        resolve(true);
                    } else if (showErrors) {
                        const errText = `${res.status} - ${await res.text()}`;
                        globalModal().showModal({
                            title: 'Failed to fetch user data',
                            content: errText,
                            color: 'var(--color-2)'
                        });
                        console.error('Failed to fetch user data:\n', errText);
                        resolve(false);
                    }
                }),
                new Promise(async (resolve) => {
                    const res = await apiFetch('GET', '/api/self/teamData', undefined, undefined, { cache: forceReload ? 'reload' : 'default' });
                    if (res.ok) {
                        state.team = await res.json();
                        unsaved2.value = false;
                        resolve(true);
                    } else if (res.status == 404) {
                        // special case if not on team
                        state.team = null;
                        unsaved2.value = false;
                        resolve(true);
                    } else if (showErrors) {
                        const errText = `${res.status} - ${await res.text()}`;
                        globalModal().showModal({
                            title: 'Failed to fetch team data',
                            content: errText,
                            color: 'var(--color-2)'
                        });
                        console.error('Failed to fetch team data:\n', errText);
                        resolve(false);
                    }
                    return false;
                })
            ]);
            // only need to load once - unloading doesn't exist
            if (res.every(r => r)) state.loaded = true;
        },
        async createTeam(teamName: string): Promise<Response> {
            const res = await apiFetch('POST', '/api/self/team', { name: teamName });
            this.fetchSelf(true, true);
            return res;
        },
        async joinTeam(joinCode: string): Promise<Response> {
            const res = await apiFetch('PUT', '/api/self/team', { code: joinCode });
            this.fetchSelf(true, true);
            return res;
        },
        async leaveTeam(): Promise<Response> {
            const res = await apiFetch('DELETE', '/api/self/team');
            this.fetchSelf(true, true);
            return res;
        },
        async kickTeam(username: string): Promise<Response> {
            const res = await apiFetch('DELETE', '/api/self/team/' + username);
            this.fetchSelf(true, true);
            return res;
        },
        async registerContest(contest: string): Promise<Response> {
            const res = await apiFetch('POST', '/api/self/registrations/' + contest);
            this.fetchSelf();
            return res;
        },
        async unregisterContest(contest: string): Promise<Response> {
            const res = await apiFetch('DELETE', '/api/self/registrations/' + contest);
            this.fetchSelf();
            return res;
        }
    }
});
import { defineStore } from 'pinia';
import { reactive, ref, watch } from 'vue';

import { apiFetch, RSAencrypt } from './ServerState';

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
    school: string
    grade: number
    languages: string[]
    pastRegistrations: string[]
    team: string | null
}
/**Descriptor for a team (see server docs) */
export type TeamData = {
    id: string
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
    { text: 'Beginner', value: '0' },
    { text: 'Intermediate', value: '1' },
    { text: 'Advanced', value: '2' },
    { text: 'Legendary', value: '3' },
    { text: '???', value: '4' },
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

const unsaved = ref(false);
const unsaved2 = ref(false);
const state = reactive<{
    user: AccountData,
    team: TeamData
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
        school: '',
        grade: 0,
        languages: [],
        pastRegistrations: [],
        team: null
    },
    team: {
        id: '',
        name: '',
        bio: '',
        members: [],
        registrations: [],
        joinKey: ''
    }
});
watch(state.user, () => unsaved.value = true);
watch(state.team, () => unsaved2.value = true);

export const useAccountManager = defineStore('accountManager', {
    state: () => state,
    getters: {
        unsavedChanges: () => unsaved.value,
        unsavedTeamChanges: () => unsaved2.value
    },
    actions: {
        async login(username: string, password: string): Promise<Response> {
            return await apiFetch('POST', '/auth/login', {
                username: username,
                password: await RSAencrypt(password)
            });
        },
        async signup(username: string, password: string, data: Omit<AccountData, 'username' | 'displayName' | 'profileImage' | 'bio' | 'pastRegistrations' | 'team'>): Promise<Response> {
            return await apiFetch('POST', '/auth/signup', {
                username: username,
                password: await RSAencrypt(password),
                email: await RSAencrypt(data.email),
                email2: await RSAencrypt(data.email2),
                firstName: data.firstName,
                lastName: data.lastName,
                school: data.school,
                grade: data.grade,
                languages: data.languages
            });
        },
        async requestRecovery(username: string, email: string): Promise<Response> {
            return await apiFetch('POST', '/auth/requestRecovery', {
                username: username,
                email: await RSAencrypt(email)
            });
        },
        async recoverAccount(username: string, recoveryPassword: string, newPassword: string): Promise<Response> {
            return await apiFetch('POST', '/auth/recovery', {
                username: username,
                recoveryPassword: await RSAencrypt(recoveryPassword),
                newPassword: await RSAencrypt(newPassword)
            });
        },
        async changePassword(currentPass: string, newPass: string): Promise<Response> {
            return await apiFetch('PUT', '/auth/changePassword', {
                password: await RSAencrypt(currentPass),
                newPassword: await RSAencrypt(newPass)
            })
        },
        async deleteAccount(password: string): Promise<Response> {
            return await apiFetch('DELETE', '/auth/delete', {
                password: await RSAencrypt(password),
            });
        },
        async logout(): Promise<Response> {
            return await apiFetch('DELETE', '/auth/logout');
        }
    }
});
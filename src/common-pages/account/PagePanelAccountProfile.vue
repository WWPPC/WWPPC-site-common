<script setup lang="ts">
import WaitCover from '#/common/WaitCover.vue';
import { AnimateInContainer, PairedGridContainer, TitledCollapsibleContainer, TitledCutCornerContainer } from '#/containers';
import { InputButton, InputTextArea, InputTextBox, InputDropdown, InputCopyButton } from '#/inputs';
import AccountTeamUserDisp from '#/common-components/account/AccountTeamUserDisp.vue';
import { onMounted, ref, watch } from 'vue';
import { globalModal, ModalMode } from '#/modal';
import { useAccountManager, gradeMaps, experienceMaps, languageMaps } from '#/modules/AccountManager';
import { useRoute, useRouter } from 'vue-router';
import { useServerState } from '#/modules/ServerState';
import LoadingSpinner from '#/common/LoadingSpinner.vue';

const router = useRouter();
const route = useRoute();
const modal = globalModal();
const accountManager = useAccountManager();
const serverState = useServerState();

// prevent username being overwritten
const usernameNotEditable = ref('');
const emailNotEditable = ref('');
const joinCodeNotEditable = ref('');
watch(() => accountManager.user.username, () => usernameNotEditable.value = accountManager.user.username, { immediate: true });
watch([() => accountManager.team?.id, () => accountManager.team?.joinKey], () => accountManager.team !== null && (joinCodeNotEditable.value = accountManager.team.id.toString(36) + accountManager.team.joinKey), { immediate: true });
watch(() => accountManager.user.email, () => emailNotEditable.value = accountManager.user.email, { immediate: true });

// oops spaghetti
const gradeInput = ref('');
const experienceInput = ref('');
const languagesInput = ref<string[]>([]);
watch(gradeInput, () => accountManager.user.grade = Number(gradeInput.value));
watch(experienceInput, () => accountManager.user.experience = Number(experienceInput.value));
watch(languagesInput, () => accountManager.user.languages = languagesInput.value);
watch(() => accountManager.user.grade, () => gradeInput.value = accountManager.user.grade?.toString(), { immediate: true });
watch(() => accountManager.user.experience, () => experienceInput.value = accountManager.user.experience?.toString(), { immediate: true });
watch(() => accountManager.user.languages, () => languagesInput.value = accountManager.user.languages, { immediate: true });

const remainingBioCharacters = ref(2048);
const remainingBioCharacters2 = ref(1024);
watch(() => accountManager.user.bio, () => remainingBioCharacters.value = 2048 - accountManager.user.bio?.length);
watch(() => accountManager.team?.bio, () => remainingBioCharacters2.value = 1024 - (accountManager.team?.bio?.length ?? 0));

// teams
const joinTeamCode = ref('');
const createTeamNameInput = ref('');
const showTeamWait = ref(false);
const joinTeam = async () => {
    showTeamWait.value = true;
    const res = await accountManager.joinTeam(joinTeamCode.value);
    showTeamWait.value = false;
    if (res.status == 404 || res.status == 400) modal.showModal({
        title: 'Invalid join code',
        content: 'Verify your join code is correct before trying again',
        color: 'var(--color-3)'
    });
    else if (!res.ok) modal.showModal({
        title: 'Could not join team',
        content: `${res.status} - ${await res.text()}`,
        color: 'var(--color-2)'
    });
};
const leaveTeam = async () => {
    const confirmation = await modal.showModal({ title: 'Leave team?', content: 'You are about to leave the team. Are you sure?', mode: ModalMode.CONFIRM, color: 'yellow' }).result;
    if (!confirmation) return;
    showTeamWait.value = true;
    const res = await accountManager.leaveTeam();
    showTeamWait.value = false;
    if (!res.ok) modal.showModal({
        title: 'Could not leave team',
        content: `${res.status} - ${await res.text()}`,
        color: 'var(--color-2)'
    });
};
const createTeam = async () => {
    if (createTeamNameInput.value.length == 0 || createTeamNameInput.value.length > 32) return;
    showTeamWait.value = true;
    const res = await accountManager.createTeam(createTeamNameInput.value);
    showTeamWait.value = false;
    if (!res.ok) modal.showModal({
        title: 'Could not create team',
        content: `${res.status} - ${await res.text()}`,
        color: 'var(--color-2)'
    });
};

// hides join code when user is not hovering over it
const obfuscatedJoinCode = ref('');
const hovering = ref(false);
const onCodeMouseEnter = () => hovering.value = true;
const onCodeMouseLeave = () => hovering.value = false;
onMounted(() => {
    document.addEventListener('blur', () => hovering.value = false);
});
watch([joinCodeNotEditable, hovering], () => {
    if (hovering.value) obfuscatedJoinCode.value = joinCodeNotEditable.value;
    else obfuscatedJoinCode.value = '*'.repeat(joinCodeNotEditable.value.length ?? 6);
}, { immediate: true });

// danger buttons
const currentPasswordInput = ref('');
const newPasswordInput = ref('');
const changePasswordEnabled = ref(false);
const changePassword = async () => {
    const currPassword = currentPasswordInput.value;
    clearDangerButtons();
    const newPassword = await modal.showModal({
        title: 'Change Password',
        content: 'Enter your new password:',
        mode: ModalMode.QUERY,
        inputType: 'password'
    }).result;
    // also handles "cancel" case
    if (typeof newPassword != 'string' || newPassword.trim() == '') return;
    if (newPassword.length >= 1024) {
        modal.showModal({
            title: 'Password Too Long!',
            content: 'Wow, that\'s a <i>REALLY</i> long password! However, please make it less than 1024 characters!',
            color: 'var(--color-2)'
        });
        return;
    }
    let newPassword2 = await modal.showModal({
        title: 'Change Password',
        content: 'Enter the password again:',
        mode: ModalMode.QUERY,
        inputType: 'password'
    }).result;
    if (typeof newPassword2 != 'string' || newPassword2.trim() == '') return;
    while (newPassword2 !== newPassword) {
        newPassword2 = await modal.showModal({
            title: 'Change Password',
            content: 'Make sure you entered the same password.<br>Enter the password again:',
            mode: ModalMode.QUERY,
            inputType: 'password'
        }).result;
        if (typeof newPassword2 != 'string' || newPassword2.trim() == '') return;
    }
    let spam = true;
    async function modalSpam() {
        while (spam) {
            await modal.showModal({
                title: 'Change Password',
                content: 'Please wait...',
            }).result;
        }
    }
    modalSpam();
    const res = await serverState.changePassword(currPassword, newPassword);
    spam = false;
    modal.cancelAllModals();
    if (res.ok) modal.showModal({
        title: 'Password changed',
        content: 'Your password was succesfully changed',
        color: 'var(--color-1)'
    }).result.then(() => () => router.push('/login?clearQuery=1'));
    else modal.showModal({
        title: 'Password change fail',
        content: `${res.status} - ${await res.text()}`,
        color: 'var(--color-2)'
    });
};
const deleteAccount = async () => {
    const currPassword = currentPasswordInput.value;
    clearDangerButtons();
    if (await modal.showModal({
        title: 'Delete Account',
        content: '',
        color: 'var(--color-2)',
        mode: ModalMode.CONFIRM
    }).result === false) return;
    if (await modal.showModal({
        title: 'Delete Account',
        content: '<span style="color: var(--color-2);">Are you SURE that you want to <b>DELETE</b> your account?</span>',
        color: 'var(--color-2)',
        mode: ModalMode.CONFIRM
    }).result === false) return;
    if (await modal.showModal({
        title: 'Delete Account',
        content: '<span style="color: var(--color-2);">This will <b>PERMANENTLY DELETE ALL DATA</b>, including <b>TEAMS</b>!</span>',
        color: 'var(--color-2)',
        mode: ModalMode.CONFIRM
    }).result === false) return;
    let password2 = await modal.showModal({
        title: 'Delete Account',
        content: '<span style="color: var(--color-2);">Enter your password to confirm <b>PERMANENT DELETION</b> of your account</span>',
        color: 'var(--color-2)',
        mode: ModalMode.QUERY,
        inputType: 'password'
    }).result;
    if (password2 === null) return;
    while (password2 !== currPassword) {
        password2 = await modal.showModal({
            title: 'Delete Account',
            content: '<span style="color: var(--color-2);">Passwords do not match.<br>Enter your password to confirm <b>PERMANENT DELETION</b> of your account</span>',
            color: 'var(--color-2)',
            mode: ModalMode.QUERY,
            inputType: 'password'
        }).result;
        if (password2 === null) return;
    }
    let spam = true;
    async function modalSpam() {
        while (spam) {
            await modal.showModal({
                title: 'Delete Account',
                content: 'Please wait...',
            }).result;
        }
    }
    modalSpam();
    const res = await serverState.deleteAccount(currPassword);
    spam = false;
    modal.cancelAllModals();
    if (res.ok) router.push({ path: '/' });
    else modal.showModal({
        title: 'Password change fail',
        content: `${res.status} - ${await res.text()}`,
        color: 'var(--color-2)'
    });
    const res2 = await serverState.logout();
    if (!res2.ok) modal.showModal({
        title: 'Failed to log out',
        content: `${res2.status} - ${await res2.text()}`,
        color: 'var(--color-2)'
    });
};
const clearDangerButtons = () => {
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    changePasswordEnabled.value = false;
};
onMounted(clearDangerButtons);
</script>

<template>
    <AnimateInContainer type="slideUp" :delay=100>
        <TitledCutCornerContainer title="Profile" hover-animation="lift">
            <form action="javascript:void(0)">
                <PairedGridContainer width=100%>
                    <span>Display Name:</span>
                    <InputTextBox v-model=accountManager.user.displayName maxlength="32" width="var(--fwidth)" title="Name used in profile, contests, etc." required></InputTextBox>
                    <span>Name:</span>
                    <span class="nowrap">
                        <InputTextBox v-model=accountManager.user.firstName maxlength="32" width="var(--hwidth)" title="First name" required></InputTextBox>
                        <InputTextBox v-model=accountManager.user.lastName maxlength="32" width="var(--hwidth)" title="Last name" required></InputTextBox>
                    </span>
                    <span>School/Organization:</span>
                    <InputTextBox v-model=accountManager.user.organization maxlength="64" width="var(--fwidth)" title="Your organization name" required></InputTextBox>
                    <span>Grade/Experience:</span>
                    <span class="nowrap">
                        <InputDropdown v-model=gradeInput width="var(--hwidth)" :items="gradeMaps" title="Your current grade level" required></InputDropdown>
                        <InputDropdown v-model=experienceInput width="var(--hwidth)" :items="experienceMaps" title="Your experience level with competitive programming" required></InputDropdown>
                    </span>
                    <span>Known Languages:<br>(Use CTRL/SHIFT)</span>
                    <InputDropdown v-model=languagesInput width="var(--fwidth)" :items="languageMaps" title="What programming languages have you used in contest?" height="80px" multiple></InputDropdown>
                    <span>Biography<br>({{ remainingBioCharacters }} chars):</span>
                    <InputTextArea v-model=accountManager.user.bio width="var(--fwidth)" min-height="2em" height="4em" max-height="20em" maxlength="2048" placeholder="Describe yourself in a few short sentences!" resize="vertical"></InputTextArea>
                </PairedGridContainer>
            </form>
            <WaitCover text="Loading..." :show="!accountManager.loaded && route.query.ignore_server === undefined"></WaitCover>
            <div class="profileSaveIndicator" v-if="accountManager.unsavedUserChanges">
                <LoadingSpinner width="1em" height="1em"></LoadingSpinner>
                Saving...
            </div>
        </TitledCutCornerContainer>
    </AnimateInContainer>
    <AnimateInContainer type="slideUp" :delay=200>
        <TitledCutCornerContainer title="Team" hover-animation="lift">
            <div v-if="accountManager.team == null">
                <div class="profileTeamSection">
                    <h3>Join a team!</h3>
                    <form class="nowrap" action="javascript:void(0)" @submit="joinTeam">
                        <InputTextBox v-model=joinTeamCode title="Ask team creator for join code!" placeholder="Join code"></InputTextBox>
                        <InputButton type="submit" text="Join" :disabled="joinTeamCode.length == 0"></InputButton>
                    </form>
                    <br>
                    <i>Joining will sync your registrations to the team</i>
                </div>
                <p>OR</p>
                <div class="profileTeamSection">
                    <h3>Create Team</h3>
                    <form class="nowrap" action="javascript:void(0)" @submit="createTeam">
                        <InputTextBox v-model=createTeamNameInput title="Name for your new team" placeholder="Team name" maxlength="32"></InputTextBox>
                        <InputButton type="submit" text="Create" :disabled="createTeamNameInput.length == 0"></InputButton>
                    </form>
                </div>
            </div>
            <div class="profileTeamSection" v-else>
                <h3>Your Team</h3>
                <div class="profileTeamGrid">
                    <div class="profileTeamList">
                        <AccountTeamUserDisp v-for="user in accountManager.team?.members" :key="user" :user="user" :team="accountManager.user.team!" allow-kick></AccountTeamUserDisp>
                    </div>
                    <form action="javascript:void(0)">
                        <PairedGridContainer width="100%">
                            <span>Team Name:</span>
                            <InputTextBox v-model=accountManager.team.name maxlength="32" width="var(--fwidth)" title="Collective team name" placeholder="Team Name"></InputTextBox>
                            <span>Biography<br>({{ remainingBioCharacters2 }} chars):</span>
                            <InputTextArea v-model=accountManager.team.bio width="var(--fwidth)" min-height="2em" height="4em" max-height="20em" maxlength="1024" placeholder="Describe your team in a few short sentences!" resize="vertical"></InputTextArea>
                        </PairedGridContainer>
                    </form>
                </div>
            </div>
            <div class="profileTeamSection" v-if="accountManager.team">
                <form class="nowrap" action="javascript:void(0)">
                    <span>Join Code:</span>
                    <InputTextBox v-model="obfuscatedJoinCode" autocomplete="off" disabled @mouseenter="onCodeMouseEnter" @mouseleave="onCodeMouseLeave"></InputTextBox>
                    <InputCopyButton :value="joinCodeNotEditable ?? ''"></InputCopyButton>
                </form>
            </div>
            <div class="profileTeamSection" v-if="accountManager.team && accountManager.team !== null">
                <InputButton text="Leave Team" color="var(--color-2)" glitch-on-mount @click="leaveTeam"></InputButton>
            </div>
            <WaitCover text="Please wait..." :show="showTeamWait && route.query.ignore_server === undefined"></WaitCover>
            <div class="profileSaveIndicator" v-if="accountManager.unsavedTeamChanges">
                <LoadingSpinner width="1em" height="1em"></LoadingSpinner>
                Saving...
            </div>
        </TitledCutCornerContainer>
    </AnimateInContainer>
    <AnimateInContainer type="slideUp" :delay=300>
        <TitledCutCornerContainer title="Account" hover-animation="lift">
            <PairedGridContainer>
                <span>Username:</span>
                <InputTextBox v-model=usernameNotEditable width="var(--fwidth)" title="Your unique username (you cannot edit this)" disabled></InputTextBox>
                <span>Email:</span>
                <InputTextBox v-model=emailNotEditable width="var(--fwidth)" title="Email used to update you on contests, password changes, etc. (you cannot edit this)" disabled></InputTextBox>
            </PairedGridContainer>
            <br>
            <TitledCollapsibleContainer title="Danger buttons" font-size="var(--font-medium)" border-color="var(--color-2)" @click="clearDangerButtons" start-collapsed>
                <!-- useless form -->
                <form class="profileDangerButtons" action="javascript:void(0)">
                    <div style="text-align: right; align-content: center; font-size: var(--font-18);">Enter password:</div>
                    <InputTextBox type="password" v-model=currentPasswordInput placeholder="Current password"></InputTextBox>
                    <InputButton text="CHANGE PASSWORD" color="var(--color-2)" @click="changePassword" :disabled="currentPasswordInput.length == 0"></InputButton>
                    <InputButton text="DELETE ACCOUNT" color="var(--color-2)" @click="deleteAccount" :disabled="currentPasswordInput.length == 0"></InputButton>
                </form>
            </TitledCollapsibleContainer>
        </TitledCutCornerContainer>
    </AnimateInContainer>
</template>

<style scoped>
* {
    --fwidth: min(calc(100% - 4px), 400px);
    --hwidth: min(calc(50% - 6px), 196px);
}

.nowrap {
    width: 100%;
    text-wrap: nowrap;
    word-wrap: nowrap;
}

.profileTeamSection {
    background-color: #222;
    margin-bottom: 8px;
    padding: 4px 8px;
    border-radius: 8px;
}

.profileTeamGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    row-gap: 16px;
    column-gap: 16px;
}

.profileTeamList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    row-gap: 8px;
    column-gap: 8px;
}

.profileSaveButton {
    position: absolute;
    bottom: 12px;
    right: 8px;
}

.profileDangerButtons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 12px;
    row-gap: 12px;
    width: 100%;
}

.profileDangerButtons>* {
    width: 100%;
    min-width: 0px;
    margin: 0px 0px;
}

.profileSaveIndicator {
    display: flex;
    position: fixed;
    bottom: 0px;
    right: 0px;
    margin: 0.5em;
    text-wrap: none;
    align-items: center;
    font-size: var(--font-small);
    column-gap: 0.5em;
    pointer-events: none;
}
</style>
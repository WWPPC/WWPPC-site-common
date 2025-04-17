<script setup lang="ts">
import { PanelBody, PanelHeader, PanelMain, PanelNavLargeLogo, PanelView } from '#/panels';
import { InputButton, InputTextBox } from '#/inputs';
import LoadingCover from '#/common/LoadingCover.vue';
import WaitCover from '#/common/WaitCover.vue';
import { nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { globalModal } from '#/modal';
import { useServerState } from '#/modules/ServerState';
import { useAccountManager } from '#/modules/AccountManager';

const route = useRoute();
const router = useRouter();

const modal = globalModal();
const serverState = useServerState();
const accountManager = useAccountManager();

const usernameInput = ref('');
const passwordInput = ref('');
const passwordInput2 = ref('');
const recoveryPassword = ref('');
const loginError = ref('');
const showRecoveryWait = ref(false);
const attemptedRecovery = ref(false);
watch(() => route.query, async () => {
    await nextTick();
    usernameInput.value = route.query.user?.toString() ?? '';
    recoveryPassword.value = route.query.pass?.toString() ?? '';
});

const validateCredentials = (checkPass: boolean = true): boolean => {
    if (!serverState.connected) {
        loginError.value = 'Server connection failed';
        return false;
    }
    if (usernameInput.value.length == 0) {
        loginError.value = 'Please enter username';
        return false;
    }
    if (usernameInput.value.length > 16) {
        loginError.value = 'Username must be less than 16 characters in length';
        return false;
    }
    if (!/^[a-z0-9-_]+$/.test(usernameInput.value)) {
        loginError.value = 'Username must contain only lowercase letters (a-z), numbers (0-9), underscores ("_"), and dashes ("-").';
        return false;
    }
    if (!checkPass) return true;
    if (passwordInput.value.length == 0) {
        loginError.value = 'Please enter a password';
        return false;
    }
    if (passwordInput.value.length > 1024) {
        loginError.value = 'Password must be less than 1024 characters in length';
    }
    return true;
};
const attemptRecovery = async () => {
    if (!validateCredentials()) return;
    if (passwordInput.value != passwordInput2.value) {
        loginError.value = 'Passwords must match';
        return;
    }
    showRecoveryWait.value = true;
    attemptedRecovery.value = true;
    const res = await serverState.recoverAccount(usernameInput.value, recoveryPassword.value, passwordInput.value);
    showRecoveryWait.value = false;
    if (res.ok) {
        modal.showModal({
            title: 'Password changed',
            content: 'Your password has been changed.',
            color: 'var(--color-1)'
        }).result.then(() => router.push('/login?clearQuery=1'));
    } else {
        modal.showModal({
            title: 'Recovery failed:',
            content: `${res.status} - ${await res.text()}`,
            color: 'var(--color-2)'
        });
    }
};
</script>

<template>
    <PanelView name="recovery" title="WWPPC">
        <PanelHeader>
            <PanelNavLargeLogo></PanelNavLargeLogo>
        </PanelHeader>
        <PanelMain>
            <PanelBody name="default" title="Account Recovery" is-default>
                <div class="centered">
                    <div class="recoveryVertical">
                        <h1 class="recoveryVerticalHeader" style="margin-top: 32px;">Account Recovery</h1>
                        <form class="recoveryVertical" action="javascript:void(0)" @submit="attemptRecovery">
                            <input type="password" autocomplete="off" disabled :value="recoveryPassword" style="display: none;">
                            <InputTextBox :value="usernameInput" id="username" placeholder="Username" style="margin-bottom: 8px;" width="208px" title="Username" maxlength="16" autocomplete="off" autocapitalize="off" required disabled></InputTextBox>
                            <InputTextBox v-model="passwordInput" id="password" placeholder="New password" type="password" style="margin-bottom: 8px;" width="208px" title="New password" maxlength="1024" autocomplete="new-password" autocapitalize="off" required></InputTextBox>
                            <InputTextBox v-model="passwordInput2" placeholder="Repeat password" type="password" style="margin-bottom: 8px;" width="208px" title="New password" maxlength="1024" autocomplete="off" autocapitalize="off" required></InputTextBox>
                            <InputButton text="Reset password" type="submit" width="208px" title="Log in" glitchOnMount :disabled="attemptedRecovery || showRecoveryWait || usernameInput.trim() == '' || recoveryPassword == '' || passwordInput == '' || passwordInput2 == '' || passwordInput != passwordInput2"></InputButton>
                        </form>
                    </div>
                </div>
                <WaitCover text="Please wait..." :show="showRecoveryWait"></WaitCover>
                <LoadingCover text="Connecting..." :show="!serverState.connected"></LoadingCover>
            </PanelBody>
        </PanelMain>
    </PanelView>
</template>

<style scoped>
.recoveryVertical {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: max(300px, 40vw);
}

.recoveryVerticalHeader {
    margin-top: -16px;
    font-size: 7vh;
}
</style>
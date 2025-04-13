<script setup lang="ts">
import { PanelBody, PanelHeader, PanelMain, PanelNavLargeLogo, PanelView } from '#/panels';
import { InputButton, InputTextBox } from '#/inputs';
import LoadingCover from '#/common/LoadingCover.vue';
import WaitCover from '#/common/WaitCover.vue';
import { nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { globalModal } from '#/modal';
import { useAccountManager } from '#/modules/AccountManager';
import { useLoginEnforcer } from '#/modules/LoginEnforcer';

const route = useRoute();
const router = useRouter();

const modal = globalModal();
const accountManager = useAccountManager();
const loginEnforcer = useLoginEnforcer();

const usernameInput = ref('');
const passwordInput = ref('');
const passwordInput2 = ref('');
const recoveryPassword = ref('');
const showRecoveryWait = ref(false);
const attemptedRecovery = ref(false);
watch(() => route.query, async () => {
    await nextTick();
    usernameInput.value = route.query.user?.toString() ?? '';
    recoveryPassword.value = route.query.pass?.toString() ?? '';
});

const attemptRecovery = async () => {
    if (!validateCredentials(usernameInput.value, passwordInput.value) || passwordInput.value != passwordInput2.value) return;
    showRecoveryWait.value = true;
    attemptedRecovery.value = true;
    const res = await accountManager.recoverAccount(usernameInput.value, recoveryPassword.value, passwordInput.value);
    showRecoveryWait.value = false;
    if (res == 0) modal.showModal({ title: 'Password changed', content: 'Your password has been changed.', color: 'lime'}).result.then(() => window.location.reload());
    else modal.showModal({ title: 'Recovery failed:', content: getAccountOpMessage(res), color: 'red' });
    router.push('/login?clearQuery=1');
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
                <WaitCover text="Please wait..." :show=showRecoveryWait></WaitCover>
                <LoadingCover text="Connecting..."></LoadingCover>
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
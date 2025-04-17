<script setup lang="ts">
import { AnimateInContainer, TitledCutCornerContainer } from '#/containers';
import { InputButton, InputDropdown } from '#/inputs';
import WaitCover from '#/common/WaitCover.vue';
import { ref, watch } from 'vue';
import { globalModal } from '#/modal';
import { useAccountManager } from '#/modules/AccountManager';
import { useContestManager } from '#/modules/ContestManager';

const accountManager = useAccountManager();
const contestManager = useContestManager();
const modal = globalModal();

const contestList = ref<{ text: string, value: string }[]>([]);
const registrationSelected = ref('');

const updateAvailableContestList = async () => {
    const res = await contestManager.getOpenRegistrations();
    if (!Array.isArray(res)) {
        contestList.value = [{ text: 'Failed to load contests', value: '' }];
        return;
    }
    contestList.value = res.filter((v) => {
        return !accountManager.team?.registrations.includes(v) && !accountManager.user.pastRegistrations.includes(v)
    }).map((c) => ({ text: c, value: c })) ?? [];
};
watch(() => accountManager.team?.registrations, updateAvailableContestList, { immediate: true });

const showRegisterWait = ref(false);
const attemptRegister = async () => {
    if (registrationSelected.value == '') return;
    showRegisterWait.value = true;
    const res = await accountManager.registerContest(registrationSelected.value);
    if (!res.ok) modal.showModal({
        title: 'Could not register',
        content: `${res.status} - ${await res.text()}`,
        color: 'var(--color-2)'
    });
    showRegisterWait.value = false;
};
const attemptUnregister = async (registration: string) => {
    showRegisterWait.value = true;
    const res = await accountManager.unregisterContest(registration);
    if (!res.ok) modal.showModal({
        title: 'Could not unregister',
        content: `${res.status} - ${await res.text()}`,
        color: 'var(--color-2)'
    });
    showRegisterWait.value = false;
};
</script>

<template>
    <AnimateInContainer type="slideUp" :delay=100>
        <TitledCutCornerContainer title="Your contests" hover-animation="lift">
            <div class="roundedBlock" v-if="accountManager.team?.registrations && accountManager.team.registrations.length > 0">
                <h3>Upcoming</h3>
                <AnimateInContainer type="fade" v-for="(reg, i) in accountManager.team.registrations" :key="i" :delay="i * 200" single>
                    <div class="registrationBlock">
                        <div class="registrationStatusDotUpcoming"></div>
                        {{ reg }}
                        <InputButton class="registrationUnregister" text="Unregister" color="var(--color-2)" @click="attemptUnregister(reg)" glitch-on-mount></InputButton>
                    </div>
                </AnimateInContainer>
            </div>
            <div class="roundedBlock" v-if="accountManager.user.pastRegistrations.length > 0">
                <h3>Past</h3>
                <AnimateInContainer type="fade" v-for="(reg, i) in accountManager.user.pastRegistrations" :key="i" :delay="i * 200" single>
                    <div class="registrationBlock">
                        <div class="registrationStatusDotCompleted"></div>
                        {{ reg }}
                    </div>
                </AnimateInContainer>
            </div>
            <h3 v-if="accountManager.team?.registrations.length == 0 && accountManager.user.pastRegistrations.length == 0">
                You are not registered for any contests!
            </h3>
            <WaitCover text="Please wait..." :show="showRegisterWait"></WaitCover>
        </TitledCutCornerContainer>
    </AnimateInContainer>
    <AnimateInContainer type="slideUp" :delay=200>
        <TitledCutCornerContainer title="Register" hover-animation="lift">
            <InputDropdown :items="contestList" v-model="registrationSelected" width="200px"></InputDropdown>
            <InputButton text="Register" :disabled="registrationSelected == ''" @click="attemptRegister"></InputButton>
            <br>
            <span>Registering will also register your entire team!</span>
            <WaitCover text="Please wait..." :show="showRegisterWait"></WaitCover>
        </TitledCutCornerContainer>
    </AnimateInContainer>
</template>

<style scoped>
.registrationBlock {
    display: grid;
    grid-template-columns: 1em 1fr min-content;
    column-gap: 8px;
    font-size: var(--font-medium);
    line-height: 1em;
    box-sizing: border-box;
    width: 100%;
    padding: 8px 8px;
    margin: 8px 0px;
    border-radius: 8px;
    background-color: #222;
    align-items: center;
}

.registrationStatusDotUpcoming,
.registrationStatusDotCompleted {
    width: 1em;
    height: 1em;
    min-width: 1em;
    min-height: 1em;
    border-radius: 50%;
}

.registrationStatusDotUpcoming {
    background-color: cyan;
}

.registrationStatusDotCompleted {
    background-color: lime;
}

.registrationUnregister {
    opacity: 0;
    transition: 50ms linear opacity;
}

.registrationBlock:hover>.registrationUnregister {
    opacity: 1;
}
</style>
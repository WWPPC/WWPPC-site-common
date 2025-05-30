<script setup lang="ts">
import LoadingCover from '#/common/LoadingCover.vue';
import NotFound from '#/common/NotFound.vue';
import OnScreenHook from '#/common/OnScreenHook.vue';
import { AnimateInContainer, CutCornerContainer, PairedGridContainer, TitledCutCornerContainer, TitledDoubleCutCornerContainer } from '#/containers';
import { useRoute } from 'vue-router';
import { experienceMaps, gradeMaps, languageMaps, type TeamData, useAccountManager, type AccountData } from '#/modules/AccountManager';
import { onMounted, ref, watch } from 'vue';
import { InputDropdown, InputTextBox } from '#/inputs';
import { autoFlipTextTransition, autoGlitchTextTransition } from '#/text';
import { setTitlePanel } from '#/title';
import AccountTeamUserDisp from '#/common-components/account/AccountTeamUserDisp.vue';
import { globalModal } from '#/modal';

const route = useRoute();

const modal = globalModal();
const accountManager = useAccountManager();

const userData = ref<AccountData | null>(null);
const teamData = ref<TeamData | null>(null);
const showLoading = ref(true);
const loadUserData = async () => {
    userData.value = null;
    teamData.value = null;
    showLoading.value = true;
    if (route.params.userView != null) {
        const accRes = await accountManager.fetchAccountData(route.params.userView.toString());
        if (accRes instanceof Response) {
            if (accRes.status != 404) {
                modal.showModal({ title: accRes.statusText, content: "Could not fetch user " + accRes.status, color: "var(--color-2)" });
            }
            //@spsquared how do i make this show the 404 page
            return;
        }
        userData.value = accRes;
        if (userData.value.team !== null) {
            const teamRes = await accountManager.fetchTeamData(userData.value.team);
            if (teamRes instanceof Response) {
                if (teamRes.status != 404) {
                    modal.showModal({ title: teamRes.statusText, content: "Could not fetch team " + teamRes.status, color: "var(--color-2)" });
                }
                return;
            }
            teamData.value = teamRes;
        }
    }
    showLoading.value = false;
};
watch(() => route.params, () => {
    if (route.params.page != 'user' || route.query.ignore_server !== undefined) return;
    loadUserData();
});
const username = autoGlitchTextTransition(() => '@' + (userData.value?.username ?? ''), 20, 2, 10, 3, true);
const displayName = autoGlitchTextTransition(() => userData.value?.displayName ?? '', 20, 2, 10, 3, true);
const biography = autoFlipTextTransition(() => userData.value?.bio ?? '', 20, 4);
const teamName = autoGlitchTextTransition(() => teamData.value?.name ?? '', 20, 2, 10, 3, true);
const teamBio = autoFlipTextTransition(() => teamData.value?.bio ?? '', 20, 4);
const grade = ref('');
const experience = ref('');
const languages = ref<string[]>([]);
watch(userData, () => {
    grade.value = userData.value?.grade.toString() ?? '';
    experience.value = userData.value?.experience.toString() ?? '';
    languages.value = userData.value?.languages ?? [];
    if (userData.value) setTitlePanel(userData.value.displayName);
});
onMounted(loadUserData);

const largeHeader = ref(true);
</script>

<template>
    <div class="reverse" v-show="!showLoading">
        <div class="vStack">
            <OnScreenHook @change="(v) => largeHeader = v" offset-top="-16px"></OnScreenHook>
            <div style="height: 30vh;"></div>
            <div class="grid">
                <TitledCutCornerContainer title="Profile" hover-animation="lift" align="center" height="100%" style="grid-row: span 2;" flipped>
                    <PairedGridContainer style="font-size: var(--font-small);">
                        <span>Name:</span>
                        <InputTextBox :value="userData?.firstName + ' ' + userData?.lastName" width="var(--fwidth)" disabled></InputTextBox>
                        <span>School / Organization:</span>
                        <InputTextBox :value="userData?.organization" width="var(--fwidth)" disabled></InputTextBox>
                        <span>Grade Level:</span>
                        <InputDropdown v-model="grade" width="var(--fwidth)" :items="gradeMaps" disabled></InputDropdown>
                        <span>Experience Level:</span>
                        <InputDropdown v-model="experience" width="var(--fwidth)" :items="experienceMaps" disabled></InputDropdown>
                        <span>Familiar Languages:</span>
                        <InputDropdown v-model="languages" width="var(--fwidth)" height="6em" :items="languageMaps" multiple disabled></InputDropdown>
                    </PairedGridContainer>
                </TitledCutCornerContainer>
                <TitledDoubleCutCornerContainer title="Biography" hover-animation="lift" align="center" height="100%" flipped>
                    <p>
                        {{ biography }}
                    </p>
                </TitledDoubleCutCornerContainer>
                <TitledCutCornerContainer title="Team" hover-animation="lift" align="center" height="100%" style="grid-row: span 2; max-height: 80vh;">
                    <div class="userViewTeamGrid" v-if="teamData !== null">
                        <div class="userViewTeamList">
                            <AccountTeamUserDisp v-for="user in teamData.members" :key="user" :user="user" :team="userData!.team!"></AccountTeamUserDisp>
                        </div>
                        <div>
                            <TitledCutCornerContainer :title="teamName" vertical-flipped>
                                {{ teamBio }}
                            </TitledCutCornerContainer>
                        </div>
                    </div>
                    <div v-else>
                        <!-- wow a v-else how rare -->
                        {{ userData?.displayName }} is not on a team.
                    </div>
                </TitledCutCornerContainer>
            </div>
        </div>
        <div class="userViewProfileHeaderWrapper">
            <div class="centered">
                <div class="userViewProfileHeader">
                    <img class="userViewProfileImg" :src="userData?.profileImage">
                    <span class="userViewDisplayName">{{ displayName }}</span>
                    <span class="userViewUsername">{{ username }}</span>
                    <CutCornerContainer class="userViewProfileRegistrations">
                        <div class="userViewProfileRegistrationsHeader">
                            <h3>Registrations</h3>
                        </div>
                        <AnimateInContainer type="slideUp" v-for="(reg, i) in teamData?.registrations" :key="i" :delay="i * 200" single>
                            <span class="registrationLine">
                                <div class="registrationStatusDotUpcoming"></div>
                                {{ reg }}
                            </span>
                        </AnimateInContainer>
                        <AnimateInContainer type="fade" v-for="(reg, i) in userData?.pastRegistrations" :key="i" :delay="i * 200" single>
                            <span class="registrationLine">
                                <div class="registrationStatusDotCompleted"></div>
                                {{ reg }}
                            </span>
                        </AnimateInContainer>
                        <span v-if="!teamData?.registrations.length && !userData?.pastRegistrations.length">
                            This user is not registered for any contests
                        </span>
                    </CutCornerContainer>
                </div>
            </div>
        </div>
    </div>
    <NotFound v-if="route.params.userView == undefined || userData === null"></NotFound>
    <LoadingCover text="Loading..." :show="showLoading"></LoadingCover>
</template>

<style scoped>
* {
    --fwidth: calc(100% - 16px);
    --hwidth: calc(50% - 24px)
}

.reverse {
    display: flex;
    flex-direction: column-reverse;
}

.userViewProfileHeaderWrapper {
    position: sticky;
    top: 0px;
}

.userViewProfileHeader {
    display: grid;
    --image-size: v-bind("largeHeader ? 'min(25vw, 25vh)' : 'min(15vw, 15vh)'");
    grid-template-columns: 1fr min-content minmax(min-content, max-content) minmax(20vw, 2fr) 1fr;
    grid-template-rows: 1fr 4fr 4fr 1fr;
    column-gap: 16px;
    position: absolute;
    top: -16px;
    left: -16px;
    width: calc(100% + 32px);
    min-height: v-bind("largeHeader ? '30vh' : '20vh'");
    max-height: v-bind("largeHeader ? '30vh' : '20vh'");
    border-bottom: 4px solid white;
    background-color: black;
    transition: 500ms ease max-height, 500ms ease min-height;
}

.userViewProfileImg {
    grid-row: 2 / 4;
    grid-column: 2;
    box-sizing: border-box;
    min-width: var(--image-size);
    min-height: var(--image-size);
    max-width: var(--image-size);
    max-height: var(--image-size);
    transition: 500ms ease max-height, 500ms ease min-height, 500ms ease max-width, 500ms ease min-width;
    border: 4px solid white;
    border-radius: 50%;
}

.userViewDisplayName {
    grid-row: 2;
    grid-column: 3;
    min-width: 0px;
    font-size: min(4vw, 5vh);
    align-self: end;
    font-family: 'Source Code Pro', Courier, monospace;
}

.userViewUsername {
    grid-row: 3;
    grid-column: 3;
    font-size: min(3.5vw, 4vh);
    font-family: 'Source Code Pro', Courier, monospace;
}

.userViewProfileRegistrations {
    grid-row: 2 / 4;
    grid-column: 4;
    overscroll-behavior: contain;
}

.userViewProfileRegistrationsHeader {
    position: sticky;
    top: 0px;
    background-color: black;
    width: calc(100% + 24px);
    margin-top: -6px;
    margin-left: 8px;
    padding-top: 2px;
    transform: translate(-12px, -12px);
    box-shadow: 0px 6px 8px black;
    z-index: 1;
}

.registrationLine {
    display: flex;
    flex-direction: row;
    margin: 4px 0px;
    column-gap: 4px;
    font-size: var(--font-medium);
    line-height: 1em;
    text-wrap: nowrap;
    word-wrap: nowrap;
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

@media (max-width: 700px) {
    .userViewProfileHeader {
        grid-template-columns: 1fr min-content min-content 1fr;
        grid-template-rows: 1fr 4fr 4fr 10fr 1fr;
    }

    .userViewProfileRegistrations {
        grid-row: 4;
        grid-column: 2 / 4;
    }
}

.vStack {
    display: flex;
    flex-direction: column;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    grid-auto-flow: row dense;
    margin: 12px 8px;
    align-items: center;
    justify-items: stretch;
    row-gap: 24px;
    column-gap: 24px;
}

.userViewTeamGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    row-gap: 16px;
    column-gap: 16px;
}

.userViewTeamList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    row-gap: 8px;
    column-gap: 8px;
}
</style>
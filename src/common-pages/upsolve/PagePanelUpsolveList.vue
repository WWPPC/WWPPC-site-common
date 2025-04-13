<script setup lang="ts">
// import ArchiveListContest from '@/components/archive/archiveList/ArchiveListContest.vue';
// import ArchiveListRound from '@/components/archive/archiveList/ArchiveListRound.vue';
// import { AngledTitledContainer, AnimateInContainer } from '#/containers';
// import LoadingCover from '#/common/LoadingCover.vue';
// import { onMounted, ref, watch } from 'vue';
// import { useRoute, useRouter } from 'vue-router';
// import { globalModal } from '#/modal';
// import { useServerState } from '#/modules/ServerState';
// import { useUpsolveManager } from '#/modules/UpsolveManager';
// import type { UpsolveContest, UpsolveRound } from '#/modules/UpsolveManager';

// const modal = globalModal();
// const route = useRoute();
// const router = useRouter();
// const serverState = useServerState();
// const upsolveManager = useUpsolveManager();

// const contestList = ref<string[] | null>();
// const contest = ref<UpsolveContest | null>();
// const round = ref<UpsolveRound | null>();
// const load = async () => {
//     if (route.params.archiveProblem !== undefined) {
//         router.push(`/contest/archiveView/${route.params.archiveContest}/${route.params.archiveRound}/${route.params.archiveProblem}`);
//     } else if (route.params.archiveRound !== undefined) {
//         if (isNaN(Number(route.params.archiveRound))) return;
//         const data = await upsolveManager.getRoundData(route.params.archiveContest.toString(), Number(route.params.archiveRound));
//         if (data instanceof Error) {
//             modal.showModal({ title: data.message, content: 'Could not load round', color: 'red' });
//             return;
//         }
//         round.value = data;
//         contest.value = null;
//         contestList.value = null;
//     } else if (route.params.archiveContest !== undefined) {
//         const data = await upsolveManager.getContestData(route.params.archiveContest.toString());
//         if (data instanceof Error) {
//             modal.showModal({ title: data.message, content: 'Could not load contest', color: 'red' });
//             return;
//         }
//         contest.value = data;
//         round.value = null;
//         contestList.value = null;
//     } else {
//         const data = await upsolveManager.getContestList();
//         if (data instanceof Error) {
//             modal.showModal({ title: data.message, content: 'Could not load contest list', color: 'red' });
//             return;
//         }
//         contestList.value = data;
//         round.value = null;
//         contest.value = null;
//     }
// };
// onMounted(load);
// watch(() => route.params, load);
// serverState.onconnect(load);
// watch(() => serverState.loggedIn, load);
</script>

<template>
    <div class="centered">
        <div class="maintenance-box-temp">
            <img src="/icon.svg" style="height: 20vh;">
            <h3>Site Maintenance</h3>
            <p style="text-wrap: balance; font-size: var(--font-small);">The archive is currently under maintenance as we restructure our contest system. Sorry about that! WWPIT 2024 problems can be found at <a href="https://github.com/WWPPC/WWPIT-Spring-2024-ProblemGrader" target="_blank">https://github.com/WWPPC/WWPIT-Spring-2024-ProblemGrader</a>.</p>
            <span style="text-wrap: nowrap;">-------------------------------------------</span>
            <span>
                <img src="/img/spaghetti.png" style="max-height: 30vh;">
            </span>
        </div>
    </div>
    <!-- add search button in corner, goes to different box (special search box!!) -->
    <!-- <div class="archiveListWrapperWrapper centered">
        <div class="archiveListWrapper">
            <Transition>
                <div v-if="contestList != null" class="archiveList">
                    <AngledTitledContainer title="Contest Archive" width="100%" height="100%">
                        <AnimateInContainer type="slideUp" v-for="(contest, index) of contestList" :key="contest" :delay="index * 200">
                            <ArchiveListContest :id="contest"></ArchiveListContest>
                        </AnimateInContainer>
                    </AngledTitledContainer>
                </div>
            </Transition>
            <Transition>
                <div v-if="contest != null" class="archiveList">
                    <AngledTitledContainer :title="contest.id" width="100%" height="100%">
                        <AnimateInContainer type="fade" v-for="(round, index) of contest.rounds" :key="round.number" :delay="index * 100">
                            <ArchiveListRound :data="round"></ArchiveListRound>
                        </AnimateInContainer>
                    </AngledTitledContainer>
                </div>
            </Transition>
            <Transition>
                <div v-if="round != null" class="archiveList">
                    <AngledTitledContainer :title="`${round.contest} Round ${round.number + 1}`" width="100%" height="100%">
                        <AnimateInContainer type="fade">
                            <ArchiveListRound :data="round"></ArchiveListRound>
                        </AnimateInContainer>
                    </AngledTitledContainer>
                </div>
            </Transition>
        </div>
    </div>
    <LoadingCover text="Loading..." :show="contestList == null && contest == null && round == null"></LoadingCover> -->
</template>

<style scoped>
.maintenance-box-temp {
    display: flex;
    flex-direction: column;
    padding: 2vh 2vh;
    background-color: #333;
    border: 4px solid white;
    width: min-content;
}

.archiveListWrapperWrapper {
    height: 100%;
    overflow: hidden;
}

.archiveListWrapper {
    display: grid;
    grid-template-rows: 100%;
    grid-template-columns: 100%;
    width: 100%;
    max-width: 900px;
}

.archiveList {
    height: 100%;
    grid-row: 1;
    grid-column: 1;
}

.v-enter-active,
.v-leave-active {
    transition: 200ms ease-in-out transform, 200ms linear opacity;
}

.v-enter-from {
    transform: translateX(-100vw);
    opacity: 0;
}

.v-leave-to {
    transform: translateX(100vw);
    opacity: 0;
}

.v-enter-to,
.v-leave-from {
    transform: none;
    opacity: 1;
}
</style>
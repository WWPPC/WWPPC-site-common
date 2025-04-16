<!-- <script setup lang="ts">
import { autoGlitchTextTransition } from '#/text';
import { AnimateInContainer, CutCornerContainer } from '#/containers';
import ArchiveListRound from './UpsolveListRound.vue';
import OnScreenHook from '#/common/OnScreenHook.vue';
import LoadingBar from '#/common/LoadingBar.vue';
import { ref } from 'vue';
import { useUpsolveManager, type UpsolveContest } from '#/modules/UpsolveManager';
import { globalModal } from '#/modal';

const props = defineProps<{
    id: string
}>();

const modal = globalModal();
const upsolveManager = useUpsolveManager();

const contest = ref<UpsolveContest | null>(null);
const titleText = autoGlitchTextTransition(() => contest.value?.id ?? '...', 40, 1, 10, 2);

let loaded = false;
const load = async () => {
    if (loaded) return;
    loaded = true;
    const data = await upsolveManager.getContestData(props.id);
    if (data instanceof Error) {
        modal.showModal({ title: data.message, content: `Could not load contest (loading "${props.id}")`, color: 'var(--color-2)' });
        return;
    }
    contest.value = data;
}
</script>

<template>
    <CutCornerContainer style="margin-bottom: 16px;" no-padding no-scroll>
        <OnScreenHook @visible="load()"></OnScreenHook>
        <RouterLink :to="'/contest/archive/' + contest?.id" class="archiveContestHeader">
            <h2>{{ titleText }}</h2>
        </RouterLink>
        <AnimateInContainer type="fade" v-for="(round, index) in contest?.rounds" :key="round.number" :delay="index * 100">
            <ArchiveListRound :data="round" minimized></ArchiveListRound>
        </AnimateInContainer>
        <div class="centered" v-if="contest == null" style="margin: 8px 0px;">
            <LoadingBar width="max(50%, 100px)" height="16px"></LoadingBar>
        </div>
    </CutCornerContainer>
</template>

<style scoped>
.archiveContestHeader {
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding: 8px 12px;
    border-bottom: 4px solid white;
    background-color: #333;
    color: lime;
    text-decoration: underline;
    cursor: pointer;
}
</style> -->

<script setup lang="ts">
import { AnimateInContainer, AngledTitledContainer } from '#/containers';
import ContestProblemListRound from '#/common-components/contest/problemList/ContestProblemListRound.vue';
import { type Contest, useContestManager } from '#/modules/ContestManager';
import WaitCover from '#/common/WaitCover.vue';
import ContestProblemListProblem from '#/common-components/contest/problemList/ContestProblemListProblem.vue';
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

const props = defineProps<{
    contest: string
}>();
const contestType = props.contest;

const contestManager = useContestManager();

// spaghetti
const spam = ref(true);
const loading = ref(true);
onMounted(async () => {
    await contestManager.contests[contestType]?.waitForContestLoad();
    loading.value = false;
    makeUselessCopyOfDataToTriggerReactivityBecauseVueIsBrokenAndReactivityDoesntWorkAtAll();
});
onUnmounted(() => loading.value = true);
const buh = ref<Contest | null>(null);
const makeUselessCopyOfDataToTriggerReactivityBecauseVueIsBrokenAndReactivityDoesntWorkAtAll = async () => {
    if (contestManager.contests[contestType]?.contest) buh.value = reactive(contestManager.contests[contestType].contest);
    await nextTick();
    spam.value = false;
    await nextTick();
    spam.value = true;
};
watch(() => contestManager.contests[contestType], () => contestManager.contests[contestType]?.onSpaghetti(makeUselessCopyOfDataToTriggerReactivityBecauseVueIsBrokenAndReactivityDoesntWorkAtAll));
onMounted(makeUselessCopyOfDataToTriggerReactivityBecauseVueIsBrokenAndReactivityDoesntWorkAtAll);
</script>

<template>
    <div class="problemListWrapperWrapper centered">
        <div class="problemListWrapper" v-if="spam">
            <AngledTitledContainer title="Problems" height="100%">
                <div v-if="contestManager.config[contestType]?.rounds" class="problemList">
                    <AnimateInContainer type="slideUp" v-for="(round, index) in buh?.rounds.filter((r) => r.problems.length > 0)" :key=round.number :delay="index * 200">
                        <ContestProblemListRound :data=round></ContestProblemListRound>
                    </AnimateInContainer>
                </div>
                <div v-else class="problemList">
                    <AnimateInContainer type="fade" v-for="(problem, index) in buh?.rounds[0]?.problems" :key=problem.number :delay="index * 100">
                        <ContestProblemListProblem :data=problem></ContestProblemListProblem>
                    </AnimateInContainer>
                </div>
                <WaitCover text="Loading..." :show="loading"></WaitCover>
            </AngledTitledContainer>
        </div>
    </div>
</template>

<style scoped>
.problemListWrapperWrapper {
    height: 100%;
}

.problemListWrapper {
    width: 100%;
    max-width: 900px;
}

.problemList {
    display: flex;
    flex-direction: column;
}
</style>
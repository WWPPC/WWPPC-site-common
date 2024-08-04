<script setup lang="ts">
import { AnimateInContainer, AngledTitledContainer } from '#/containers';
import ContestProblemListRound from '#/common-components/contest/problemList/ContestProblemListRound.vue';
import { useContestManager } from '#/scripts/ContestManager';
import WaitCover from '#/common/WaitCover.vue';
import ContestProblemListProblem from '#/common-components/contest/problemList/ContestProblemListProblem.vue';

const props = defineProps<{
    contest: string
}>();
const contestType = props.contest;

const contestManager = useContestManager();
</script>

<template>
    <div class="problemListWrapperWrapper centered">
        <div class="problemListWrapper">
            <AngledTitledContainer title="Problems" height="100%">
                <div v-if="contestManager.config[contestType]?.rounds" class="problemList">
                    <AnimateInContainer type="slideUp" v-for="(round, index) in contestManager.contests[contestType]?.contest?.rounds.filter((r) => r.problems.length > 0)" :key=round.number :delay="index * 200">
                        <ContestProblemListRound :data=round></ContestProblemListRound>
                    </AnimateInContainer>
                </div>
                <div v-else class="problemList">
                    <AnimateInContainer type="fade" v-for="(problem, index) in contestManager.contests[contestType]?.contest?.rounds[0]?.problems" :key=problem.number :delay="index * 100">
                        <ContestProblemListProblem :data=problem></ContestProblemListProblem>
                    </AnimateInContainer>
                </div>
                <WaitCover text="Loading..." :show="contestManager.contests[contestType] == null || contestManager.contests[contestType]!.contest == null"></WaitCover>
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
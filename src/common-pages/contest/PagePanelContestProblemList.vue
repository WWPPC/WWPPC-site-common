<script setup lang="ts">
import NotFound from '#/common/NotFound.vue';
import WaitCover from '#/common/WaitCover.vue';
import { AnimateInContainer, AngledTitledContainer } from '#/containers';
import ContestProblemListRound from '#/common-components/contest/problemList/ContestProblemListRound.vue';
import { useContestManager } from '#/modules/ContestManager';
import ContestProblemListProblem from '#/common-components/contest/problemList/ContestProblemListProblem.vue';
import { useServerState } from '#/modules/ServerState';
import { computed } from 'vue';
import GlowText from '#/text/GlowText.vue';

const props = defineProps<{
    contest: string
}>();
const contestType = props.contest;

const serverState = useServerState();
const contestManager = useContestManager();
const contestData = computed(() => contestManager.contests[contestType]?.data.contest);
</script>

<template>
    <div class="problemListWrapperWrapper centered">
        <div class="problemListWrapper">
            <AngledTitledContainer title="Problems" height="100%">
                <div class="centered" v-if="contestData?.rounds.every(round => round.problems.length === 0)">
                    <GlowText text="No problems released yet" color="var(--color-3)" glow shadow font-size="var(--font-large)"></GlowText>
                </div>
                <div v-if="contestManager.config[contestType]?.rounds" class="problemList">
                    <AnimateInContainer type="slideUp" v-for="(round, index) in contestData?.rounds.filter((r) => r.problems.length > 0 && Date.now() >= r.startTime)" :key=round.round :delay="index * 200">
                        <ContestProblemListRound :data=round></ContestProblemListRound>
                    </AnimateInContainer>
                </div>
                <div v-else class="problemList">
                    <AnimateInContainer type="fade" v-for="(problem, index) in contestData?.rounds[0]?.problems" :key="typeof problem == 'string' ? problem : problem.id" :delay="index * 50">
                        <ContestProblemListProblem :data=problem></ContestProblemListProblem>
                    </AnimateInContainer>
                </div>
                <NotFound v-if="false"></NotFound>
                <WaitCover text="Loading..." :show="!serverState.connected || (contestData === undefined && contestManager.contests[contestType] !== undefined)"></WaitCover>
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
<script setup lang="ts">
import { InputLinkButton } from '#/inputs';
import ContestProblemStatusCircle from '#/common-components/contest/ContestProblemStatusCircle.vue';
import { ProblemCompletionState, useContestManager, type Problem } from '#/modules/ContestManager';
import { AnimateInContainer } from '#/containers';
import { computed } from 'vue';

const props = defineProps<{
    // add archive host later
    data: string | Problem
    archive?: boolean
}>();

const contestManager = useContestManager();
const submissions = computed(() => {
    const allSubmissions = contestManager.contests.WWPIT?.data.submissions;
    if (allSubmissions === undefined) return [];
    return allSubmissions.get(typeof props.data == 'string' ? props.data : props.data.id) ?? [];
});
</script>

<template>
    <div class="contestProblemListProblem" v-if="typeof props.data == 'string'">
        <span class="contestProblemListProblemId">
            ??-??
        </span>
        <span class="problemListCircle">
            <!-- pretty sure it's always undefined the way it's set up but whatever -->
            <ContestProblemStatusCircle :status="submissions[0] === undefined ? ProblemCompletionState.NOT_UPLOADED : submissions[0].status"></ContestProblemStatusCircle>
        </span>
        <span class="contestProblemListProblemName"><b>{{ data }}</b></span>
        <span class="contestProblemListProblemAuthor"><i>By Loading...</i></span>
        <span class="contestProblemListProblemButton">
            <AnimateInContainer type="fade" :delay="100">
                <RouterLink :to="`./problemView/${props.data}`" no-deco>
                    <InputLinkButton text="View" width="100px" height="36px" border glitch-on-mount></InputLinkButton>
                </RouterLink>
            </AnimateInContainer>
        </span>
    </div>
    <div class="contestProblemListProblem" v-else>
        <span class="contestProblemListProblemId">
            {{ props.data.round + 1 }}-{{ props.data.number + 1 }}
        </span>
        <span class="problemListCircle">
            <ContestProblemStatusCircle :status="submissions[0] === undefined ? ProblemCompletionState.NOT_UPLOADED : submissions[0].status"></ContestProblemStatusCircle>
        </span>
        <span class="contestProblemListProblemName"><b>{{ props.data.name }}</b></span>
        <span class="contestProblemListProblemAuthor"><i>By {{ props.data.author }}</i></span>
        <span class="contestProblemListProblemButton">
            <RouterLink :to="`./problemView/${props.data.round}_${props.data.number}`" no-deco>
                <InputLinkButton text="View" width="100px" height="36px" border glitch-on-mount></InputLinkButton>
            </RouterLink>
        </span>
    </div>
</template>

<style scoped>
.problemListCircle {
    grid-row: 2 / 5;
    grid-column: 1;
}

.contestProblemListProblem {
    display: grid;
    grid-template-columns: 60px 1fr 120px;
    grid-template-rows: 24px 8px 16px 8px;
    grid-auto-flow: column;
    margin: 4px 4px;
    padding: 4px 0px;
    background-color: #333;
    border-radius: 8px;
    align-items: center;
    justify-items: center;
    transition: 50ms ease margin;
    will-change: margin;
}

.contestProblemListProblem:hover {
    margin: 4px 0px;
}

.contestProblemListProblemId {
    grid-row: 1;
    grid-column: 1;
    font-size: 18px;
}

.contestProblemListProblemName {
    grid-row: 1 / 3;
    grid-column: 2;
    font-size: 28px;
    justify-self: left;
}

.contestProblemListProblemAuthor {
    grid-row: 3 / 5;
    grid-column: 2;
    font-size: 18px;
    align-self: start;
    justify-self: left;
}

.contestProblemListProblemButton {
    grid-row: 1 / 5;
    grid-column: 3;
}
</style>
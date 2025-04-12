<script setup lang="ts">
import { InputLinkButton } from '#/inputs';
import ContestProblemStatusCircle from '#/common-components/contest/ContestProblemStatusCircle.vue';
// import { glitchTextTransition } from '#/text';
import { ref, onMounted, computed } from 'vue';
import { useContestManager, type Problem } from '#/modules/ContestManager';

const props = defineProps<{
    // add archive host later
    contest: string
    problemId: string
    archive?: boolean
}>();

const contestManager = useContestManager();

const problem = ref<Problem>();

onMounted(async () => {
    if (contestManager.contests[props.contest] === undefined) return;
    const data = await contestManager.contests[props.contest]!.getProblem(props.problemId);
    if (data instanceof Response) {
        console.log("buh error", props.problemId);
        return;
    }
    problem.value = data;
});
</script>

<template>
    <div class="contestProblemListProblem">
        <!-- <span class="contestProblemListProblemId">
            {{ props.data.round + 1 }}-{{ props.data.number + 1 }}
        </span> -->
        <!-- <span class="problemListCircle">
            <ContestProblemStatusCircle :status="props.data.status"></ContestProblemStatusCircle>
        </span> -->
        <span class="contestProblemListProblemName"><b>{{ problem?.name ?? "Loading..." }}</b></span>
        <span class="contestProblemListProblemAuthor"><i>{{ problem?.author ?? "Loading..." }}</i></span>
        <span class="contestProblemListProblemButton">
            <RouterLink v-if="problem?.id" :to="`./problemView/${problem.id}`" no-deco>
                <InputLinkButton text="View" width="100px" height="36px" border></InputLinkButton>
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
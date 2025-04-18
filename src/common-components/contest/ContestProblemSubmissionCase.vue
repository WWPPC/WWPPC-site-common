<script setup lang="ts">
import { type Score, ScoreState } from '#/modules/ContestManager';
import { globalModal } from '#/modal';

const props = defineProps<{
    case: Score
    number: number
}>();

const modal = globalModal();

const submissionVerdict = () => props.case.state == ScoreState.CORRECT ? '*' : props.case.state == ScoreState.INCORRECT ? 'X' : props.case.state == ScoreState.TIME_LIM_EXCEEDED ? 'T' : props.case.state == ScoreState.MEM_LIM_EXCEEDED ? 'M' : '!';
const submissionVerdictLong = () => props.case.state == ScoreState.CORRECT ? 'Accepted' : props.case.state == ScoreState.INCORRECT ? 'Wrong answer' : props.case.state == ScoreState.TIME_LIM_EXCEEDED ? 'Time limit exceeded' : props.case.state == ScoreState.MEM_LIM_EXCEEDED ? 'Memory limit exceeded' : props.case.state == ScoreState.RUNTIME_ERROR ? 'Runtime error' : 'Compilation error';

const showModal = () => {
    modal.showModal({
        title: 'Test Case ' + (props.number + 1),
        content: `Time: ${Math.round(props.case.time)}ms | Memory: ${Math.round(props.case.memory)}MB<br>Subtask: ${props.case.subtask}<br>Verdict: ${submissionVerdictLong()}`,
        color: props.case.state == ScoreState.CORRECT ? 'var(--color-1)' : 'var(--color-2)'
    });
};
</script>

<template>
    <div class="submissionCase" @click=showModal :title="submissionVerdictLong()">
        <span class="submissionVerdict">{{ submissionVerdict() }}</span>
        <span class="submissionSubtask">T{{ props.number + 1 }} S{{ props.case.subtask }}</span>
    </div>
</template>

<style scoped>
.submissionCase {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 64px;
    min-width: 64px;
    height: 64px;
    border-radius: 4px;
    background-color: v-bind("$props.case.state == ScoreState.CORRECT ? 'color-mix(in srgb, var(--color-1) 50%, transparent 50%)' : 'color-mix(in srgb, var(--color-2) 50%, transparent 50%)'");
    border: 2px solid;
    border-color: v-bind("$props.case.state == ScoreState.CORRECT ? 'var(--color-1)' : 'var(--color-2)'");
    cursor: pointer;
}

.submissionVerdict,
.submissionSubtask {
    text-align: center;
    font-family: 'Source Code Pro', Courier, monospace;
}

.submissionVerdict {
    font-size: 30px;
}

.submissionSubtask {
    font-size: 14px;
}
</style>
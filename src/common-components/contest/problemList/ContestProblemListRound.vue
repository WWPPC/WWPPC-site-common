<script setup lang="ts">
import type { Round } from '#/modules/ContestManager';
import ContestProblemListProblem from './ContestProblemListProblem.vue';
import { AnimateInContainer, CutCornerContainer } from '#/containers';
import { ref, onMounted } from 'vue';
import { glitchTextTransition } from '#/text';

const props = defineProps<{
    data: Round
}>();
const roundText = ref<string>('');
onMounted(() => {
    setTimeout(() => {
        glitchTextTransition('', 'Round ' + (props.data.round + 1), (t) => { roundText.value = t; }, 40, 1, 10, 2);
    }, props.data.round * 200);
});
</script>

<template>
    <h2>{{ roundText }}</h2>
    <CutCornerContainer>
        <AnimateInContainer type="fade" v-for="(problem, index) in props.data.problems" :key=problem :delay="index * 100">
            <ContestProblemListProblem :problemId=problem></ContestProblemListProblem>
        </AnimateInContainer>
    </CutCornerContainer>
</template>

<style scoped></style>
<script setup lang="ts">
import type { Round } from '#/modules/ContestManager';
import ContestProblemListProblem from './ContestProblemListProblem.vue';
import { AnimateInContainer, CutCornerContainer } from '#/containers';

const props = defineProps<{
    data: Round
}>();
</script>

<template>
    <h2>Round {{ props.data.round + 1 }}</h2>
    <CutCornerContainer>
        <AnimateInContainer type="fade" v-for="(problem, index) in props.data.problems" :key="typeof problem == 'string' ? problem : problem.id" :delay="index * 100">
            <ContestProblemListProblem :data=problem></ContestProblemListProblem>
        </AnimateInContainer>
    </CutCornerContainer>
</template>

<style scoped></style>
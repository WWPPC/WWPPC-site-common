<script setup lang="ts">
import { provide } from 'vue';
import { Accordion } from '#/accordion';

const props = defineProps<{
    exclusive?: boolean
}>();

const accordionContainer = new Accordion(props.exclusive);
provide('accordion-container', accordionContainer);
</script>

<template>
    <div>
        <slot></slot>
    </div>
</template>

<style scoped>
</style>
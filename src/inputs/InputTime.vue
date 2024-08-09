<script setup lang="ts">
import { ref, watch } from 'vue';

const timestamp = defineModel<number>({ default: Date.now() });
const props = defineProps<{
    timezoneOffset?: number // this should be the value given by new Date().getTimezoneOffset()
    width?: string
    height?: string
    font?: string
}>();

//buh and possibly flaky reactivity
const datetime = ref<string>(new Date(timestamp.value - (props.timezoneOffset ?? 0) * 60000).toISOString().slice(0, 16));
watch(timestamp, () => {
    datetime.value = new Date(timestamp.value - (props.timezoneOffset ?? 0) * 60000).toISOString().slice(0, 16);
});
watch(datetime, () => {
    if (!datetime.value) return;
    timestamp.value = new Date(datetime.value + 'Z').getTime() + (props.timezoneOffset ?? 0) * 60000;
});
</script>

<template>
    <input type="datetime-local" class="uiTime" v-model="datetime">
</template>

<style scoped>
.uiTime {
    box-sizing: border-box;
    width: v-bind("$props.width ?? 'unset'");
    height: v-bind("$props.height ?? '32px'");
    margin: 0px 4px;
    padding: 0px 4px;
    border: 4px solid white;
    border-radius: 0px;
    background-color: black;
    color: white;
    font: v-bind("$props.font ?? '14px inherit'");
    font-family: 'Source Code Pro', Courier, monospace;
    transition: 50ms linear border-color;
}

.uiTime:hover {
    border-color: var(--color-1);
}

.uiTime:focus {
    border-color: var(--color-2);
}

.uiTimeHighlightInvalid.uiTime:invalid {
    border-color: var(--color-3);
}

/* Safari, Chrome */
::-webkit-datetime-edit-year-field:focus,
::-webkit-datetime-edit-month-field:focus,
::-webkit-datetime-edit-week-field:focus,
::-webkit-datetime-edit-day-field:focus,
::-webkit-datetime-edit-hour-field:focus,
::-webkit-datetime-edit-minute-field:focus,
::-webkit-datetime-edit-second-field:focus,
::-webkit-datetime-edit-ampm-field:focus {
    background-color: color-mix(in hsl, var(--color-1) 70%, transparent 30%);
}
</style>
<script setup lang="ts">
import { ref, watch } from 'vue';

const timestamp = defineModel({ default: Date.now() });
const props = defineProps<{
    timezoneOffset?: number // this should be the value given by Date.prototype.getTimezoneOffset()
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
    <input type="datetime-local" v-model="datetime">
</template>

<style scoped>
input {
    margin: 0px 4px;
}
</style>
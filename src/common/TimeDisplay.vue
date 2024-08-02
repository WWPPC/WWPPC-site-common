<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { GlowText } from '#/text';

const props = defineProps<{
    time: number
    form: 'long' | 'short'
    showComplete?: boolean
    showMillis?: boolean
    fontSize?: string
    color?: string
    glow?: boolean
    shadow?: boolean
    flashing?: boolean
    flashColor?: string
}>();

const timeMaps = {
    long: {
        y: 'years',
        mm: 'months',
        d: 'days',
        h: 'hours',
        m: 'minutes',
        s: 'seconds',
        ms: 'milliseconds'
    },
    short: {
        y: 'y',
        mm: 'mo',
        d: 'd',
        h: 'h',
        m: 'm',
        s: 's',
        ms: 'ms'
    }
}
const text = ref('');
const update = () => {
    // reset to UTC year 0
    const time = new Date(Math.abs(props.time) - 62167219200000);
    const map = timeMaps[props.form];
    let showFollowing = false;
    let t = '';
    if (time.getUTCFullYear() != 0) {
        showFollowing = true;
        t += time.getUTCFullYear() + map.y + ' ';
    }
    if (time.getUTCMonth() != 0 || (showFollowing && props.showComplete)) {
        showFollowing = true;
        t += time.getUTCMonth() + map.mm + ' ';
    }
    if (time.getUTCDate() != 1 || (showFollowing && props.showComplete)) {
        showFollowing = true;
        t += (time.getUTCDate() - 1) + map.d + ' ';
    }
    if (time.getUTCHours() != 0 || (showFollowing && props.showComplete)) {
        showFollowing = true;
        t += time.getUTCHours() + map.h + ' ';
    }
    if (time.getUTCMinutes() != 0 || (showFollowing && props.showComplete)) {
        showFollowing = true;
        t += time.getUTCMinutes() + map.m + ' ';
    }
    if (time.getUTCSeconds() != 0 || (showFollowing && props.showComplete)) {
        showFollowing = true;
        t += time.getUTCSeconds() + map.s + ' ';
    }
    if (time.getUTCMilliseconds() != 0 || (showFollowing && props.showComplete)) {
        showFollowing = true;
        t += time.getUTCMilliseconds() + map.ms + ' ';
    }
    if (!showFollowing) t = props.showMillis ? '0ms' : '0s';
    text.value = t;
};

watch(() => props.time, update);
watch(() => props.form, update);
watch(() => props.showMillis, update);
onMounted(update);
</script>

<template>
    <GlowText :text="text" :font-size="props.fontSize" :color="color" :glow="props.glow" :shadow="props.shadow" :flashing="props.flashing" :flashColor="props.flashColor"></GlowText>
</template>
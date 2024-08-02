<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { GlowText } from '#/text';

const props = defineProps<{
    to: Date
    type: 'clock' | 'timer' | 'min-timer' | 'auto-timer' | 'age' | 'min-age'
    countUp?: boolean
    fontSize?: string
    color?: string
    glow?: boolean
    shadow?: boolean
    flashing?: boolean
    flashColor?: string
}>();

const emit = defineEmits<{
    (e: 'zero'): any
}>();

let update: NodeJS.Timeout; // what
let hitZero = false;
const text = ref('');
onMounted(() => {
    clearInterval(update);
    update = setInterval(() => {
        const time = Math.abs(props.to.getTime() - Date.now());
        if (props.type == 'clock') {
            const seconds = ((time / 1000) % 60).toFixed(0).padStart(2, '0');
            const minutes = ((time / 60000) % 60).toFixed(0).padStart(2, '0');
            const hours = ((time / 3600000) % 24).toFixed(0).padStart(2, '0');
            const days = ((time / 86400000) * (props.countUp ? -1 : 1)).toFixed(0);
            text.value = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else if (props.type == 'timer') {
            const seconds = ((time / 1000) % 60).toFixed(0).padStart(2, '0');
            const minutes = ((time / 60000) % 60).toFixed(0).padStart(2, '0');
            const hours = ((time / 3600000) * (props.countUp ? -1 : 1)).toFixed(0);
            text.value = `${hours}:${minutes}:${seconds}`;
        } else if (props.type == 'min-timer') {
            const seconds = ((time / 1000) % 60).toFixed(0).padStart(2, '0');
            const minutes = ((time / 60000) * (props.countUp ? -1 : 1)).toFixed(0);
            text.value = `${minutes}:${seconds}`;
        } else if (props.type == 'auto-timer') {
            const seconds = ((time / 1000) % 60).toFixed(0).padStart(2, '0');
            const minutes = ((time / 60000) % 60).toFixed(0).padStart(2, '0');
            const hours = ((time / 3600000) * (props.countUp ? -1 : 1)).toFixed(0);
            if (hours != '0') text.value = `${hours}:${minutes}:${seconds}`;
            else text.value = `${minutes}:${seconds}`;
        } else if (props.type == 'age') {
            text.value = '';
            const seconds = Math.floor(time / 1000) % 60;
            const minutes = Math.floor(time / 60000) % 60;
            const hours = Math.floor(time / 3600000) % 24;
            const days = Math.floor(time / 86400000) % 365;
            const years = Math.floor(time / 31536000000);
            if (years != 0) text.value += years.toString() + (years == 1 ? ' year' : ' years');
            if (days != 0) text.value += days.toString() + (days == 1 ? ' day' : ' days');
            if (hours != 0) text.value += hours.toString() + (hours == 1 ? ' hour' : ' hours');
            if (minutes != 0) text.value += minutes.toString() + (minutes == 1 ? ' minute' : ' minutes');
            if (seconds != 0 || text.value == '') text.value += seconds.toString() + (seconds == 1 ? ' second' : ' seconds');
        } else if (props.type == 'min-age') {
            text.value = '';
            const seconds = Math.floor(time / 1000) % 60;
            const minutes = Math.floor(time / 60000) % 60;
            const hours = Math.floor(time / 3600000) % 24;
            const days = Math.floor(time / 86400000) % 365;
            const years = Math.floor(time / 31536000000);
            if (years != 0) text.value += years.toString() + 'y';
            if (days != 0) text.value += days.toString() + 'd';
            if (hours != 0) text.value += hours.toString() + 'h';
            if (minutes != 0) text.value += minutes.toString() + 'm';
            if (seconds != 0 || text.value == '') text.value += seconds.toString() + 's';
        }
        if (!props.countUp) {
            if (Date.now() >= props.to.getTime() && !hitZero) {
                hitZero = true;
                emit('zero');
            }
        }
    }, 100);
});
onUnmounted(() => {
    clearInterval(update);
    hitZero = false;
});
watch(() => props.to, () => hitZero = false);
</script>

<template>
    <GlowText :text="text" :font-size="props.fontSize" :color="color" :glow="props.glow" :shadow="props.shadow" :flashing="props.flashing" :flashColor="props.flashColor"></GlowText>
</template>
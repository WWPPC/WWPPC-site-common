<script setup lang="ts">
import { watch } from 'vue';
import { flipTextTransition, randomFlipTextTransition, type AsyncTextTransition } from '#/text';
import GlowText from './GlowText.vue';

defineProps<{
    text: string
    steps?: number
    random?: boolean
    fontSize?: string
    color?: string
    glow?: boolean
    shadow?: boolean
    flashing?: boolean
    onVisible?: boolean
}>();
</script>
<script lang="ts">
export default {
    data() {
        return {
            activated: false,
            dispText: this.$props.text.replace('/.g', ' ')
        };
    },
    mounted() {
        if (this.activated) return;
        this.activated = true;
        let running: AsyncTextTransition | null = null;
        const runFlip = () => {
            if (running) running.cancel();
            if (this.$props.random) {
                running = randomFlipTextTransition(this.dispText, this.$props.text, (t) => { this.dispText = t; }, 20, this.$props.steps);
            } else {
                running = flipTextTransition(this.dispText, this.$props.text, (t) => { this.dispText = t; }, 20, this.$props.steps);
            }
        };
        if (this.$props.onVisible) {
            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) runFlip();
            }, { threshold: 0 });
            observer.observe(this.$el);
        }
        watch(() => this.$props.text, () => runFlip());
        runFlip();
    },
}
</script>

<template>
    <GlowText :text=dispText :font-size=$props.fontSize :color=$props.color :glow=$props.glow :shadow=$props.shadow :flashing=$props.flashing></GlowText>
</template>

<style scoped></style>
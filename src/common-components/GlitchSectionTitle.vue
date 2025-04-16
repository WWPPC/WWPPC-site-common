<script setup lang="ts">
import { GlitchText } from '#/text';

defineProps<{
    text: string
    fontSize: string
    parallax?: boolean
}>();
</script>

<template>
    <GlitchText :class="{ glitchSectionTitle: true, glitchSectionTitleParallax: $props.parallax }" :text="$props.text" :font-size="$props.fontSize" color="var(--color-1)" shadow glow :delay=5 random on-visible></GlitchText>
</template>

<style scoped>
.glitchSectionTitle {
    z-index: -1;
    text-align: center;
}

.glitchSectionTitleParallax {
    transform-origin: top;
    transform: translate3D(0px, -20vh, -50px) scale(150%);
}
</style>
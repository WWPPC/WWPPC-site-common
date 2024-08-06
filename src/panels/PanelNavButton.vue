<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { glitchTextTransition, type AsyncTextTransition } from '#/text';
import { useRoute } from 'vue-router';
import { isMobile } from '#/scripts/userAgent';

const props = defineProps<{
    text: string
    title?: string
    for: string
    link?: boolean
    isDefault?: boolean
}>();
const emit = defineEmits<{
    (e: 'click'): void
}>();
const route = useRoute();

const classList = ref('');
const setClassList = () => classList.value = 'panelNavButton ' + (((props.isDefault && route.params.panel == undefined) || props.for == `/${route.params.page}/${route.params.panel}`) ? 'panelNavButtonSelected ' : '') + (isMobile ? 'panelNavButtonNoHover' : '');
watch(() => route.params.page, setClassList);
watch(() => route.params.panel, setClassList);
onMounted(setClassList);

// animations for hover
const buttonText = ref(props.text.replace(/./g, ' '));
let blockingAnimation: AsyncTextTransition | null = null;
let currentAnimation: AsyncTextTransition | null = null;
function mouseover() {
    if (blockingAnimation?.finished == false) return;
    currentAnimation?.cancel();
    currentAnimation = glitchTextTransition(props.text, props.text, (text) => { buttonText.value = text; }, 40, 2, 5, 1);
}
onMounted(() => {
    blockingAnimation = glitchTextTransition(buttonText.value, props.text, (text) => { buttonText.value = text; }, 40, 1, 15, 1);
});
</script>

<template>
    <a v-if="props.link" :href="props.for" :class="classList" @mouseover="mouseover()" @click="emit('click')" :title=title>{{ buttonText }}</a>
    <RouterLink v-else :to="props.for" :class="classList" @mouseover="mouseover()" @click="emit('click')" :title=title>{{ buttonText }}</RouterLink>
</template>

<style scoped>
.panelNavButton {
    display: inline-block;
    min-width: 128px;
    font-size: 18px;
    color: white !important;
    text-decoration: none;
    text-align: center;
    align-content: center;
    background-color: transparent;
    font-family: 'Source Code Pro', Courier, monospace;
    transition: 100ms cubic-bezier(0.6, 1, 0.5, 1.6) background-color;
    cursor: pointer;
}

.panelNavButtonSelected {
    background-color: #1A1A1A;
    font-weight: bold;
}

.panelNavButton:hover {
    background-color: #444;
    font-weight: bold;
}

.panelNavButtonNoHover:hover {
    background-color: transparent !important;
    font-weight: normal !important;
}

.panelNavButtonSelected.panelNavButtonNoHover:hover {
    background-color: #1A1A1A !important;
    font-weight: bold !important;
}
</style>
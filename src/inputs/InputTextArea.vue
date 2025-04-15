<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps<{
    title?: string
    width?: string
    height?: string
    minWidth?: string
    minHeight?: string
    maxWidth?: string
    maxHeight?: string
    font?: string
    fontSize?: string
    color?: string
    backgroundColor?: string
    placeholder?: string
    resize?: 'vertical' | 'horizontal' | 'both' | 'none'
    disableTyping?: boolean
}>();
const emit = defineEmits<{
    (e: 'input', value: string): any
}>();
const text = defineModel({ default: '' });
function input() {
    emit('input', text.value);
}
defineExpose({
    value: text
});

// function to disable typing 
function disabled(event: KeyboardEvent) {
  if (props.disableTyping) {
    event.preventDefault();
  }
}

</script>

<template>
    <textarea class="uiTextArea" @input=input v-model=text :title=props.title :placeholder=props.placeholder @keydown="disabled"></textarea>
</template>

<style scoped>
.uiTextArea {
    box-sizing: border-box;
    width: v-bind("$props.width ?? 'unset'");
    height: v-bind("$props.height ?? 'unset'");
    min-width: v-bind("$props.minWidth ?? 'unset'");
    min-height: v-bind("$props.minHeight ?? 'unset'");
    max-width: v-bind("$props.maxWidth ?? 'unset'");
    max-height: v-bind("$props.maxHeight ?? 'unset'");
    margin: 0px 4px;
    padding: 0px 4px;
    border: 4px solid white;
    border-radius: 0px;
    background-color: v-bind("$props.backgroundColor ?? 'black'");
    color: v-bind("$props.color ?? 'white'");
    font: v-bind("$props.font ?? 'inherit'");
    font-size: v-bind("$props.fontSize ?? 'var(--font-16)'");
    font-family: 'Source Code Pro', Courier, monospace;
    transition: 50ms linear border-color;
    resize: v-bind("$props.resize ?? 'both'");
}

.uiTextArea:hover {
    border-color: var(--color-1);
}

.uiTextArea:focus {
    border-color: var(--color-2);
}

.uiTextArea:disabled {
    border-color: #888 !important;
    opacity: 1;
    cursor: not-allowed;
}
</style>
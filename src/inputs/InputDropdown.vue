<script setup lang="ts">
import { onMounted } from 'vue';

interface DropdownItem {
    text: string
    value: string
}
const props = defineProps<{
    title?: string
    items: DropdownItem[]
    groupedItems?: { label: string, items: DropdownItem[] }[]
    width?: string
    height?: string
    font?: string
    fontSize?: string
    color?: string
    backgroundColor?: string
    default?: string
    multiple?: boolean
}>();
const emit = defineEmits<{
    (e: 'input', value: string | string[]): any
}>();
const selected = defineModel<string | string[]>({ default: '' });
function input() {
    emit('input', selected.value);
}
onMounted(() => {
    selected.value = selected.value == '' ? props.default ?? (props.multiple ? [] : '') : selected.value;
});
defineExpose({
    value: selected,
    items: props.items,
    groupedItems: props.groupedItems
});
</script>

<template>
    <select class="uiDropdown" @change=input v-model=selected :title=props.title :multiple=props.multiple>
        <option v-for="item in props.items" :key=item.value :value=item.value>
            {{ item.text }}
        </option>
        <optgroup v-for="itemGroup in props.groupedItems" :key=itemGroup.label :label=itemGroup.label>
            <option v-for="item in itemGroup.items" :key=item.text :label=item.text>
                {{ item.value }}
            </option>
        </optgroup>
    </select>
</template>

<style scoped>
.uiDropdown {
    display: inline-block;
    box-sizing: border-box;
    width: v-bind("$props.width ?? 'initial'");
    height: v-bind("$props.height ?? '32px'");
    padding: 0px 4px;
    margin: 0px 4px;
    border: 4px solid white;
    border-radius: 0px;
    background-color: v-bind("$props.backgroundColor ?? 'black'");
    color: v-bind("$props.color ?? 'white'");
    font: v-bind("$props.font ?? 'inherit'");
    font-size: v-bind("$props.fontSize ?? 'var(--font-16)'");
    font-family: 'Source Code Pro', Courier, monospace;
    transition: 50ms linear border-color;
    cursor: pointer;
}

.uiDropdown option {
    padding: 0px 4px;
    background-color: v-bind("$props.backgroundColor ?? 'black'");
    font-size: var(--font-16);
    cursor: pointer;
}

.uiDropdown option:nth-child(odd) {
    background-color: color-mix(in srgb, v-bind("$props.backgroundColor ?? 'black'") 75%, #808080 25%);
}

.uiDropdown option:hover {
    background-color: color-mix(in srgb, v-bind("$props.backgroundColor ?? 'black'") 50%, #808080 50%);
}

.uiDropdown option:checked {
    color: var(--color-1) !important;
}

.uiDropdown optgroup {
    padding: 0px 4px;
    background-color: color-mix(in srgb, v-bind("$props.backgroundColor ?? 'black'") 60%, #808080 40%);
    font-weight: bold;
}

.uiDropdown[multiple] {
    padding: 0px 0px;
    cursor: default;
}

.uiDropdown:hover {
    border-color: var(--color-1);
}

.uiDropdown:focus {
    border-color: var(--color-2);
}

.uiDropdown:disabled {
    border-color: #888 !important;
    opacity: 1;
    cursor: not-allowed;
}

.uiDropdown:disabled option {
    color: v-bind("$props.color ?? 'white'");
    cursor: not-allowed;
}

.uiDropdown:disabled option:hover {
    background-color: v-bind("$props.backgroundColor ?? 'black'") !important;
}

.uiDropdown:disabled option:nth-child(odd):hover {
    background-color: color-mix(in srgb, v-bind("$props.backgroundColor ?? 'black'") 75%, #808080 25%) !important;
}
</style>
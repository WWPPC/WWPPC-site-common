<script setup lang="ts">
import { defineProps, defineEmits, defineModel } from 'vue';

const props = defineProps<{
  min?: number
  max?: number
  step?: number
  trackWidth?: number
}>();

const val = defineModel<number>({ default: 0 });

const emit = defineEmits<{
  (e: 'input', value: number): void
}>();

function input() {
  emit('input', val.value);
}
</script>

<template>
  <div>
    <input type="range" v-model="val" :min="props.min" :max="props.max" :step="props.step" :trackWidth="props.trackWidth" @input="input" class="slider"/>
  </div>
</template>

<style scoped>


.slider {
  appearance: none;
  width: v-bind("$props.trackWidth ?? '100%'");
  height: 25px;
  background: rgb(34, 34, 34);
  outline: white;
  border-radius: 0%;
  border: 2px solid white;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  height: 30px;
  width: 25px;
  background: var(--color-1);
  outline: 0;
  border-radius: 0%;
  border: 4px solid white;
}


.slider::-moz-range-thumb {
  appearance: none;
  height: 30px;
  width: 25px;
  background: var(--color-1);
  outline: 0;
  border-radius: 0%;
  border: 4px solid white;
}
</style>

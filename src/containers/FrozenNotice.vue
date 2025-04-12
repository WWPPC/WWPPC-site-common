<!--FrozenNotice :show="isFrozen" -->

<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()
</script>

<template>
  <div v-if="props.show" class="frozen-notice-container">
    <div class="frozen-notice-banner">
        Leaderboards are currently frozen, please cheeck back later
    </div>
  </div>
</template>

<style scoped>
.frozen-notice-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.frozen-notice-banner {
  background-color: #facc15; /* Tailwind's yellow-300 */
  color: black;
  font-weight: bold;
  text-align: center;
  padding: 12px;
  border: 2px solid black;
  border-radius: 8px;
  max-width: 1024px;
  width: 100%;
  font-size: 1.1em;
}
</style>
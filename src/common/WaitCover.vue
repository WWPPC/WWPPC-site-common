<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue';

defineProps<{
    text: string
    show: boolean
}>();
</script>
<script lang="ts">
export default {
    data() {
        return {
            size: 0,
            createdObserver: false
        }
    },
    mounted() {
        if (this.createdObserver) return;
        this.createdObserver = true;
        const observer = new ResizeObserver(() => {
            const rect = this.$el.getBoundingClientRect();
            this.size = Math.min(rect.width * 0.25, rect.height * 0.25);
        });
        observer.observe(this.$el);
        const rect = this.$el.getBoundingClientRect();
        this.size = Math.min(rect.width * 0.25, rect.height * 0.25);
    }
}
</script>

<template>
    <div class="waitCoverContainerWrapper">
        <Transition name="wait-cover">
            <div class="waitCoverContainer" v-if=$props.show>
                <div class="waitCoverSpinnerWrapper">
                    <LoadingSpinner></LoadingSpinner>
                </div>
                <div class="waitCoverText">
                    {{ $props.text }}
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.waitCoverContainerWrapper {
    display: flex;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.waitCoverContainer {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    pointer-events: all;
}

.waitCoverSpinnerWrapper {
    width: v-bind("$data.size + 'px'");
    height: v-bind("$data.size + 'px'");
    margin-bottom: calc(v-bind("$data.size + 'px'") * 0.25);
}

.waitCoverText {
    font-size: 4vh;
}

.wait-cover-enter-active,
.wait-cover-leave-active {
    transition: 100ms linear opacity;
}

.wait-cover-enter-to,
.wait-cover-leave-from {
    opacity: 1;
}

.wait-cover-enter-from,
.wait-cover-leave-to {
    opacity: 0;
}
</style>
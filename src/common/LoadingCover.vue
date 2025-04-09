<script setup lang="ts">
import LoadingSquare from './LoadingSquare.vue';

defineProps<{
    text: string
    show: boolean
}>();
</script>

<template>
    <Transition name="loading-cover">
        <div class="loadingCoverContainer" v-if="$props.show">
            <div class="loadingCoverSquareWrapper">
                <LoadingSquare></LoadingSquare>
            </div>
            <div class="loadingCoverText">
                {{ $props.text }}
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.loadingCoverContainer {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    width: 100%;
    height: 100%;
    padding: 20vh 20vw;
    background-color: black;
    align-items: center;
    justify-content: center;
    transition: 500ms linear opacity;
    opacity: 1;
}

.loadingCoverSquareWrapper {
    width: min(50vw, 50vh);
    height: min(50vw, 50vh);
    margin-bottom: min(5vw, 5vh);
}

.loadingCoverText {
    font-size: 4vh;
}

.loading-cover-leave-active {
    opacity: 0;
}
</style>
<script setup lang="ts">
defineProps<{
    target?: string
}>();
</script>

<template>
    <RouterLink :to="$props.target ?? '/home'" class="navLargeLogo">
        <img class="navLogoImg" src="/logo.svg" alt="WWPPC Logo">
    </RouterLink>
</template>

<style scoped>
.navLargeLogo {
    display: inline-block;
    height: 100%;
    min-height: 100%;
    max-height: 100%;
    align-self: center;
    transition: 50ms linear transform, 500ms ease max-height;
    cursor: pointer;
}

.navLargeLogo:hover {
    transform: scale(1.02);
}

.navLargeLogo:active {
    transform: scale(0.98);
}

.navLogoImg {
    background-color: transparent;
    height: 100%;
}

@media (max-width: 600px) {
    .navLargeLogo {
        max-height: 40%;
    }
}
</style>
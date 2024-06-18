<script setup lang="ts">
import { InputButton } from '@/inputs';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <div class="notFound">
        <span style="color: red; font-size: var(--font-32);">BUG: 404 Not Found</span>
        <br>
        &lt;span style="color: red;"&gt;IS BORKEN!!!&lt;/span&gt;
        <br>
        <br>
        <span>
            <InputButton text="Magical Fix Button" color="lime" width="200px" @click="router.push('/home')"></InputButton>
        </span>
    </div>
</template>

<style>
.notFound {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: black;
    justify-content: center;
    text-align: center;
    overflow: hidden;
}
</style>
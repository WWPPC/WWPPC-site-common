<script setup lang="ts">
import { InputButton } from '#/inputs';
</script>

<template>
    <div class="notFound">
        <span style="color: var(--color-2); font-size: var(--font-32);">BUG: 404 Not Found</span>
        <br>
        &lt;span style="color: red;"&gt;IS BORKEN!!!&lt;/span&gt;
        <br>
        <br>
        <RouterLink to="/home">
            <InputButton text="Magical Fix Button" color="var(--color-1)" width="200px"></InputButton>
        </RouterLink>
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
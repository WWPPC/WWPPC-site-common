<script setup lang="ts">
import { GlitchText, GlowText } from '#/text';
import SponsorLogo from '#/common-components/SponsorLogo.vue';
import LineDivider from '#/common/LineDivider.vue';
import { ref, onMounted } from 'vue';


type sponsors = { name: string, src: string, url: string, height: string };

const props = defineProps<{
    color: string
    partners: sponsors[]
    gold: sponsors[]
    silver: sponsors[]
    bronze: sponsors[]
}>();

const root = document.documentElement;
let numerator = 3;

function setColumnGap() {
    let ratio = ref( numerator / window.devicePixelRatio * 15 ).value;
    root.style.setProperty('--column-gap', ratio  + 'px'); 
}

setColumnGap();

onMounted(() => {   
    const mainDiv = document.getElementById('main') as HTMLDivElement;

    if (mainDiv) {
        if (props.partners.length === 0 || props.gold.length === 0 || props.silver.length === 0) {
            Object.assign(mainDiv.style, {
                padding: '0px 0%'
            });
            root.style.setProperty('--width', '70vh');
        } else {
            Object.assign(mainDiv.style, {
                padding: '0px 5%'
            });
            root.style.setProperty('--width', '40vh');
        }
    }
});

window.addEventListener('resize', function() {
    setColumnGap();
})

</script>

<template>
    <div class="centered">
        <GlitchText text="Sponsors" font-size="var(--font-title)" :color=$props.color glow shadow random :steps=2 on-visible/>
    </div>
    <div id="main" class="sponsorColumns">
        <div v-if="partners.length!=0">
            <GlowText v-if="partners.length == 1" text="PARTNER" font-size="var(--font-subtitle)" :color=$props.color shadow/>
            <GlowText v-else text="PARTNERS" font-size="var(--font-subtitle)" :color=$props.color shadow/>

            <div class="sponsors">
                <SponsorLogo v-for="sponsor in partners" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height"/>
            </div>
        </div>

        <div v-if="gold.length!=0">
            <GlowText text="GOLD" font-size="var(--font-subtitle)" color="#FD0" shadow/>

            <div class="sponsors">
                <SponsorLogo v-for="sponsor in gold" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height"/>
            </div>
        </div>

        <div v-if="silver.length!=0">
            <GlowText text="SILVER" font-size="var(--font-subtitle)" color="#CCC" shadow/>

            <div class="sponsors">
                <SponsorLogo v-for="sponsor in silver" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height"/>
            </div>
        </div>

    </div>

    <LineDivider v-if="bronze.length != 0" color="#AAA"></LineDivider>
    <div class="sponsorColumns">
        <GlowText text="BRONZE" font-size="var(--font-subtitle)" color="#B8860B" shadow/>

        <div class="sponsors" v-if="bronze.length != 0">
            <SponsorLogo v-for="sponsor in bronze" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height" />
        </div>
    </div>
</template>


<style scoped>

:root {
    --width: 40vh;
    --column-gap: 15px;
}

.sponsorColumns {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 0px 0%;
    margin-bottom: 2vh;
}

.sponsorColumns>div {
    width: var(--width);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sponsors {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 1vh;
    row-gap: 25px;
    column-gap: var(--column-gap);
    padding: 0px 5%;
}
</style>
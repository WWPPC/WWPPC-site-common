<script setup lang="ts">
import { GlitchText, GlowText } from '#/text';
import HomeSponsorLogo from '#/common-components/home/home/HomeSponsorLogo.vue';
import LineDivider from '#/common/LineDivider.vue';

type homeSponsorLogo = { name: string, src: string, url: string, height: string }

defineProps<{
    color: string
    partners: homeSponsorLogo[]
    gold: homeSponsorLogo[]
    silver: homeSponsorLogo[]
    otherSponsors: homeSponsorLogo[]
}>();
</script>

<template>
    <div class="centered">
            <GlitchText text="Sponsors" font-size="var(--font-title)" :color=$props.color glow shadow random :steps=2 on-visible></GlitchText>
        </div>
    <div class="sponsorColumns">
        <div v-if="partners.length != 0">
            <GlowText text="PARTNERS" font-size="var(--font-huge)" :color=$props.color shadow></GlowText>
            <HomeSponsorLogo v-for="sponsor in partners" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height" />
        </div>
        <div v-if="gold.length != 0">
            <GlowText text="GOLD" font-size="var(--font-huge)" color="#FD0" shadow></GlowText>
            <HomeSponsorLogo v-for="sponsor in gold" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height" />
        </div>
        <div v-if="silver.length != 0">
            <GlowText text="SILVER" font-size="var(--font-huge)" color="#CCC" shadow></GlowText>
            <HomeSponsorLogo v-for="sponsor in silver" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height" />
        </div>
    </div>
    <LineDivider v-if="otherSponsors.length != 0" color="#AAA"></LineDivider>
    <div class="sponsors" v-if="otherSponsors.length != 0">
        <HomeSponsorLogo v-for="sponsor in otherSponsors" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height" />
    </div>
</template>


<style scoped>
.sponsorColumns {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 0px 5%;
}

.sponsorColumns>div {
    width: 40vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sponsors {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 25px;
    column-gap: 50px;
    padding: 0px 5%;
}
</style>
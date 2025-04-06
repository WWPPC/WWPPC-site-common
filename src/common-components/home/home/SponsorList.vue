<script setup lang="ts">
import { GlowText } from '#/text';
import HomeSponsorLogo from '#/common-components/home/home/HomeSponsorLogo.vue';

defineProps<{
    partners: { name: string; src: string; url: string; height: string }[];
    gold: { name: string; src: string; url: string; height: string }[];
    silver: { name: string; src: string; url: string; height: string }[];
    otherSponsors: { name: string; src: string; url: string; height: string }[];
}>();

</script>

<template>
    <div class="centered">
            <GlitchText text="Sponsors" font-size="var(--font-title)" color="lime" glow shadow random :steps=2 on-visible></GlitchText>
        </div>
    <div class="sponsorColumns">
        <div>
            <GlowText text="PARTNERS" font-size="var(--font-huge)" color="lime" shadow></GlowText>
            <HomeSponsorLogo v-for="sponsor in partners" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height" />
        </div>
        <div>
            <GlowText text="GOLD" font-size="var(--font-huge)" color="#FD0" shadow></GlowText>
            <HomeSponsorLogo v-for="sponsor in gold" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height" />
        </div>
        <div>
            <GlowText text="SILVER" font-size="var(--font-huge)" color="#CCC" shadow></GlowText>
            <HomeSponsorLogo v-for="sponsor in silver" :key="sponsor.name" :src="sponsor.src" :url="sponsor.url" :name="sponsor.name" :height="sponsor.height" />
        </div>
    </div>

    <LineDivider color="#AAA"></LineDivider>

    <div class="sponsors">
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

.sponsorColumns > div {
    width: 40vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sponsor-logos {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin-top: 10px;
}
</style>
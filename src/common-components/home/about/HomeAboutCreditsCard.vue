<script setup lang="ts">
import { AnimateInContainer, DoubleCutCornerContainer } from '#/containers';
import HomeAboutCreditsCardIcon from './HomeAboutCreditsCardIcon.vue';
import { ref } from 'vue';

const props = defineProps<{
    name: string
    username: string
    roles: string
    codeforces?: string
    aops?: string
    github?: string
    discord?: string
    youtube?: string
    grade: string
    bio: string
    img: string
    width?: string
    height?: string
}>();
const slightlyFunAnimation = ref(Math.random() < 0.001);
const slightlyFunAnimationString = 'rotateY(165deg) rotateY(5deg)';
const funAnimation = ref(Math.random() < 0.001);

let transformDegrees = 0;
const hoverTransform = ref(slightlyFunAnimation.value ? slightlyFunAnimationString : '');
const unhoverTransform = ref('');

let mouseX = -1;
let lastMouseX = -1;
const onMouseMove = (event : MouseEvent) => {
    if (mouseX == -1) {
        lastMouseX = mouseX;
        mouseX = event.clientX;
        if (hoverTransform.value !== slightlyFunAnimationString) {
            hoverTransform.value = `rotateY(${transformDegrees}deg)`;
        }
    } else if (lastMouseX == -1) {
        lastMouseX = mouseX;
        mouseX = event.clientX;
        if (hoverTransform.value !== slightlyFunAnimationString) {
            transformDegrees += lastMouseX != -1 ? lastMouseX > mouseX ? -180 : 180 : 0;
            hoverTransform.value = `rotateY(${transformDegrees}deg)`;
        }
    } else {
        lastMouseX = mouseX;
        mouseX = event.clientX;
    }
}
const onMouseLeave = () => {
    if (hoverTransform.value !== slightlyFunAnimationString) {
        if (lastMouseX != -1) {
            transformDegrees += lastMouseX != -1 ? lastMouseX > mouseX ? -180 : 180 : 0;
            unhoverTransform.value = `rotateY(${transformDegrees}deg)`;
        }
    }
    mouseX = lastMouseX = -1;
}
</script>

<template>
    <AnimateInContainer type="slideUp" show-on-screen single>
        <div class="cardContainer" @mousemove=onMouseMove @mouseleave=onMouseLeave>
            <div class="card">
                <div class="cardBack">
                    <DoubleCutCornerContainer flipped class="cardFaceContainer" v-bind:width="$props.width" v-bind:height="$props.height">
                        <div class="cardContent2">
                            <div class="cardBio">
                                <RouterLink :to="'/user/@' + $props.username" class="cardUserLink">@{{ $props.username }}</RouterLink>
                                <br>
                                {{ $props.bio }}
                            </div>
                            <div class="cardIcons">
                                <HomeAboutCreditsCardIcon profileUrl="https://codeforces.com/profile/" :user=$props.codeforces icon="/img/codeforces-icon.svg" color="#1F8ACB"></HomeAboutCreditsCardIcon>
                                <HomeAboutCreditsCardIcon profileUrl="https://artofproblemsolving.com/community/user/" :user=$props.aops icon="/img/aops-icon.svg" color="#009FAD"></HomeAboutCreditsCardIcon>
                                <HomeAboutCreditsCardIcon profileUrl="https://github.com/" :user=$props.github icon="/img/github-icon.svg" color="#F05032"></HomeAboutCreditsCardIcon>
                                <HomeAboutCreditsCardIcon profileUrl="https://discord.com/users/" :user=$props.discord icon="/img/discord-icon.svg" color="#5865F2"></HomeAboutCreditsCardIcon>
                                <HomeAboutCreditsCardIcon profileUrl="https://youtube.com/" :user=$props.youtube icon="/img/youtube-icon.svg" color="#FF0000"></HomeAboutCreditsCardIcon>
                            </div>
                        </div>
                    </DoubleCutCornerContainer>
                </div>
                <div class="cardFront">
                    <DoubleCutCornerContainer class="cardFaceContainer" v-bind:width="$props.width" v-bind:height="$props.height">
                        <div class="cardContent">
                            <div class="cardContentBody">
                                <img :src=$props.img class="cardImage" :alt="$props.name">
                                <div class="cardName">{{ $props.name }}</div>
                                <div class="cardGrade">{{ $props.grade }}</div>
                                <div class="cardRoles" v-html=$props.roles></div>
                            </div>
                            <div class="cardIcons">
                                <HomeAboutCreditsCardIcon profileUrl="https://codeforces.com/profile/" :user=$props.codeforces icon="/img/codeforces-icon.svg" color="#1F8ACB"></HomeAboutCreditsCardIcon>
                                <HomeAboutCreditsCardIcon profileUrl="https://artofproblemsolving.com/community/user/" :user=$props.aops icon="/img/aops-icon.svg" color="#009FAD"></HomeAboutCreditsCardIcon>
                                <HomeAboutCreditsCardIcon profileUrl="https://github.com/" :user=$props.github icon="/img/github-icon.svg" color="#F05032"></HomeAboutCreditsCardIcon>
                                <HomeAboutCreditsCardIcon profileUrl="https://discord.com/users/" :user=$props.discord icon="/img/discord-icon.svg" color="#5865F2"></HomeAboutCreditsCardIcon>
                                <HomeAboutCreditsCardIcon profileUrl="https://youtube.com/" :user=$props.youtube icon="/img/youtube-icon.svg" color="#FF0000"></HomeAboutCreditsCardIcon>
                            </div>
                        </div>
                    </DoubleCutCornerContainer>
                </div>
                <div class="cardTop"></div>
                <div class="cardBottom"></div>
                <div class="cardLeft"></div>
                <div class="cardRight"></div>
                <div class="cardCorner1"></div>
                <div class="cardCorner2"></div>
            </div>
        </div>
    </AnimateInContainer>
</template>

<style scoped>
.cardContainer {
    perspective: 1000px;
    width: v-bind("$props.width ?? '322px'");
    height: v-bind("$props.height ?? '412px'");
}

.card {
    position: relative;
    width: v-bind("$props.width ?? '322px'");
    height: v-bind("$props.height ?? '412px'");
    transform: v-bind("unhoverTransform");
    transition: v-bind("slightlyFunAnimation ? '3000ms cubic-bezier(1, 0, 1, 1) transform' : '500ms ease transform'");
    transform-style: preserve-3d;
}

/* .cardContainer:hover>.card {
    transform: v-bind("hoverTransform");
    animation-name: spinny-carrier;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-duration: v-bind("funAnimation ? '500ms' : ''");
} */

@keyframes spinny-carrier {
    from {
        transform: rotateY(0deg) rotateX(0deg) rotateZ(0deg);
    }

    to {
        transform: rotateX(360deg) rotateY(720deg) rotateZ(360deg);
    }
}

.cardFront,
.cardBack,
.cardTop,
.cardBottom,
.cardLeft,
.cardRight,
.cardCorner1,
.cardCorner2 {
    position: absolute;
    top: 0px;
    left: 0px;
}

.cardFront,
.cardBack {
    width: v-bind("$props.width ?? '322px'");
    height: v-bind("$props.height ?? '412px'");;
    backface-visibility: hidden;
}

.cardFront {
    transform: translateZ(10px);
}

.cardBack {
    transform: translateZ(-10px) rotateY(180deg);
}

.cardTop,
.cardBottom,
.cardLeft,
.cardRight,
.cardCorner1,
.cardCorner2 {
    height: 20px;
    transform-origin: 0 0;
    background-color: white;
}

.cardTop,
.cardBottom {
    width: calc(v-bind("$props.width ?? '322px'") - 32px);
    transform: translateZ(-10px) rotateX(90deg) translateX(32px);
}

.cardBottom {
    transform: translateZ(-10px) rotateX(90deg) translateZ(calc(-1 * v-bind("$props.height ?? '412px'")));
}

.cardLeft,
.cardRight {
    width: calc(v-bind("$props.height ?? '412px'") - 32px);
    transform: translateZ(-10px) rotateX(90deg) rotateY(90deg) translateX(32px);
}

.cardRight {
    transform: translateZ(-10px) rotateX(90deg) rotateY(90deg) translateZ(calc(v-bind("$props.width ?? '322px'") - 32px));
}

.cardCorner1,
.cardCorner2 {
    width: calc(32px * sqrt(2));
    transform: translateZ(-10px) rotateX(90deg) translateZ(-32px) rotateY(-45deg);
}

.cardCorner2 {
    transform: translateZ(-10px) rotateX(90deg) translateZ(calc(-1 * v-bind("$props.height ?? '412px'"))) translateX(calc(v-bind("$props.width ?? '322px'") - 32px)) rotateY(-45deg);
}

.cardFaceContainer {
    width: v-bind("$props.width ?? '322px'");
    height: v-bind("$props.height ?? '412px'");;
}

.cardContent {
    display: grid;
    grid-template-rows: 92% 8%;
    justify-items: center;
    width: calc(v-bind("$props.width ?? '322px'") - 32px);
    height: calc(v-bind("$props.height ?? '412px'") - 32px);
}

.cardContentBody {
    display: grid;
    grid-template-rows: 50% min-content min-content min-content;
    justify-items: center;
}

.cardContent2 {
    display: grid;
    grid-template-rows: minmax(max-content, 92%) 8%;
    justify-items: center;
    width: calc(v-bind("$props.width ?? '322px'") - 32px);
    height: calc(v-bind("$props.height ?? '412px'") - 32px);
}

.cardBio {
    text-align: center;
    font-size: var(--font-24);
}

.cardImage {
    height: calc((v-bind("$props.height ?? '412px'") - 72px) / 2);
    align-self: stretch;
    border: 4px solid white;
}

.cardName {
    margin: 4px 0px;
    width: 100%;
    text-align: center;
    font-size: var(--font-24);
    font-weight: bold;
    color: var(--color-1);
}

.cardGrade {
    text-align: center;
    font-size: var(--font-20);
}

.cardRoles {
    text-align: center;
    margin-top: 8px;
    font-size: var(--font-18);
    color: var(--color-1);
}

.cardIcons {
    display: flex;
    width: 100%;
    justify-content: space-evenly;
}

.cardUserLink {
    text-decoration: none;
}
</style>
<script setup lang="ts">
import { useContestManager } from '#/modules/ContestManager';
import { useRoute } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import { GlitchText } from '#/text';
import TimerDisplay from '#/common/TimerDisplay.vue';

const props = defineProps<{
    contest: string
    big?: boolean
    timerOnly?: boolean
}>();
const contestType = props.contest;

const route = useRoute();
const contestManager = useContestManager();

const show = ref(false);
onMounted(() => show.value = route.params.panel !== 'contest' || props.big);
watch(() => route.params.panel, () => show.value = route.params.panel !== 'contest' || props.big);

const round = ref('');
const nextTime = ref(new Date(0));
const color = ref('white');
const flashColor = ref('');
let inRound = false;
const updateTime = () => {
    if (contestManager.contests[contestType]?.contest == undefined) {
        if (props.big) round.value = 'Not in contest';
        else round.value = '---';
        nextTime.value = new Date();
        color.value = 'white';
        return;
    }
    inRound = false;
    color.value = 'white';
    round.value = contestManager.contests[contestType].contest.id;
    nextTime.value = new Date(contestManager.contests[contestType].contest.endTime);
    const now = Date.now();
    if (now > contestManager.contests[contestType].contest.endTime) {
        if (props.big) round.value = 'Contest ended';
        else round.value = '---';
        nextTime.value = new Date();
        color.value = 'var(--color-2)';
    }
    for (let i = contestManager.contests[contestType].contest.rounds.length - 1; i >= 0; i--) {
        const r = contestManager.contests[contestType].contest.rounds[i];
        if (now < r.startTime) {
            nextTime.value = new Date(r.startTime);
            color.value = 'white';
        } else if (now < r.endTime) {
            if (contestManager.config[contestType]?.rounds) round.value = `Round ${r.number + 1}`;
            else round.value = 'Contest';
            nextTime.value = new Date(r.endTime);
            color.value = 'var(--color-1)';
            inRound = true;
        }
    }
    updateFlash();
};
const updateFlash = () => {
    if (inRound) {
        if (nextTime.value.getTime() - Date.now() <= 300000) flashColor.value = 'var(--color-2)';
        else flashColor.value = 'var(--color-1)';
    } else if (Date.now() > (contestManager.contests[contestType]?.contest?.endTime ?? 0)) {
        flashColor.value = '';
    } else {
        if (nextTime.value.getTime() - Date.now() <= 60000) flashColor.value = 'var(--color-3)';
        else flashColor.value = 'white';
    }
};
watch(() => contestManager.contests[contestType]?.contest, updateTime);
onMounted(updateTime);
setInterval(updateFlash, 1000);

const emit = defineEmits<{
    (e: 'next', value: number): any
}>();

watch(nextTime, () => emit('next', nextTime.value.getTime()));
</script>

<template>
    <Transition>
        <div :class="'timer' + ($props.big ? '2' : '')" v-if="contestManager.contests[contestType] != null || route.query.ignore_server !== undefined" v-show="show">
            <GlitchText v-if="!props.timerOnly" :text="round" :class="'timerText' + ($props.big ? '2' : '')" :shadow="$props.big" :glow="$props.big" random on-visible></GlitchText>
            <TimerDisplay type="auto-timer" :to="nextTime" :class="'timerTime' + ($props.big ? '2' : '')" :shadow="$props.big" :glow="$props.big" :color="color" :flashing="flashColor != ''" :flash-color="flashColor == color ? undefined : flashColor" @zero="updateTime"></TimerDisplay>
        </div>
    </Transition>
</template>

<style scoped>
.timer,
.timer2 {
    display: grid;
    align-items: center;
    text-align: center;
}

.timer {
    min-width: 200px;
    grid-template-rows: 48px 48px;
    transition: 500ms min-width;
}

.timerText {
    font-size: 20px;
    text-wrap: balance;
    transition: 500ms font-size;
}

.timerText2 {
    font-size: 48px;
    text-wrap: nowrap;
}

.timerTime {
    margin-top: -4px;
    font-size: var(--font-huge);
    text-wrap: nowrap;
    transition: 500ms font-size;
    font-weight: normal;
}

.timerTime2 {
    font-size: var(--font-huge-title);
    text-wrap: nowrap;
}

.v-enter-active,
.v-leave-active {
    transition: 200ms ease min-width, 200ms ease max-width, 200ms linear opacity;
}

.v-enter-from,
.v-leave-to {
    min-width: 0px;
    max-width: 0px;
    opacity: 0;
}

.v-leave-from,
.v-enter-to {
    min-width: 150px;
    max-width: 150px;
    opacity: 1;
}

@media (max-width: 700px) {
    .timer {
        min-width: 110px;
        max-width: 110px;
        margin-left: -16px;
    }

    .timerText {
        font-size: 16px;
    }

    .timerTime {
        font-size: 30px;
    }

    .v-leave-from,
    .v-enter-to {
        min-width: 110px;
        max-width: 110px;
    }
}
</style>
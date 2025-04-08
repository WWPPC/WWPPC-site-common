<script setup lang="ts">
import TimeDisplay from '#/common/TimeDisplay.vue';
import { useContestManager } from '#/modules/ContestManager';
import { onMounted, ref, watch } from 'vue';
import ContestTimer from './ContestTimer.vue';

const props = defineProps<{
    contest: string
}>();
const contestType = props.contest;

const contestManager = useContestManager();

const currentRound = ref(0);
const roundTimes = ref<{ label: string, time: number }[]>([]);
const updateRoundTimes = () => {
    roundTimes.value = [];
    const contest = contestManager.contests[contestType];
    if (contest == undefined || contest.contest == null || contest.contest.rounds.length == 0) return;
    const times: { label: string, time: number }[] = [];
    const now = Date.now();
    currentRound.value = -1;
    times.push({
        label: 'Opening ceremonies',
        time: contest.contest.rounds[0].startTime - contest.contest.startTime
    }, {
        label: contestManager.config[contestType]?.rounds ? 'Round 1' : 'Contest',
        time: contest.contest.rounds[0].endTime - contest.contest.rounds[0].startTime
    });
    if (now > contest.contest.startTime && now < contest.contest.rounds[0].startTime) currentRound.value = 0;
    else if (now > contest.contest.rounds[0].startTime && now < contest.contest.rounds[0].endTime) currentRound.value = 1;
    for (let i = 1; i < contest.contest.rounds.length; i++) {
        times.push({
            label: 'Break',
            time: contest.contest.rounds[i].startTime - contest.contest.rounds[i - 1].endTime
        }, {
            label: 'Round ' + (i + 1),
            time: contest.contest.rounds[i].endTime - contest.contest.rounds[i].startTime
        });
        if (now > contest.contest.rounds[i - 1].endTime && now < contest.contest.rounds[i].startTime) currentRound.value = i * 2;
        else if (now > contest.contest.rounds[i].startTime && now < contest.contest.rounds[i].endTime) currentRound.value = i * 2 + 1;
    }
    times.push({
        label: 'Closing ceremonies',
        time: contest.contest.endTime - contest.contest.rounds[contest.contest.rounds.length - 1].endTime
    });
    if (currentRound.value == -1) currentRound.value = times.length - 1;
    roundTimes.value = times;
};
watch(() => contestManager.contests[contestType]?.contest, updateRoundTimes);
onMounted(updateRoundTimes);
</script>

<template>
    <div class="blockScrollWrapper">
        <div class="blockScrollContainer">
            <div class="blockScroll" v-for="t of roundTimes" :key="t.label">
                <div>{{ t.label }}</div>
                <TimeDisplay :time="t.time" form="short"></TimeDisplay>
            </div>
        </div>
        <ContestTimer :contest="props.contest" style="display: none;" @next="updateRoundTimes"></ContestTimer>
    </div>
</template>

<style scoped>
.blockScrollWrapper {
    position: relative;
    --actual-width: calc(100vw - 48px);
    width: var(--actual-width);
    font-size: var(--font-medium);
    overflow: hidden;
}

.blockScrollWrapper::after {
    content: ' ';
    position: absolute;
    top: calc(var(--actual-width) * -0.4);
    left: 0px;
    width: 100%;
    height: calc(100% + calc(var(--actual-width) * 0.8));
    box-shadow: 0px 0px calc(var(--actual-width) * 0.4) calc(var(--actual-width) * 0.2) black inset;
    pointer-events: none;
}

.blockScrollContainer {
    display: flex;
    width: min-content;
    transform: translateX(calc(v-bind("currentRound") * calc(var(--actual-width) * -0.2) + calc(var(--actual-width) * 0.4)));
    transition: 500ms ease transform;
    will-change: transform;
}

.blockScroll {
    display: flex;
    flex-direction: column;
    width: calc(var(--actual-width) * 0.2);
    text-align: center;
}

.blockScroll>div:first-child {
    height: 2.2em;
    align-content: center;
}

@media (max-width: 100vh) {
    .blockScrollWrapper::after {
        content: ' ';
        position: absolute;
        top: calc(var(--actual-width) * -0.3);
        width: 100%;
        height: calc(100% + 60vw);
        box-shadow: 0px 0px 30vw 15vw black inset;
    }

    .blockScrollContainer {
        display: flex;
        transform: translateX(calc(v-bind("currentRound") * calc(var(--actual-width) * -0.2) + calc(var(--actual-width) * 0.3)));
        transition: 500ms ease transform;
        will-change: transform;
    }

    .blockScroll {
        display: flex;
        flex-direction: column;
        width: 40vw;
        text-align: center;
        text-wrap: nowrap;
    }
}
</style>
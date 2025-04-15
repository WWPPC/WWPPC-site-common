<script setup lang="ts">
import LoadingSpinner from '#/common/LoadingSpinner.vue';
import { ref, watch } from 'vue';
import { useAccountManager } from '#/modules/AccountManager';
import { useContestManager } from '#/modules/ContestManager';
import GlitchSectionTitle from '#/common-components/GlitchSectionTitle.vue';
import { throttle } from '#/util/inputLimiting';
import { GlowText } from '#/text';

const props = defineProps<{
    contest: string
}>();
const contestType = props.contest;

const accountManager = useAccountManager();
const contestManager = useContestManager();

const scoreboardLoaded = ref<boolean>(false);
const scoreboard = ref<{
    team: number,
    name: string,
    score: number,
    penalty: number
}[]>([]);
watch(() => contestManager.contests[contestType]?.data.scoreboard, throttle(async () => {
    scoreboardLoaded.value = false;
    const results = await Promise.all((contestManager.contests[contestType]?.data.scoreboard ?? { scores: [], frozen: false }).scores.map(async (entry) => {
        const teamRes = await accountManager.fetchTeamData(entry.team.toString(36));
        return {
            team: entry.team,
            name: teamRes instanceof Response ? entry.team.toString() : teamRes.name,
            score: Math.ceil(entry.score),
            penalty: entry.penalty
        };
    }));
    results.sort((a, b) => {
        if (b.score - a.score !== 0) return b.score - a.score; //higher score is better
        return a.penalty - b.penalty; //lower penalty is better
    });
    scoreboard.value = results;
    scoreboardLoaded.value = true;
}, 5000));
</script>

<template>
    <GlitchSectionTitle text="Leaderboards" font-size="var(--font-title)"></GlitchSectionTitle>
    <GlitchSectionTitle v-if="contestManager.contests[contestType]?.data.scoreboard?.frozen" text="Standings frozen" font-size="var(--font-large)"></GlitchSectionTitle>
    <br>
    <div class="centered">
        <!-- todo: add button to update the leaderboard -->
        <div class="leaderboard">
            <div class="leaderboardItem" v-for="(item, i) of scoreboard" :key="i">
                {{ i + 1 }}.
                <RouterLink :to="'/team/@' + item.team.toString(36)">{{ item.name }}</RouterLink>
                - {{ item.score }} solved, {{ item.penalty }} penalty
            </div>
        </div>
        <div v-if="!scoreboardLoaded" style="display: flex; flex-direction: column; align-items: center;">
            <div style="width: 10vw; height: 10vw">
                <LoadingSpinner></LoadingSpinner>
            </div>
            <p style="margin-top: 2vw;">
                Please wait...
            </p>
        </div>
    </div>
    <!-- future - instead of just a link, show user summary in sidebar? -->
</template>

<style scoped>
.leaderboard {
    position: absolute;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    margin-bottom: 16px;
}

.leaderboardItem {
    background-color: #333;
    font-size: var(--font-large);
    border-radius: 8px;
    padding: 4px 8px;
}
</style>
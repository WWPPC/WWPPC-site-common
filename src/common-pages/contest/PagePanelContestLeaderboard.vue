<script setup lang="ts">
import LoadingSpinner from '#/common/LoadingSpinner.vue';
import { ref, watch } from 'vue';
import { useAccountManager } from '#/modules/AccountManager';
import { useContestManager, type ProblemSolveStatus } from '#/modules/ContestManager';
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
    penalty: number,
    solveStatus: ProblemSolveStatus[]
}[]>([]);
watch(() => contestManager.contests[contestType]?.data.scoreboard, throttle(async () => {
    scoreboardLoaded.value = false;
    const results = await Promise.all((contestManager.contests[contestType]?.data.scoreboard ?? { scores: [], frozen: false }).scores.map(async (entry) => {
        const teamRes = await accountManager.fetchTeamData(entry.team);
        return {
            team: entry.team,
            name: teamRes instanceof Response ? entry.team.toString() : teamRes.name,
            score: Math.round(entry.score),
            penalty: entry.penalty,
            solveStatus: entry.solveStatus
        };
    }));
    results.sort((a, b) => {
        if (b.score - a.score !== 0) return b.score - a.score; //higher score is better
        return a.penalty - b.penalty; //lower penalty is better
    });
    scoreboard.value = results;
    scoreboardLoaded.value = true;
}, 5000), { immediate: true });
</script>

<template>
    <GlitchSectionTitle text="Leaderboards" font-size="var(--font-title)"></GlitchSectionTitle>
    <GlitchSectionTitle v-if="contestManager.contests[contestType]?.data.scoreboard?.frozen" text="Standings frozen" font-size="var(--font-large)" color="var(--color-3)"></GlitchSectionTitle>
    <GlitchSectionTitle v-if="scoreboardLoaded && scoreboard.length === 0" text="No entries on leaderboard" font-size="var(--font-large)" color="var(--color-3)"></GlitchSectionTitle>
    <div class="centered">
        <br>
        <!-- todo: add button to update the leaderboard -->
        <div class="centered">
            <div class="leaderboard">
                <GlowText class="leaderboardData" text="#" glow color="var(--color-1)"></GlowText>
                <GlowText class="leaderboardData" text="Team" glow color="var(--color-1)"></GlowText>
                <GlowText class="leaderboardData" v-if="scoreboard.length > 0" v-for="(item, i) of scoreboard[0].solveStatus" :text="(item.round+1).toString() + '-' + (item.problem+1).toString()" glow color="var(--color-1)"></GlowText>
                <GlowText class="leaderboardData" text="Score" glow color="var(--color-1)"></GlowText>
                <GlowText class="leaderboardData" text="Penalty" glow color="var(--color-1)"></GlowText>
                <div class="leaderboardItem" v-for="(item, i) of scoreboard" :key="i">
                    <span class="leaderboardData">{{ i + 1 }}</span>
                    <span class="leaderboardData teamName">{{ item.name }}</span>
                    <div v-for="(item, j) of scoreboard[i].solveStatus" :class="item.solved ? 'solved' : item.incorrectSubmissions === 0 ? 'unattempted' : 'unsolved'">
                        {{ (item.solved ? "+" : item.incorrectSubmissions == 0 ? "" : "-") }}{{ item.incorrectSubmissions == 0 ? "" : item.incorrectSubmissions }}
                    </div>
                    <!-- <RouterLink :to="`/team/@${item.team}`" class="leaderboardData">{{ item.name }}</RouterLink> -->
                    <span class="leaderboardData">{{ item.score }}</span>
                    <span class="leaderboardData">{{ Math.round(item.penalty / 60 / 1000) }}</span>
                    <!--penalty is stored in ms, see scorer.ts-->
                </div>
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
    width: min-content;
    display: grid;
    grid-template-columns: repeat(v-bind("4 + (scoreboard.length === 0 ? 0 : scoreboard[0].solveStatus.length)"), auto);
    font-size: var(--font-medium);
    border: 1px solid white;
}
.leaderboardContainer {
    width: 100%;
    overflow: scroll;
    position: absolute;
}

.leaderboardItem {
    display: contents;
}

.leaderboardData, .leaderboardItem > * {
    border: 1px solid white;
    padding: 8px;
}

.teamName {
    max-width: 250px;
    min-width: 250px;
    width: 250px;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
}
/* .stickyLeft1 {
    max-width: 45px;
    min-width: 45px;
    width: 45px;
    position: sticky;
    left: 0;
    background-color: black;
}
.stickyLeft2 {
    max-width: 250px;
    min-width: 250px;
    width: 250px;
    position: sticky;
    left: 62px;
    background-color: black;
}
.stickyRight1 {
    max-width: 100px;
    min-width: 100px;
    width: 100px;
    position: sticky;
    right: 0;
    background-color: black;
}
.stickyRight2 {
    position: sticky;
    right: 117px;
    background-color: black;
} */

.solved {
    color: var(--color-1);
    background-color: color-mix(in srgb, var(--color-1) 10%, rgb(0, 0, 0, 0));
}
.unsolved {
    color: var(--color-2);
    background-color: color-mix(in srgb, var(--color-2) 10%, rgb(0, 0, 0, 0));
}
</style>
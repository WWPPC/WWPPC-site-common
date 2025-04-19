<script setup lang="ts">
import LoadingSpinner from '#/common/LoadingSpinner.vue';
import { ref, watch } from 'vue';
import { useAccountManager } from '#/modules/AccountManager';
import { useContestManager, type ProblemSolveStatus } from '#/modules/ContestManager';
import GlitchSectionTitle from '#/common-components/GlitchSectionTitle.vue';
import { throttle } from '#/util/inputLimiting';
import { GlowText } from '#/text';
import WaitCover from '#/common/WaitCover.vue';

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
        <table class="leaderboard">
            <thead>
                <tr>
                    <th class="leaderboardData">
                        <GlowText text="#" glow color="var(--color-1)"></GlowText>
                    </th>
                    <th class="leaderboardData"><GlowText text="Team" glow color="var(--color-1)"></GlowText>
                    </th>
                    <th v-if="scoreboard.length > 0" v-for="(item, i) of scoreboard[0].solveStatus.slice(0,16)" class="leaderboardData problem">
                        <GlowText :text="(item.round + 1).toString() + '-' + (item.problem + 1).toString()" glow color="var(--color-1)" font-size="var(--font-small)"></GlowText>
                    </th>
                    <th class="leaderboardData">
                        <GlowText text="Score" glow color="var(--color-1)"></GlowText>
                    </th>
                    <th class="leaderboardData">
                        <GlowText text="Pen" glow color="var(--color-1)"></GlowText>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr class="leaderboardItem" v-for="(item, i) of scoreboard" :key="i">
                    <td class="leaderboardData">{{ i + 1 }}</td>
                    <td class="leaderboardData teamName">{{ item.name }}</td>
                    <td v-for="(score, j) of scoreboard[i].solveStatus.slice(0,16)" :class="score.solved ? 'solved' : score.incorrectSubmissions === 0 ? 'unattempted' : 'unsolved'">
                        <span>
                            {{ (score.solved ? "+" : score.incorrectSubmissions == 0 ? "" : "-") }}{{ score.incorrectSubmissions == 0 ? "" : score.incorrectSubmissions }}
                        </span>
                        <br>
                        <span v-if="score.solved" class="leaderboardDataTime">
                            {{ new Date(score.solveTime - contestManager.contests[props.contest]?.data.contest?.rounds[score.round].startTime!).toISOString().substring(11, 16) }}
                        </span>
                    </td>
                    <td class="leaderboardData">{{ item.score }}</td>
                    <td class="leaderboardData">{{ Math.round(item.penalty / 60 / 1000) }}</td>
                    <!--penalty is stored in ms, see scorer.ts-->
                </tr>
            </tbody>
        </table>
        <div v-if="!scoreboardLoaded" style="display: flex; flex-direction: column; align-items: center;">
            <div class="leaderboardLoading">
                <div>
                    <LoadingSpinner></LoadingSpinner>
                    Please wait...
                </div>
            </div>
        </div>
    </div>
    <!-- future - instead of just a link, show user summary in sidebar? -->
</template>

<style scoped>
.leaderboard {
    width: min-content;
    font-size: var(--font-medium);
    border: 1px solid white;
    border-collapse: collapse;
}

.leaderboardData,
.leaderboardItem > * {
    border: 1px solid white;
    padding: 6px;
}

.leaderboardDataTime {
    font-size: var(--font-16);
    color: white;
}

.teamName {
    max-width: 200px;
    min-width: 200px;
    width: 200px;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
}

/* .stickyLeft1 {
    position: sticky;
    left: 0;
    z-index: 1;
    background-color: black;
}
.stickyLeft2 {
    position: sticky;
    left: 0;
    z-index: 2;
    background-color: black;
}
.stickyRight1 {
    position: sticky;
    right: 0;
    z-index: 1;
    background-color: black;
}
.stickyRight2 {
    position: sticky;
    right: 0;
    z-index: 2;
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
.solved, .unsolved, .problem {
    min-width: 40px;
}

.leaderboardLoading {
    display: flex;
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
}
.leaderboardLoading>div {
    width: 10vh;
    height: 10vh;
}
</style>
<script setup lang="ts">
import { GlitchText } from '#/text';
import LoadingSpinner from '#/common/LoadingSpinner.vue';
import { computed } from 'vue';
import { useAccountManager } from '#/modules/AccountManager';
import { useContestManager } from '#/modules/ContestManager';

const props = defineProps<{
    contest: string
}>();
const contestType = props.contest;

const accountManager = useAccountManager();
const contestManager = useContestManager();

const scoreboard = computed(async () => {
    return await Promise.all((contestManager.contests[contestType]?.scoreboard ?? []).map(async (entry) => {
        const teamRes = await accountManager.fetchTeamData(entry.team);
        return {
            team: entry.team,
            name: teamRes instanceof Response ? entry.team : teamRes.name,
            // penalty is stored as the fractional part of the score, see scorer.ts
            score: Math.ceil(entry.score),
            penalty: Math.floor((Math.ceil(entry.score) - entry.score) * 1000000)
        };
    }));
});
</script>

<template>
    <GlitchText text="Leaderboards" class="leaderboardTitle" font-size="var(--font-title)" color="var(--color-1)" shadow glow :steps=2 :delay=10 random on-visible></GlitchText>
    <div class="centered">
        <div class="leaderboard">
            <div class="leaderboardItem" v-for="(item, i) of await scoreboard" :key="i">
                {{ i + 1 }}.
                <RouterLink :to="'/team/@' + item.team">{{ item.name }}</RouterLink>
                - {{ item.score }} solved, {{ item.penalty }} penalty
            </div>
        </div>
        <div v-if="(await scoreboard).length == 0" style="display: flex; flex-direction: column; align-items: center;">
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
.leaderboardTitle {
    transform-origin: top;
    transform: translate3D(0px, -20vh, -50px) scale(150%);
    z-index: -1;
    text-align: center;
}

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
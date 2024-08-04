<script setup lang="ts">
import { GlitchText } from '#/text';
import LoadingSpinner from '#/common/LoadingSpinner.vue';
import { onMounted, ref, watch } from 'vue';
import { useAccountManager } from '#/scripts/AccountManager';
import { useContestManager } from '#/scripts/ContestManager';

const props = defineProps<{
    contest: string
}>();
const contestType = props.contest;

const accountManager = useAccountManager();
const contestManager = useContestManager();

const scoreboard = ref<{ username: string, displayName: string, score: number }[]>([]);
const update = async () => {
    if (contestManager[contestType]?.scoreboard == null) scoreboard.value = [];
    else scoreboard.value = await Promise.all(contestManager[contestType].scoreboard.map(async (s) => {
        const teamData = await accountManager.getTeamData(s.username);
        return {
            username: s.username,
            displayName: (teamData instanceof Error) ? s.username : teamData.teamName,
            score: Math.round(s.score * 1000) / 1000
        };
    }));
};
watch(() => contestManager.scoreboard, update);
onMounted(update);
</script>

<template>
    <GlitchText text="Leaderboards" class="leaderboardTitle" font-size="var(--font-title)" color="var(--color-1)" shadow glow :steps=2 :delay=10 random on-visible></GlitchText>
    <div class="centered">
        <div class="leaderboard">
            <div class="leaderboardItem" v-for="(item, i) of scoreboard" :key="i">
                {{ i + 1 }}.
                <RouterLink :to="'/user/@' + item.username">{{ item.displayName }}</RouterLink>
            </div>
        </div>
        <div v-if="contestManager.scoreboard == null" style="display: flex; flex-direction: column; align-items: center;">
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
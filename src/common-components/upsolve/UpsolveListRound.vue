<script setup lang="ts">
import { autoGlitchTextTransition } from '#/text';
import { AnimateInContainer, TitledCollapsibleContainer } from '#/containers';
import LoadingBar from '#/common/LoadingBar.vue';
import ContestProblemListProblem from '#/common-components/contest/problemList/ContestProblemListProblem.vue';
import { onMounted, ref, watch } from 'vue';
import { globalModal } from '#/modal';
import { useServerState } from '#/modules/ServerState';
import { type ContestProblem, ContestProblemCompletionState } from '#/modules/ContestManager';
import { useUpsolveManager, type UpsolveProblem, type UpsolveRound, type UpsolveSubmission } from '#/modules/UpsolveManager';

const props = defineProps<{
    data: UpsolveRound
    minimized?: boolean
}>();

const modal = globalModal();
const serverState = useServerState();
const upsolveManager = useUpsolveManager();

const titleText = autoGlitchTextTransition(() => 'Round ' + (props.data.number + 1), 40, 1, 10, 2);
const problems = ref<ContestProblem[] | null>(null);
let loaded = false;
const load = async () => {
    if (loaded) return;
    problems.value = await Promise.all(props.data.problems.map(async (id, i): Promise<ContestProblem> => {
        const problem: UpsolveProblem | Error = await upsolveManager.getProblemData(props.data.contest, props.data.number, i);
        if (problem instanceof Error) {
            modal.showModal({ title: problem.message, content: `Problem could not be fetched: ${props.data.contest} ${props.data.number}-${i}` })
            return {
                id: '',
                contest: '',
                round: 0,
                number: 0,
                name: 'Error',
                author: '',
                content: 'An error occured and the problem could not be loaded',
                constraints: { time: 0, memory: 0 },
                submissions: [],
                status: ContestProblemCompletionState.ERROR
            };
        }
        const submissions: UpsolveSubmission[] = (await upsolveManager.getSubmissions(id)) ?? [];
        return {
            ...problem,
            submissions: submissions,
            status: submissions[0]?.status ?? ContestProblemCompletionState.NOT_UPLOADED
        };
    }));
    loaded = true;
};
onMounted(async () => {
    if (!props.minimized) load();
});
if (!props.minimized) {
    serverState.onconnect(load);
    watch(() => serverState.loggedIn, load);
}
</script>

<template>
    <TitledCollapsibleContainer :title="titleText" class="archiveListRoundDropdown" :start-collapsed="$props.minimized" @open="load()">
        <AnimateInContainer type="fade" v-for="(problem, index) of problems" :key="index" :delay="index * 50">
            <ContestProblemListProblem :data="problem" archive></ContestProblemListProblem>
        </AnimateInContainer>
        <div class="centered" v-if="problems == null" style="margin: 8px 0px;">
            <LoadingBar width="max(50%, 100px)" height="16px"></LoadingBar>
        </div>
    </TitledCollapsibleContainer>
</template>

<style scoped>
.archiveListRoundDropdown {
    margin: -4px -4px;
}
</style>
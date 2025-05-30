<script setup lang="ts">
import { ProblemCompletionState, completionStateString } from '#/modules/ContestManager';
import { globalModal } from '#/modal';

const props = defineProps<{
    status: ProblemCompletionState
}>();

const modal = globalModal();

const completionStateAnimation = (status: ProblemCompletionState) => {
    return status == ProblemCompletionState.NOT_UPLOADED ? 'pstatus-not-uploaded' :
        status == ProblemCompletionState.UPLOADED ? 'pstatus-uploaded' :
            status == ProblemCompletionState.SUBMITTED ? 'pstatus-submitted' :
                status == ProblemCompletionState.GRADED_PASS ? 'pstatus-graded-pass' :
                    status == ProblemCompletionState.GRADED_FAIL ? 'pstatus-graded-fail' :
                        status == ProblemCompletionState.GRADED_PARTIAL ? 'pstatus-graded-partial' : 'pstatus-error'
};

const showModal = () => {
    modal.showModal({ title: 'Problem Status', content: `This problem is marked as "${completionStateString(props.status)}" for your team.` });
};
</script>

<template>
    <div class="contestProblemListProblemStatus" :title="completionStateString(props.status)" @dblclick="showModal"></div>
</template>

<style>
@keyframes p-brightness-oscillation {
    from {
        filter: brightness(1);
    }

    to {
        filter: brightness(0.8);
    }
}

@keyframes pstatus-not-uploaded {

    from,
    to {
        color: #FFF;
    }
}

@keyframes pstatus-uploaded {

    from,
    to {
        color: #0FF;
    }
}

@keyframes pstatus-submitted {

    from,
    to {
        color: #08F;
    }
}

@keyframes pstatus-graded-pass {

    from,
    to {
        color: #0F0;
    }
}

@keyframes pstatus-graded-fail {

    from,
    to {
        color: #F00;
    }
}

@keyframes pstatus-graded-partial {

    from,
    to {
        color: #FF0;
    }
}

@keyframes pstatus-error {

    0%,
    100% {
        color: hsl(0deg, 100%, 50%);
    }

    10%,
    90% {
        color: hsl(12deg, 100%, 50%);
    }

    20%,
    80% {
        color: hsl(24deg, 100%, 50%);
    }

    30%,
    70% {
        color: hsl(36deg, 100%, 50%);
    }

    40%,
    60% {
        color: hsl(48deg, 100%, 50%);
    }

    50% {
        color: hsl(60deg, 100%, 50%);
    }
}
</style>
<style scoped>
.contestProblemListProblemStatus {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    animation: 2000ms linear v-bind("completionStateAnimation(props.status)") alternate infinite, 2000ms ease p-brightness-oscillation alternate infinite;
    border-radius: 50%;
    background-color: currentColor;
    box-shadow: 0px 0px 4px currentColor;
    cursor: help;
}
</style>
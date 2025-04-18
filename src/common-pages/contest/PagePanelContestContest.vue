<script setup lang="ts">
import ScrollIndicator from '#/common/ScrollIndicator.vue';
import ContestTimer from '#/common-components/contest/ContestTimer.vue';
import ContestRoundDisplay from '#/common-components/contest/ContestRoundDisplay.vue';
import { AnimateInContainer, TitledCutCornerContainer } from '#/containers';
import { InputIconButton } from '#/inputs';
import GlitchSectionTitle from '#/common-components/GlitchSectionTitle.vue';
import { useContestManager } from '#/modules/ContestManager';

const props = defineProps<{
    contest: string
}>();
const contestType = props.contest;

const contestManager = useContestManager();
</script>

<template>
    <div class="fullBlock stretchBlock">
        <div class="timerContainer">
            <GlitchSectionTitle :text="contestManager.contests[contestType]?.data.contest?.id ?? 'Not in contest'" font-size="var(--font-small-title)"></GlitchSectionTitle>
            <ContestTimer big :contest="props.contest"></ContestTimer>
        </div>
        <div style="flex-grow: 1"></div>
        <ContestRoundDisplay :contest="props.contest"></ContestRoundDisplay>
        <ScrollIndicator anchor="a[name=pageContestContestScrollTo]"></ScrollIndicator>
    </div>
    <div class="fullBlock stretchBlock">
        <a name="pageContestContestScrollTo"></a>
        <div class="contestInstructionBlock">
            <AnimateInContainer type="slideUp" style="grid-column: span 2;">
                <TitledCutCornerContainer title="Instructions" height="100%" align="center" hover-animation="lift">
                    <div class="centered">
                        <div v-if="contestManager.config[contestType]?.submitSolver">
                            <h3>General Instructions</h3>
                            <p style="font-size: var(--font-20);">
                            <ul>
                                <li v-if="contestManager.config[contestType]?.rounds">Problems are submittable <b>ONLY during</b> rounds</li>
                                <li>Scores are based on the <b>number</b> of problems solved with ties broken by time of last submission that increases score</li>
                                <li><b>All</b> cases per problem must pass for problem to be marked correct</li>
                                <li>Submissions are across your entire team</li>
                                <li>Not all problems are meant to be solved within the time limit</li>
                                <li>10 minutes time penalty for every wrong submission, including compile errors</li>
                                <li>Your <b>last submission</b> is used to calculate score, even if it comes after an accepted submission</li>
                                <li>The first test case is not necessarily sample input</li>
                            </ul>
                            </p>
                            <h3>Technical Details</h3>
                            <p style="font-size: var(--font-20);">
                            <ul>
                                <li>Input is fed through <code>stdin</code>, output is read from <code>stdout</code></li>
                                <li>Exiting with a non-zero code will result in a <b>runtime error</b></li>
                                <li>Java: Class name must be <code>Main</code></li>
                                <li>C/C++: Programs are compiled with the gcc/g++ <code>-O2</code> flag</li>
                            </ul>
                            </p>
                        </div>
                        <div v-else>
                            <h3>General Instructions</h3>
                            <p style="font-size: var(--font-20);">
                            <ul>
                                <li v-if="contestManager.config[contestType]?.rounds">Problems are submittable <b>ONLY during</b> rounds</li>
                                <li>Work quickly, scores are based on the <b>number</b> of problems solved</li>
                                <li>Solutions are pasted as strings into a solution box, whitespace sensitive</li>
                                <li>Submissions are across your <b>ENTIRE TEAM</b></li>
                                <li>Not all problems are meant to be solved within the time limit</li>
                                <li>Time penalties are small - they are meant to be tiebreakers</li>
                            </ul>
                            </p>
                            <!-- <h3>Technical Details</h3>
                            <p style="font-size: var(--font-20);">
                            <ul>
                            </ul>
                            </p> -->
                        </div>
                    </div>
                </TitledCutCornerContainer>
            </AnimateInContainer>
            <AnimateInContainer type="slideUp">
                <TitledCutCornerContainer title="Important Info" height="100%" align="center" hover-animation="lift" flipped vertical-flipped>
                    <p style="text-align: center; font-size: var(--font-20); margin: 0px;">
                        <b>Opening/closing ceremonies, updates, and clarifications will be on Discord!</b>
                    </p>
                    <div class="centered">
                        <a href="https://discord.wwppc.tech" target="_blank" style="text-decoration: none; text-align: center;">
                            <InputIconButton text="Join Discord" img="/img/discord-logo.svg" color="link" font-size="var(--font-medium)" img-hover-color="#5865F2"></InputIconButton>
                        </a>
                    </div>
                </TitledCutCornerContainer>
            </AnimateInContainer>
            <AnimateInContainer type="slideUp">
                <TitledCutCornerContainer title="Good Luck!" height="100%" align="center" hover-animation="lift" vertical-flipped>
                    <p style="text-align: center;">
                        The WWPPC Team wishes you good luck!
                        <br>
                        Also, have fun!!!!!
                    </p>
                </TitledCutCornerContainer>
            </AnimateInContainer>
        </div>
    </div>
</template>

<style scoped>
.stretchBlock {
    display: flex;
    flex-direction: column;
}

.timerContainer {
    transform-origin: top;
    transform: translate3D(0px, -20vh, -50px) scale(150%);
    transform-style: preserve-3d;
    z-index: -1;
    text-align: center;
}

.timerTitle {
    transform-origin: top;
    transform: translate3D(0px, -10vh, -50px) scale(125%);
}

.contestInstructionBlock {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr min-content;
    row-gap: 24px;
    column-gap: 24px;
    flex-grow: 1;
}
</style>
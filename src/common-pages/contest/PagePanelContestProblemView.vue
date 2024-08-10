<script setup lang="ts">
import { setTitlePanel } from '#/scripts/title';
import { DoubleCutCornerContainer, TitledCutCornerContainer, AnimateInContainer } from '#/containers';
import { InputButton, InputCopyButton, InputFileUpload, InputIconButton, InputTextBox } from '#/inputs';
import InputDropdown from '#/inputs/InputDropdown.vue'; // this is required for spaghetti fix
import WaitCover from '#/common/WaitCover.vue';
import ContestProblemStatusCircle from '#/common-components/contest/ContestProblemStatusCircle.vue';
import ContestProblemSubmissionCase from '#/common-components/contest/ContestProblemSubmissionCase.vue';
import { autoGlitchTextTransition } from '#/text';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { globalModal } from '#/modal';
import { useServerConnection } from '#/scripts/ServerConnection';
import { completionStateString, type ContestProblem, ContestProblemCompletionState, ContestUpdateSubmissionResult, getUpdateSubmissionMessage, useContestManager } from '#/scripts/ContestManager';
import { useUpsolveManager } from '#/scripts/UpsolveManager';
import latexify from '#/scripts/katexify';

// despaghettifier
const props = defineProps<{
    contest: string
    isUpsolve?: boolean
}>();
const contestType = props.contest;

const route = useRoute();
const router = useRouter();
const serverConnection = useServerConnection();
const contestManager = useContestManager();
const upsolveManager = useUpsolveManager();
const modal = globalModal();

// placeholder data behind loading cover
const problem = ref<ContestProblem>({
    id: 'loading',
    contest: 'WWPIT Loading Contest',
    round: 0,
    number: 0,
    name: 'Loading Problem...',
    author: 'Loading Screen',
    content: `
<b>Lorem ipsum dolor sit amet</b>,
<br><br>
<a href="https://wwppc.tech">c</a>onsectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
<br><br>
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. $\\sum_{i=0}^{\\infty}$ Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
<br><br>
<codeblock>function sum(a, b) {
    if (b > a) {
        let c = a;
        a = b;
        b = c;
    }
    let sum = a;
    let i = 0;
    do {
        sum++;
        i = i + 1;
    } while (i < b);
    return sum;
}
</codeblock>
    `,
    constraints: { memory: 0, time: 0 },
    submissions: [],
    status: ContestProblemCompletionState.ERROR,
});
let problemId: string | undefined = undefined;
const loadErrorModal = (title: string, content: string) => {
    modal.showModal({
        title: title,
        content: content + '<br>Click <code>OK</code> to return to problem list.',
        color: 'var(--color-2)'
    }).result.then(() => {
        router.push(`./problemList`);
    });
};
const loadProblem = async () => {
    if (route.query.ignore_server !== undefined || contestManager.contests[contestType] === undefined) return;
    if (!props.isUpsolve) {
        await contestManager.contests[contestType].waitForContestLoad();
        if (route.params.problemId !== undefined) {
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.exec(route.params.problemId.toString())) {
                loadErrorModal('Malformed problem ID', 'The supplied problem ID is invalid!');
                return;
            }
            const p = await contestManager.contests[contestType].getProblemDataId(route.params.problemId.toString());
            if (p === null) {
                loadErrorModal('Problem not found', 'The requested problem does not exist!');
                return;
            }
            problem.value = p;
            // latexify(problem.value.content).then((html) => problemContent.value = html);
        } else if (route.params.problemRound !== undefined && route.params.problemNumber !== undefined) {
            const p = await contestManager.contests[contestType].getProblemData(Number(route.params.problemRound.toString()), Number(route.params.problemNumber.toString()));
            if (p === null) {
                loadErrorModal('Problem not found', 'The requested problem does not exist!');
                return;
            }
            problem.value = p;
            // latexify(problem.value.content).then((html) => problemContent.value = html);
        } else if (route.query.ignore_server === undefined) {
            loadErrorModal('No problem ID', 'No problem ID was supplied!');
        }
    } else {
        if (isNaN(Number(route.params.archiveRound)) || isNaN(Number(route.params.archiveProblem))) {
            loadErrorModal('Invalid round or problem number', 'The round or problem is not a number.');
            return;
        }
        const p = await upsolveManager.getProblemData(route.params.archiveContest.toString(), Number(route.params.archiveRound), Number(route.params.archiveProblem));
        if (p instanceof Error) {
            loadErrorModal(p.message, 'Could not load the problem.');
            return;
        }
        problem.value = {
            ...p,
            submissions: [],
            status: ContestProblemCompletionState.NOT_UPLOADED
        };
        problemId = p.id;
        // latexify(problem.value.content).then((html) => problemContent.value = html);
        updateSubmissions();
    }
    await nextTick();
    // latexify(problem.value.content).then((html) => problemContent.value = html);
    // setTimeout(() => latexify(problem.value.content).then((html) => problemContent.value = html), 1000);
};
onMounted(loadProblem);
watch(() => contestManager.contests[contestType]?.contest, loadProblem);
watch(() => route.params.problemId, loadProblem);
watch(() => route.params.problemRound, loadProblem);
watch(() => route.params.problemNumber, loadProblem);

const updateSubmissions = () => {
    setTimeout(async () => {
        if (problemId == undefined) return;
        const s = await upsolveManager.getSubmissions(problemId) ?? [];
        problem.value.submissions = s;
        problem.value.status = s[0]?.status ?? ContestProblemCompletionState.NOT_UPLOADED;
    }, 100);
};
if (props.isUpsolve) {
    watch(() => upsolveManager.submissionsUpdated, updateSubmissions);
    watch(() => serverConnection.loggedIn, updateSubmissions);
}

watch(() => problem.value.name, () => {
    setTitlePanel(problem.value.name);
});
const problemName = autoGlitchTextTransition(() => problem.value.name, 40, 1, 20);
const problemSubtitle1 = autoGlitchTextTransition(() => {
    if (problem.value.contest === undefined) return `By ${problem.value.author}`;
    return `${problem.value.contest} ${contestManager.config[contestType]?.rounds ? `${problem.value.round + 1}-` : ''}${problem.value.number + 1}; by ${problem.value.author}`;
}, 40, 1, 20);
const problemSubtitle2 = autoGlitchTextTransition(() => `${problem.value.constraints.memory}MB, ${problem.value.constraints.time}ms&emsp;|&emsp;${completionStateString(problem.value.status)}`, 40, 1, 20);

// uploads
const fileUpload = ref<InstanceType<typeof InputFileUpload>>();
const languageDropdown = ref<InstanceType<typeof InputDropdown>>();
const submitButton = ref<InstanceType<typeof InputButton>>();
const handleUpload = () => {
    const file: File | undefined | null = fileUpload.value?.files?.item(0);
    if (fileUpload.value == undefined || file == undefined) return;
    if (file.size > (contestManager.config[contestType]?.maxSubmissionSize ?? 0)) {
        fileUpload.value.resetFileList();
        modal.showModal({
            title: 'File size too large',
            content: 'The maximum file size for submissions is 10kB',
            color: 'var(--color-2)'
        });
        return;
    }
    const ext = file.name.split(".").at(-1);
    if (languageDropdown.value == undefined || ext == undefined) return;
    const options = Array.from(languageDropdown.value.items).reverse();
    for (const option of options) {
        if (option.value.includes(ext)) {
            languageDropdown.value.value = option.value;
            break;
        }
    }
};
const submitUpload = async () => {
    if (contestManager.contests[contestType] == undefined || languageDropdown.value?.value == undefined || languageDropdown.value?.value == '' || fileUpload.value == null || fileUpload.value.files == null) {
        return;
    }
    const file = fileUpload.value.files.item(0);
    if (file == null) {
        modal.showModal({ title: 'No file selected', content: 'No file was selected!', color: 'var(--color-2)' });
        return;
    }
    const status = await (props.isUpsolve ? upsolveManager : contestManager.contests[contestType]).updateSubmission(problem.value.id, (languageDropdown.value.value as string), await file.text());
    if (status != ContestUpdateSubmissionResult.SUCCESS) {
        modal.showModal({ title: 'Could not submit', content: getUpdateSubmissionMessage(status), color: 'var(--color-2)' })
    } else {
        modal.showModal({ title: 'Submission uploaded', content: 'Grading will happen soon', color: 'var(--color-1)' });
    }
    fileUpload.value.resetFileList();
    languageDropdown.value.value = '';
};

// other uploads
const answerInput = ref('');
const submit = async () => {
    if (contestManager.config[contestType]?.submitSolver) {
        await submitUpload();
    } else {
        if (contestManager.contests[contestType] == undefined) return;
        if (answerInput.value.trim() == '') {
            modal.showModal({ title: 'No answer', content: 'Your answer cannot be blank!', color: 'var(--color-2)' });
            return;
        }
        const status = await (props.isUpsolve ? upsolveManager : contestManager.contests[contestType]).updateSubmission(problem.value.id, 'Text', answerInput.value);
        if (status != ContestUpdateSubmissionResult.SUCCESS) {
            modal.showModal({ title: 'Could not submit', content: getUpdateSubmissionMessage(status), color: 'var(--color-2)' })
        }
        answerInput.value = '';
    }
};

// submit button spaghetti
const disableSubmit = ref(true);
const updateSubmitButton = () => {
    disableSubmit.value = (contestManager.config[contestType]?.submitSolver && (languageDropdown.value == undefined || languageDropdown.value?.value == '' || fileUpload.value?.files == null || fileUpload.value?.files.item(0) == null))
        || (!contestManager.config[contestType]?.submitSolver && answerInput.value.trim() == '')
        || (!props.isUpsolve && (contestManager.contests[contestType]?.contest == null
            || (contestManager.contests[contestType]?.contest?.rounds[problem.value.round].startTime ?? 0) > Date.now()
            || (contestManager.contests[contestType]?.contest?.rounds[problem.value.round].endTime ?? Infinity) <= Date.now()));
};
watch(() => languageDropdown.value?.value, updateSubmitButton);
watch(() => fileUpload.value?.files, updateSubmitButton);
watch(() => answerInput.value, updateSubmitButton);
setInterval(updateSubmitButton, 1000);

// MASSIVE SPAGHETTI BECAUSE CONTEST ISNT REACTIVE ANYMORE
const a = ref(true);
watch(() => contestManager.contests[contestType], () => contestManager.contests[contestType]?.onSpaghetti(async () => {
    loadProblem();
    // const buh = problem.value.submissions;
    // problem.value.submissions = [];
    // await nextTick();
    // problem.value.submissions = buh;
    a.value = false;
    await nextTick();
    a.value = true;
    // latexify(problem.value.content).then((html) => problemContent.value = html);
}));

// thing for katex
// using ref instead of v-html fix?
const problemContent = ref<HTMLDivElement>();
watch(() => problem.value.content, () => {
    latexify(problem.value.content).then((html) => {if (problemContent.value) problemContent.value.innerHTML = html});
});
onMounted(() => {
    // latexify(problem.value.content).then((html) => problemContent.value = html);
});

// view submission code
const showCode = ref(false);
const submissionCode = ref('');
const viewCode = async () => {
    if (contestManager.contests[contestType] == undefined) return;
    submissionCode.value = await (props.isUpsolve ? upsolveManager : contestManager.contests[contestType]).getSubmissionCode(problem.value.id);
    showCode.value = true;
};
</script>

<template>
    <div style="margin-left: -4px; width: min-content;">
        <RouterLink :to="((route.params.problemId !== undefined || route.params.problemNumber !== undefined) ? '.' : '') + (props.isUpsolve ? ('./archive/' + route.params.archiveContest) : './problemList')" no-deco>
            <InputIconButton :text="`Back to ${props.isUpsolve ? route.params.archiveContest : 'Problem List'}`" img="/assets/arrow-left.svg" color="var(--color-1)"></InputIconButton>
        </RouterLink>
    </div>
    <div class="problemViewPanel">
        <div class="problemViewDouble">
            <TitledCutCornerContainer :title="problemName" style="grid-row: span 3;" vertical-flipped no-padding>
                <div class="problemViewSubtitle">
                    <span v-html="problemSubtitle1" style="font-weight: bold; grid-row: 1;"></span>
                    <span v-html="problemSubtitle2" style="grid-row: 2;"></span>
                    <ContestProblemStatusCircle :status="problem.status" style="grid-row: span 2;"></ContestProblemStatusCircle>
                </div>
                <div class="problemViewContent" ref="problemContent"></div>
                <WaitCover class="problemLoadingCover" text="Loading..." :show="problem.id == 'loading' && route.query.ignore_server === undefined"></WaitCover>
            </TitledCutCornerContainer>
            <DoubleCutCornerContainer>
                <div style="text-align: center;">
                    <h3>Submit</h3>
                    <p style="text-align: justify; font-size: var(--font-small);">
                        <span v-if="props.isUpsolve" style="text-align: center;">
                            <b>You are submitting in analysis mode.</b>
                        </span>
                        <span v-else>
                            You can submit and test anytime, but only the last submission is scored. You cannot submit after a round ends.
                        </span>
                        <span v-if="contestManager.config[contestType]?.submitSolver">
                            <br>
                            <i>Java and Python submissions have double the stated time limit.</i>
                        </span>
                    </p>
                </div>
                <br>
                <form class="problemViewSubmitForm" action="javascript:void(0)">
                    <div class="problemViewSubmitFormInner" v-if="contestManager.config[contestType]?.submitSolver">
                        <span>Source code:</span>
                        <InputFileUpload ref="fileUpload" @input=handleUpload accept=".c,.cpp,.py,.java"></InputFileUpload>
                        <span>Language:</span>
                        <InputDropdown ref="languageDropdown" :items="contestManager.config[contestType]?.acceptedSolverLanguages.map((a) => ({ text: a, value: a })) ?? []" required></InputDropdown>
                    </div>
                    <div class="problemViewSubmitFormInner" v-else>
                        <span>Answer:</span>
                        <InputTextBox v-model="answerInput"></InputTextBox>
                    </div>
                    <InputButton ref="submitButton" :text="contestManager.config[contestType]?.submitSolver ? 'Upload Submission' : 'Submit'" type="submit" width="min-content" @click="submit" :disabled="disableSubmit"></InputButton>
                    <div style="text-align: center; color: var(--color-3);" v-if="!serverConnection.loggedIn">
                        <i>You must be signed in to submit solutions</i>
                    </div>
                </form>
            </DoubleCutCornerContainer>
            <DoubleCutCornerContainer flipped v-if="a">
                <h3 class="submissionsHeader">Previous submissions</h3>
                <AnimateInContainer type="fade" v-for="(submission, index) in problem.submissions" :key="submission.time" :delay="index * 50">
                    <div class="submissionContainer">
                        <label class="submissionTitle" :for="'submissionCheckbox' + index">
                            <ContestProblemStatusCircle :status="submission.status"></ContestProblemStatusCircle>
                            <span style="margin-left: 8px;">{{ completionStateString(submission.status) }} ({{ submission.lang }} - {{ new Date(submission.time).toLocaleString() }})</span>
                            <button v-if="index == 0" class="submissionOpenCode" @click="viewCode()" title="View submission code">
                                <!-- actually stupid -->
                                <img src="../../../public/assets/open.svg">
                            </button>
                        </label>
                        <input type="checkbox" class="submissionCheckbox" :id="'submissionCheckbox' + index">
                        <div class="submissionDetailsWrapper">
                            <div class="submissionDetails">
                                <ContestProblemSubmissionCase v-for="(testCase, index2) in submission.scores" :key="index2" :case="testCase" :number="index2"></ContestProblemSubmissionCase>
                                <div style="text-align: center; font-size: var(--font-tiny);" v-if="submission.scores.length == 0">
                                    <i>Please wait while the grading system runs your submission...</i>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimateInContainer>
                <div style="text-align: center; color: var(--color-3);" v-if="!serverConnection.loggedIn">
                    <i>You must be signed in to submit solutions</i>
                </div>
                <div v-else-if="problem.submissions.length == 0" style="text-align: center;"><i>You have not submitted any solutions yet.</i></div>
            </DoubleCutCornerContainer>
        </div>
    </div>
    <Transition>
        <div class="submissionCodeContainerWrapper" v-if="showCode">
            <div class="submissionCodeContainer">
                <TitledCutCornerContainer :title="problem.submissions[0]?.lang + ' - ' + new Date(problem.submissions[0]?.time).toLocaleString()" height="100%" vertical-flipped>
                    <codeblock class="submissionCode">
                        {{ submissionCode }}
                    </codeblock>
                    <InputCopyButton :value="submissionCode" class="submissionCodeCopy"></InputCopyButton>
                </TitledCutCornerContainer>
                <InputIconButton text="" img="/assets/close.svg" img-only img-hover-color="var(--color-2)" title="Close" class="submissionCodeClose" @click="showCode = false"></InputIconButton>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.problemViewPanel {
    display: flex;
    flex-direction: column;
    height: calc(100% - 48px);
    margin-top: 16px;
}

.previousProblemStatusCircle {
    grid-row: 2;
}

.problemStatus {
    grid-column: 2;
    grid-row: 3;
    font-size: 20px;
}

.previousProblemListName {
    grid-column: 2;
    column-width: 10000px;
    grid-row: 1;
    margin: 10%;
    font-size: 20px;
}

.problemViewDouble {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(380px, 35vw);
    grid-template-rows: min-content minmax(200px, min-content) minmax(0, 1fr);
    row-gap: 16px;
    column-gap: 16px;
    height: 100%;
}

@media (max-width: 800px) {
    .problemViewPanel {
        height: unset;
    }

    .problemViewDouble {
        grid-template-columns: 1fr;
    }
}

.problemViewSubtitle {
    display: grid;
    grid-template-columns: 1fr min-content;
    grid-template-rows: min-content min-content;
    box-sizing: border-box;
    width: calc(100% - 16px);
    padding: 8px 12px;
    margin: 8px 8px;
    border-radius: 8px;
    background-color: #333;
    font-weight: normal;
    font-family: 'Source Code Pro', Courier, monospace;
    font-size: var(--font-small);
    align-items: center;
}

.problemViewContent {
    margin: 0px 8px;
    padding-bottom: 8px;
    font-size: var(--font-small);
    text-align: justify;
}

.problemLoadingCover {
    position: sticky;
}

.problemViewSubmitForm {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.problemViewSubmitFormInner {
    display: grid;
    grid-template-columns: max-content min-content;
    row-gap: 8px;
    column-gap: 8px;
    margin-bottom: 4px;
}

.problemViewSubmitFormInner>*:nth-child(odd) {
    justify-self: right;
}

.submissionsHeader {
    position: sticky;
    top: 6px;
    width: 100%;
    padding: 0px 4px;
    text-align: center;
    background-color: black;
    box-shadow: 0px 0px 8px 4px black;
    margin-bottom: 12px;
    transform: translateX(-4px);
    z-index: 1;
}

.submissionsHeader::after {
    content: ' ';
    position: absolute;
    top: -20px;
    left: 0px;
    width: 100%;
    height: 20px;
    background-color: black;
}

.submissionContainer {
    display: flex;
    flex-direction: column;
    background-color: #222;
    border: 2px solid white;
    border-radius: 8px;
    margin-bottom: 8px;
}

.submissionTitle {
    display: grid;
    grid-template-columns: 32px 1fr 24px;
    grid-auto-flow: column;
    align-items: center;
    padding: 4px 4px;
    border: 2px solid white;
    margin: -2px -2px;
    border-radius: 8px;
    background-color: #333;
    transition: 50ms linear background-color;
    cursor: pointer;
}

.submissionTitle:hover {
    background-color: #444;
}

.submissionCheckbox {
    position: absolute;
    width: 0px;
    height: 0px;
    visibility: hidden;
}

.submissionOpenCode {
    width: 24px;
    height: 24px;
    padding: 2px;
    background-color: transparent;
    border: none;
    border-radius: 50%;
    transition: 50ms linear background-color;
    cursor: pointer;
}

.submissionOpenCode>img {
    width: 100%;
}

.submissionOpenCode:hover {
    background-color: #FFF4;
}

.submissionDetailsWrapper {
    position: relative;
    box-sizing: border-box;
    transition: 200ms ease min-height, 200ms ease max-height;
    min-height: 0px;
    max-height: 0px;
    overflow-x: scroll;
    overflow-y: hidden;
}

.submissionCheckbox:checked~.submissionDetailsWrapper {
    min-height: 76px;
    max-height: 76px;
}

.submissionDetailsWrapper::-webkit-scrollbar {
    height: 0px;
}

.submissionDetails {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 5px 4px;
    min-width: min-content;
    column-gap: 4px;
}

.submissionCodeContainerWrapper {
    display: grid;
    grid-template-rows: 1fr 90% 1fr;
    grid-template-columns: 1fr 50% 1fr;
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
}

.submissionCodeContainer {
    grid-row: 2;
    grid-column: 2;
    position: relative;
}

.submissionCodeClose {
    position: absolute;
    top: 13px;
    right: 4px;
}

.submissionCode {
    height: calc(100% - 12px);
    margin-bottom: 0px;
}

.submissionCodeCopy {
    position: absolute;
    top: 24px;
    right: 38px;
}

.v-enter-active,
.v-leave-active {
    transition: 300ms linear opacity;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

.v-enter-active>.submissionCodeContainer,
.v-leave-active>.submissionCodeContainer {
    transition: 300ms ease-in-out transform;
}

.v-enter-from>.submissionCodeContainer,
.v-leave-to>.submissionCodeContainer {
    transform: translateY(-100%);
}
</style>
<script setup lang="ts">
import { PanelBody, PanelHeader, PanelMain, PanelView, PanelNavLargeLogo } from '#/panels';
import { InputButton, InputDropdown, InputTextBox } from '#/inputs';
import { PairedGridContainer } from '#/containers';
import WaitCover from '#/common/WaitCover.vue';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { globalModal } from '#/modal';
import { useServerState } from '#/modules/ServerState';
import { languageMaps, experienceMaps, gradeMaps, useAccountManager } from '#/modules/AccountManager';

const router = useRouter();
const route = useRoute();

// connection modals
const modal = globalModal();
const serverState = useServerState();
const accountManager = useAccountManager();

watch([() => route.params.page, () => serverState.loggedIn], async () => {
    // redirect away from login (if redirected to login elsewhere) if logged in
    if (route.params.page == 'login' && route.query.ignore_server === undefined) {
        if (serverState.loggedIn) router.replace({ path: (typeof route.query.redirect == 'string' ? route.query.redirect : (route.query.redirect ?? [])[0]) ?? '/home?clearQuery', query: { clearQuery: 1 } });
    } else {
        page.value = 0;
        loginError.value = '';
    }
});

const page = ref(0);
const usernameInput = ref('');
const passwordInput = ref('');
const loginError = ref('');
const firstNameInput = ref('');
const lastNameInput = ref('');
const emailInput = ref('');
const email2Input = ref('');
const organizationInput = ref('');
const gradeInput = ref('');
const experienceInput = ref('');
const languageInput = ref<string[]>([]);
const showLoginWait = ref(false);
const showRecoveryWait = ref(false);
const attemptedRecovery = ref(false);
const validateCredentials = (checkPass: boolean = true): boolean => {
    if (usernameInput.value.length == 0) {
        loginError.value = 'Please enter username';
        return false;
    }
    if (usernameInput.value.length > 16) {
        loginError.value = 'Username must be less than 16 characters in length';
        return false;
    }
    if (!/^[a-z]([a-z0-9-]*[a-z0-9])?$/.test(usernameInput.value)) {
        loginError.value = 'Username must contain only lowercase letters (a-z), numbers (0-9), underscores ("_"), and dashes ("-").';
        return false;
    }
    if (!checkPass) return true;
    if (passwordInput.value.length == 0) {
        loginError.value = 'Please enter a password';
        return false;
    }
    if (passwordInput.value.length > 1024) {
        loginError.value = 'Password must be less than 1024 characters in length';
    }
    return true;
};
const attemptLogin = async () => {
    if (!validateCredentials()) return;
    loginError.value = '';
    showLoginWait.value = true;
    const res = await accountManager.login(usernameInput.value, passwordInput.value);
    showLoginWait.value = false;
    if (res.ok) {
        router.push({
            path: (typeof route.query.redirect == 'string' ? route.query.redirect : (route.query.redirect ?? [])[0]) ?? '/home',
            query: { clearQuery: 1 }
        });
    } else {
        loginError.value = await res.text();
    }
};
const toSignUp = async () => {
    if (!validateCredentials()) return;
    loginError.value = '';
    // warn if account already exists
    showLoginWait.value = true;
    const res = await accountManager.fetchAccountData(usernameInput.value);
    showLoginWait.value = false;
    if (res instanceof Response) {
        if (res.status != 404) {
            loginError.value = await res.text();
            return;
        }
    } else {
        loginError.value = 'Account already exists';
        return;
    }
    // reset fields because sometimes it doesn't do that
    firstNameInput.value = '';
    lastNameInput.value = '';
    emailInput.value = '';
    email2Input.value = '';
    organizationInput.value = '';
    gradeInput.value = '';
    experienceInput.value = '';
    languageInput.value = [];
    page.value = 1;
};
const attemptSignup = async () => {
    if (!validateCredentials()) return;
    if (firstNameInput.value.trim().length == 0 || lastNameInput.value.trim().length == 0 || emailInput.value.trim().length == 0
        || gradeInput.value == '' || experienceInput.value == '') {
        loginError.value = 'Please fill out all required fields';
        return;
    }
    loginError.value = '';
    showLoginWait.value = true;
    const res = await accountManager.signup(usernameInput.value, passwordInput.value, {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        email2: email2Input.value.trim(),
        organization: organizationInput.value.trim(),
        grade: Number(gradeInput.value),
        experience: Number(experienceInput.value),
        languages: languageInput.value
    });
    showLoginWait.value = false;
    if (res.ok) {
        router.push({
            path: (typeof route.query.redirect == 'string' ? route.query.redirect : (route.query.redirect ?? [])[0]) ?? '/home',
            query: { clearQuery: 1 }
        });
    } else {
        loginError.value = await res.text();
    }
};
const toRecovery = async () => {
    if (!validateCredentials(false)) return;
    loginError.value = '';
    emailInput.value = '';
    page.value = 2;
};
const attemptRecovery = async () => {
    if (!validateCredentials(false)) return;
    if (attemptedRecovery.value) return;
    attemptedRecovery.value = true;
    loginError.value = '';
    showRecoveryWait.value = true;
    const res = await accountManager.requestRecovery(usernameInput.value, emailInput.value);
    showRecoveryWait.value = false;
    if (res.ok) {
        loginError.value = '';
        modal.showModal({
            title: 'Recovery email sent',
            content: 'The recovery email was sent and should arrive in your inbox within 10 minutes.',
            color: 'var(--color-1)'
        });
    } else {
        const message = await res.text();
        loginError.value = message;
        modal.showModal({
            title: 'Could not send recovery email:',
            content: message,
            color: 'var(--color-2)'
        });
    }
};
</script>

<script lang="ts">
</script>

<template>
    <PanelView name="login" title="WWPPC">
        <PanelHeader>
            <PanelNavLargeLogo target="/home?clearQuery"></PanelNavLargeLogo>
        </PanelHeader>
        <PanelMain>
            <PanelBody name="default" title="Login" is-default>
                <div class="loginNoScroll">
                    <Transition name="main">
                        <div class="fullBlock loginScroll" v-show="page == 0">
                            <div class="centered">
                                <div class="loginVertical">
                                    <img src="/logo.svg" class="loginLogoFloater">
                                    <h1 class="loginVerticalHeader">Log In</h1>
                                    <form class="loginVertical" action="javascript:void(0)">
                                        <InputTextBox v-model="usernameInput" placeholder="Username" style="margin-bottom: 8px;" width="208px" title="Username (alphanumeric and/or dash/underscore)" maxlength="16" autocomplete="username" autocapitalize="off" pattern="[a-z0-9\-_]*" highlight-invalid required></InputTextBox>
                                        <InputTextBox v-model="passwordInput" placeholder="Password" type="password" style="margin-bottom: 8px;" width="208px" title="Password" autocomplete="current-password" required></InputTextBox>
                                        <span>
                                            <InputButton text="Log In" type="submit" @click="attemptLogin" width="100px" title="Log in" glitchOnMount :disabled="showLoginWait || usernameInput.length == 0 || passwordInput.length == 0"></InputButton>
                                            <InputButton text="Sign Up" type="submit" @click="toSignUp" width="100px" title="Continue to create a new account" glitchOnMount :disabled="showLoginWait || usernameInput.length == 0 || passwordInput.length == 0"></InputButton>
                                        </span>
                                        <span v-if="loginError != ''" class="loginError">{{ loginError }}</span>
                                        <span class="loginForgotPassword" @click="toRecovery">Forgot password?</span>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </Transition>
                    <Transition name="second">
                        <div class="fullBlock loginScroll" v-show="page == 1">
                            <div class="centered">
                                <div class="loginVertical">
                                    <InputButton @click="page = 0" text="Cancel" style="margin-top: 8px;" width="160px" color="var(--color-2)" title="Go back to login page"></InputButton>
                                    <h1 class="loginVerticalHeader2">Sign Up</h1>
                                    <form class="loginVertical" action="javascript:void(0)" @submit=attemptSignup>
                                        <span style="margin-bottom: 8px;" class="nowrap">
                                            <InputTextBox :value="usernameInput" width="var(--hwidth)" title="Username" disabled autocomplete="off"></InputTextBox>
                                            <InputTextBox :value="passwordInput.replace(/./g, '•')" width="var(--hwidth)" title="Password" disabled autocomplete="off"></InputTextBox>
                                        </span>
                                        <span style="margin-bottom: 8px;" class="nowrap">
                                            <InputTextBox v-model="firstNameInput" width="var(--hwidth)" title="First name" placeholder="First name" maxlength="32" autocomplete="given-name" required></InputTextBox>
                                            <InputTextBox v-model="lastNameInput" width="var(--hwidth)" title="Last Name" placeholder="Last name" maxlength="32" autocomplete="family-name" required></InputTextBox>
                                        </span>
                                        <InputTextBox v-model="organizationInput" style="margin-bottom: 8px;" width="var(--fwidth)" title="Your school or organization name" placeholder="School / Organization" maxlength="64"></InputTextBox>
                                        <InputTextBox v-model="emailInput" type="email" style="margin-bottom: 8px;" width="var(--fwidth)" title="Your email" placeholder="Email" maxlength="32" required highlight-invalid></InputTextBox>
                                        <InputTextBox v-model="email2Input" type="email" style="margin-bottom: 8px;" width="var(--fwidth)" title="Your parent/guardian email (optional)" placeholder="Parent/guardian email (optional)" maxlength="32" highlight-invalid></InputTextBox>
                                        <PairedGridContainer width="var(--fwidth)" style="margin-bottom: 6px;">
                                            <span>
                                                Grade Level:
                                            </span>
                                            <InputDropdown v-model="gradeInput" width="calc(100% - 4px)" :items="gradeMaps" title="Your current grade level" required></InputDropdown>
                                            <span>
                                                Experience Level:
                                            </span>
                                            <InputDropdown v-model="experienceInput" width="calc(100% - 4px)" :items="experienceMaps" title="Your experience level with competitive programming" required></InputDropdown>
                                            <span>
                                                Familiar languages:<br>(use CTRL/SHIFT)
                                            </span>
                                            <InputDropdown v-model="languageInput" width="calc(100% - 4px)" :items="languageMaps" title="Programming languages you're familiear with" height="80px" multiple></InputDropdown>
                                        </PairedGridContainer>
                                        <InputButton text="Sign Up" type="submit" width="var(--fwidth)" glitchOnMount :disabled="showLoginWait"></InputButton>
                                        <span v-if="loginError != ''" class="loginError">{{ loginError }}</span>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </Transition>
                    <Transition name="second">
                        <div class="fullBlock loginScroll" v-show="page == 2">
                            <div class="centered">
                                <div class="loginVertical">
                                    <InputButton @click="page = 0" text="Cancel" style="margin-top: 8px;" width="160px" color="var(--color-2)" title="Go back to login page"></InputButton>
                                    <h1 class="loginVerticalHeader2">Account Recovery</h1>
                                    <p style="text-align: center; font-size: var(--font-small);">
                                        Enter your email to reset your password.
                                        <br>
                                        We will send an account recovery email shortly.
                                    </p>
                                    <form class="loginVertical" action="javascript:void(0)" @submit=attemptRecovery>
                                        <InputTextBox :value="usernameInput" style="margin-top: 8px;" width="var(--fwidth)" title="Username" disabled autocomplete="off"></InputTextBox>
                                        <InputTextBox v-model="emailInput" type="email" name="email" style="margin: 8px 0px;" width="var(--fwidth)" title="Email" placeholder="Email" maxlength="32" required highlight-invalid></InputTextBox>
                                        <InputButton text="Reset Password" type="submit" width="var(--fwidth)" glitchOnMount :disabled="attemptedRecovery || showLoginWait"></InputButton>
                                        <span v-if="attemptedRecovery"><i>Reload to try again</i></span>
                                        <span v-if="loginError != ''" class="loginError">{{ loginError }}</span>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
                <WaitCover text="Signing in..." :show="showLoginWait"></WaitCover>
                <WaitCover text="Sending email..." :show="showRecoveryWait"></WaitCover>
            </PanelBody>
        </PanelMain>
    </PanelView>
</template>

<style scoped>
.loginNoScroll {
    display: grid;
    width: 100%;
    height: 100%;
    margin: -16px 0px;
    padding: 16px 0px;
    overflow: hidden;
}

.loginScroll {
    grid-row: 1;
    grid-column: 1;
    height: 100%;
    overflow-y: auto;
}

* {
    --fwidth: min(calc(100% - 8px), 424px);
    --hwidth: min(calc(50% - 8px), 208px);
}

.nowrap {
    width: 100%;
    text-wrap: nowrap;
    word-wrap: nowrap;
}

.loginLogoFloater {
    display: block;
    height: 30vh;
    animation: loginLogoBob 10000ms cubic-bezier(0.7, 0, 0.3, 1) infinite;
}

.loginVerticalHeader {
    margin-top: -16px;
    font-size: 7vh;
}

.loginVerticalHeader2 {
    font-size: 7vh;
}

.loginVertical {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.loginForgotPassword {
    color: var(--color-1);
    text-decoration: underline;
    cursor: pointer;
    margin-top: 8px;
}

.loginError {
    color: var(--color-2);
    text-align: center;
}

@keyframes loginLogoBob {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-2vh);
    }
}

.main-enter-active,
.main-leave-active,
.second-enter-active,
.second-leave-active {
    transition: 500ms ease transform;
}

.main-enter-from,
.main-leave-to {
    transform: translateY(calc(-100% - 32px));
}

.main-enter-to,
.main-leave-from {
    transform: translateY(0%);
}

.second-enter-to,
.second-leave-from {
    transform: translateY(0%);
}

.second-enter-from,
.second-leave-to {
    transform: translateY(calc(100% + 32px));
}
</style>
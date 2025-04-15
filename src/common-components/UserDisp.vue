<script setup lang="ts">
import { InputButton } from '#/inputs';
import { glitchTextTransition } from '#/text';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useServerState } from '#/modules/ServerState';
import { useAccountManager } from '#/modules/AccountManager';

const serverState = useServerState();
const accountManager = useAccountManager();
const route = useRoute();
const ignoreServer = ref(route.query.ignore_server !== undefined);
watch(() => route.query, () => {
    ignoreServer.value = route.query.ignore_server !== undefined;
});

const name = ref('Not signed in');
const buttonText = ref('Log in');

const updateDisp = () => {
    if (serverState.loggedIn) {
        name.value = accountManager.user.displayName;
        glitchTextTransition(buttonText.value, 'Account', (text) => { buttonText.value = text; }, 40, 1, 10, 1).promise;
    } else {
        name.value = 'Not signed in';
        glitchTextTransition(buttonText.value, 'Log in', (text) => { buttonText.value = text; }, 40, 1, 10, 1).promise;
    }
}

watch(() => accountManager.user.displayName, updateDisp);
watch(() => serverState.loggedIn, updateDisp);
onMounted(updateDisp);
</script>

<template v-slot:userDisp>
    <div class="userDispContainer">
        <div class="userDispUser">
            <img :src=accountManager.user.profileImage class="userDispProfileImg" v-if="serverState.loggedIn || ignoreServer">
            <div class="userDispUserName">{{ name }}</div>
        </div>
        <RouterLink :to="serverState.loggedIn ? '/account' : `/login?redirect=${route.fullPath}&clearQuery=1`" class="userDispButtonWrapper">
            <InputButton :text=buttonText width="100%" font="20px"></InputButton>
        </RouterLink>
    </div>
</template>

<style scoped>
.userDispContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-width: 160px;
    max-width: 240px;
    margin: 0px 8px;
    transition: 500ms ease max-width, 500ms ease min-width;
}

.userDispUser {
    display: flex;
    margin-bottom: 8px;
    align-items: center;
}

.userDispProfileImg {
    width: 28px;
    height: 28px;
    min-width: 28px;
    border: 2px solid white;
    border-radius: 50%;
}

.userDispUserName {
    max-width: 200px;
    margin-left: 4px;
    transition: 500ms ease max-width, 500ms ease opacity;
    text-wrap: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.userDispButtonWrapper {
    width: calc(100% - 16px);
}

@media (max-width: 700px) {
    .userDispContainer {
        min-width: 110px;
    }

    .userDispUserName {
        opacity: 0;
        max-width: 0px;
    }
}
</style>
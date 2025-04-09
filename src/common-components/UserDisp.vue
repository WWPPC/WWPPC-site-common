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

serverState.onconnect(() => {
    serverState.handshakePromise.then(() => {
        if (serverState.loggedIn) {
            glitchTextTransition(buttonText.value, 'Account', (text) => { buttonText.value = text; }, 40, 1, 10, 2).promise;
            name.value = accountManager.displayName;
        }
    });
});
onMounted(() => {
    serverState.handshakePromise.then(() => {
        if (serverState.loggedIn) {
            glitchTextTransition(buttonText.value, 'Account', (text) => { buttonText.value = text; }, 40, 1, 10, 2).promise;
            name.value = accountManager.displayName;
        }
    });
});
watch(() => accountManager.displayName, () => {
    if (serverState.loggedIn) name.value = accountManager.displayName;
});
serverState.ondisconnect(() => {
    name.value = 'Not signed in';
    glitchTextTransition(buttonText.value, 'Log in', (text) => { buttonText.value = text; }, 40, 1, 10, 2).promise;
});
</script>

<template v-slot:userDisp>
    <div class="userDispContainer">
        <div class="userDispUser">
            <img :src=accountManager.profileImage class="userDispProfileImg" v-if="serverState.loggedIn || ignoreServer">
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
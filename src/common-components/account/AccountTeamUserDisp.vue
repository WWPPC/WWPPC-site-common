<script setup lang="ts">
import { AnimateInContainer } from '#/containers';
import { InputButton } from '#/inputs';
import LoadingSpinner from '#/common/LoadingSpinner.vue';
import { globalModal, ModalMode } from '#/modal';
import { onMounted, ref, watch } from 'vue';
import { type AccountData, useAccountManager } from '#/modules/AccountManager';

const props = defineProps<{
    user: string
    team: number
    allowKick?: boolean
}>();

const modal = globalModal();
const accountManager = useAccountManager();

const data = ref<AccountData | null>(null);

watch(() => props.user, async () => {
    const res = await accountManager.fetchAccountData(props.user);
    if (!(res instanceof Response)) data.value = res;
}, { immediate: true });

const kick = async () => {
    const confirmation = await modal.showModal({ title: 'Kick from team?', content: `You are about to kick ${data.value?.displayName} (@${props.user}) from the team. Are you sure?`, mode: ModalMode.INPUT, color: 'yellow' }).result;
    if (!confirmation) return;
    const res = await accountManager.kickTeam(props.user);
    if (!res.ok) modal.showModal({
        title: 'Could not kick from team',
        content: await res.text(),
        color: 'var(--color-2)'
    });
};
</script>

<template>
    <AnimateInContainer type="slideUp" single>
        <div class="cardContentContainer">
            <RouterLink :to="'/user/@' + $props.user" class="cardContentWrapper">
                <div class="cardContent">
                    <img :src="data?.profileImage" class="cardProfileImg">
                    <span class="cardName">{{ data?.displayName }}</span>
                    <Transition>
                        <div class="cardLoadingWrapper" v-if="data == null">
                            <div class="cardLoading">
                                <LoadingSpinner></LoadingSpinner>
                            </div>
                        </div>
                    </Transition>
                </div>
            </RouterLink>
            <InputButton class="kickButton" text="Kick" color="var(--color-2)" @click="kick()" v-if="$props.allowKick && $props.user !== accountManager.user.username"></InputButton>
        </div>
    </AnimateInContainer>
</template>

<style scoped>
.cardContentContainer {
    background-color: black;
    transition: 200ms ease transform;
    will-change: transform;
}

.cardContentWrapper {
    display: block;
    color: white;
    text-decoration: none;
}

.cardContent {
    contain: layout;
    display: grid;
    grid-template-rows: 80px 40px;
    padding: 8px 4px;
    border: 4px solid white;
    justify-items: center;
    overflow: hidden;
    cursor: pointer;
}

.cardContentContainer:hover {
    transform: scale(102%);
}

.cardProfileImg {
    width: 72px;
    height: 72px;
    border: 4px solid white;
    border-radius: 50%;
}

.cardName {
    text-align: center;
    word-wrap: break-word;
    text-wrap: balance;
    line-break: anywhere;
    word-break: break-all;
    text-overflow: ellipsis;
    align-content: center;
}

.cardLoadingWrapper {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: black;
}

.cardLoading {
    width: 60px;
    height: 60px;
}

.kickButton {
    position: absolute;
    top: 0px;
    right: 0px;
    margin: 0px 0px;
    opacity: 0;
    transition: 50ms linear opacity;
}

.cardContentContainer:hover>.kickButton {
    opacity: 1;
}

.v-enter-active,
.v-leave-active {
    transition: 500ms;
}

.v-leave-from {
    opacity: 1;
}

.v-leave-to {
    opacity: 0;
}
</style>
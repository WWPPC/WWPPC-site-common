<script setup lang="ts">
import { PanelBody, PanelHeader, PanelMain, PanelNavButton, PanelNavList, PanelView, PanelNavLargeLogo, PanelRightList } from '#/panels';
import PagePanelAccountWrapper from './account/PagePanelAccountWrapper.vue';
import PagePanelAccountProfile from './account/PagePanelAccountProfile.vue';
import PagePanelAccountRegistrations from './account/PagePanelAccountRegistrations.vue';
import { useRoute } from 'vue-router';
import { useServerState } from '#/modules/ServerState';
import { useLoginEnforcer } from '#/modules/LoginEnforcer';

const route = useRoute();

const serverState = useServerState();
const loginEnforcer = useLoginEnforcer();

loginEnforcer.include.add('/account');
</script>

<template>
    <PanelView name="account" title="WWPPC">
        <PanelHeader>
            <PanelNavLargeLogo></PanelNavLargeLogo>
            <PanelNavList>
                <PanelNavButton text="Home" for="/home"></PanelNavButton>
                <PanelNavButton text="Profile" for="/account/profile" is-default></PanelNavButton>
                <PanelNavButton text="Register" for="/account/registrations"></PanelNavButton>
            </PanelNavList>
            <PanelRightList>
                <div v-if="!serverState.loggedIn && route.query.ignore_server !== undefined" style="color: yellow">
                    You are not signed in!
                </div>
            </PanelRightList>
        </PanelHeader>
        <PanelMain>
            <PanelBody name="profile" title="Account" is-default>
                <PagePanelAccountWrapper allow-profile-img-change>
                    <PagePanelAccountProfile></PagePanelAccountProfile>
                </PagePanelAccountWrapper>
            </PanelBody>
            <PanelBody name="registrations" title="Registrations">
                <PagePanelAccountWrapper>
                    <PagePanelAccountRegistrations></PagePanelAccountRegistrations>
                </PagePanelAccountWrapper>
            </PanelBody>
        </PanelMain>
    </PanelView>
</template>

<style scoped></style>
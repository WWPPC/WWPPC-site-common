<script setup lang="ts">
import { PanelView, PanelHeader, PanelNavLargeLogo, PanelMain, PanelBody, PanelRightList, PanelNavList } from '#/panels';
import UserDisp from '#/common-components/UserDisp.vue';
import PagePanelUserView from './userview/PagePanelUserView.vue';
</script>

<template>
    <PanelView name="user" title="WWPPC">
        <PanelHeader>
            <PanelNavLargeLogo></PanelNavLargeLogo>
            <PanelNavList></PanelNavList>
            <PanelRightList>
                <UserDisp></UserDisp>
            </PanelRightList>
        </PanelHeader>
        <PanelMain>
            <PanelBody name="default" is-default>
                <PagePanelUserView></PagePanelUserView>
            </PanelBody>
        </PanelMain>
    </PanelView>
</template>

<style scoped></style>
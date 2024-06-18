import { defineStore } from 'pinia';
import { reactive } from 'vue';

import MultipanePane from '@/multipane/MultipanePane.vue';
import MultipanePaneContainer from '@/multipane/MultipanePaneContainer.vue';
import MultipaneSelector from '@/multipane/MultipaneSelector.vue';
import MultipaneSelectorContainer from '@/multipane/MultipaneSelectorContainer.vue';

export class Multipane {
    selected: string = '';
    hovering: string = '';
}
const state = reactive<{ [key: string]: Multipane | undefined }>({});
export const useMultipane = defineStore('multipane', {
    state: () => state,
});

export {
    MultipaneSelectorContainer,
    MultipaneSelector,
    MultipanePaneContainer,
    MultipanePane
}
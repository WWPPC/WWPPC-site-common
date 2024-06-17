import { defineStore } from 'pinia';
import { reactive } from 'vue';

import MultipanePane from './MultipanePane.vue';
import MultipanePaneContainer from './MultipanePaneContainer.vue';
import MultipaneSelector from './MultipaneSelector.vue';
import MultipaneSelectorContainer from './MultipaneSelectorContainer.vue';

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
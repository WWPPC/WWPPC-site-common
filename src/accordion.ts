import { reactive, type Reactive } from 'vue';
import AccordionCollapsibleContainer from './containers/AccordionCollapsibleContainer.vue';

export class Accordion {
    c: number = 0;
    readonly selected: Reactive<Set<number>> = reactive(new Set());
    readonly exclusive: boolean;
    constructor(exclusive?: boolean) {
        this.exclusive = exclusive ?? false;
    }
}

export {
    AccordionCollapsibleContainer
}
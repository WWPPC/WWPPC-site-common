import { useRoute } from 'vue-router';
import { setTitlePanel } from '@/scripts/title';
import { watch, nextTick, getCurrentInstance } from 'vue';
import { isMobileRef } from '@/scripts/userAgent';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const route = useRoute();
let __VLS_typeProps;
const props = defineProps();
const instance = getCurrentInstance();
watch(() => route.params, async () => {
    await nextTick();
    if (instance?.isMounted && (route.params.panel == props.name || (route.params.panel == undefined && props.isDefault && route.params.catchAll === undefined)))
        setTitlePanel(props.title ?? '');
});
if ((route.params.panel === undefined && props.isDefault && route.params.catchAll === undefined) || route.params.panel == props.name)
    setTitlePanel(props.title ?? '');
const __VLS_fnComponent = (await import('vue')).defineComponent({});
let __VLS_functionalComponentProps;
const __VLS_modelEmitsType = {};
function __VLS_template() {
    let __VLS_ctx;
    /* Components */
    let __VLS_otherComponents;
    let __VLS_own;
    let __VLS_localComponents;
    let __VLS_components;
    let __VLS_styleScopedClasses;
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    // @ts-ignore
    const __VLS_0 = {}
        .Transition;
    ({}.Transition);
    ({}.Transition);
    __VLS_components.Transition;
    __VLS_components.Transition;
    // @ts-ignore
    [Transition, Transition,];
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    ({}({}));
    if (__VLS_ctx.route.params.panel == props.name || (__VLS_ctx.route.params.panel == undefined && props.isDefault && __VLS_ctx.route.params.catchAll === undefined)) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("panelBody") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: (('panelBodySlotContainer ' + ((__VLS_ctx.isMobileRef || !props.scrollSnap) ? 'noSnap' : ''))) }, });
        __VLS_styleScopedClasses = ('panelBodySlotContainer ' + ((isMobileRef || !props.scrollSnap) ? 'noSnap' : ''));
        var __VLS_6 = {};
        // @ts-ignore
        [route, route, route, isMobileRef,];
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("panelBodyTransitionWipeContainer") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("panelBodyTransitionWipe") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({ ...{ class: ("panelBodyTransitionWipeImg") }, src: ("/icon.svg"), });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("panelBodyCopyrightNotice") }, });
    }
    (__VLS_5.slots).default;
    const __VLS_5 = __VLS_pickFunctionalComponentCtx(__VLS_0, __VLS_2);
    if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
        __VLS_styleScopedClasses['panelBody'];
        __VLS_styleScopedClasses['panelBodyTransitionWipeContainer'];
        __VLS_styleScopedClasses['panelBodyTransitionWipe'];
        __VLS_styleScopedClasses['panelBodyTransitionWipeImg'];
        __VLS_styleScopedClasses['panelBodyCopyrightNotice'];
    }
    var __VLS_slots;
    return __VLS_slots;
    const __VLS_componentsOption = {};
    let __VLS_name;
    let __VLS_defineComponent;
    const __VLS_internalComponent = __VLS_defineComponent({
        setup() {
            return {
                isMobileRef: isMobileRef,
                route: route,
            };
        },
        props: {},
    });
}
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {},
});
export default {};
;

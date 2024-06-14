export default (await import('vue')).defineComponent({
    mounted() {
        const navBar = this.$el?.querySelector('.panelNav');
        if (navBar == undefined)
            return;
        navBar.addEventListener('wheel', (e) => {
            if (e.deltaX == 0) {
                navBar.scrollBy({ left: e.deltaY / 10, behavior: 'auto' });
            }
        }, { passive: true });
    },
});
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("panelNavOuter") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({ ...{ class: ("panelNav") }, });
    var __VLS_0 = {};
    if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
        __VLS_styleScopedClasses['panelNavOuter'];
        __VLS_styleScopedClasses['panelNav'];
    }
    var __VLS_slots;
    return __VLS_slots;
    const __VLS_componentsOption = {};
    const __VLS_name = undefined;
    let __VLS_internalComponent;
}

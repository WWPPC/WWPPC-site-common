import { watch } from "vue";
import { ref, type Ref } from "vue";

/**
 * Add a debounce delay to a function call, returning a new function
 * with debounced calls to the input function.
 * @param fn Function to debounce.
 * @param ms Inactive time before calling the input function
 */
export function debounce<F extends (...args: any[]) => void>(fn: F, ms: number): (...args: Parameters<F>) => void {
    let timeout: NodeJS.Timeout = setTimeout(() => {});
    return function debounced (...args: Parameters<F>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), ms);
    };
}

/**
 * Add a throttling limiter to a function call, returning a new function
 * with throttled calls to the input function.
 * @param fn Function to throttle
 * @param ms Minimum time between successes calls to the input function
 * @returns 
 */
export function throttle<F extends (...args: any[]) => void>(fn: F, ms: number): (...args: Parameters<F>) => void {
    let timeout: NodeJS.Timeout = setTimeout(() => {});
    let lastUpdate = 0;
    return function throttled (...args: Parameters<F>) {
        clearTimeout(timeout);
        if (performance.now() - lastUpdate >= ms) {
            fn(...args);
            lastUpdate = performance.now();
        } else {
            timeout = setTimeout(() => {
                fn(...args);
                lastUpdate = performance.now();
            }, ms - performance.now() + lastUpdate);
        }
    };
}

/**
 * Add a debounce delay from an input ref, returning a ref with debounced update behavior.
 * @param input Ref to use as un-debounced input
 * @param ms Inactive time before updating output
 */
export function debounceRef<T>(input: Ref<T>, ms: number): Ref<T> {
    const output: Ref<T> = ref(input.value) as Ref<T>;
    let timeout: NodeJS.Timeout = setTimeout(() => {});
    watch(input, () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => output.value = input.value, ms);
    });
    return output;
}

/**
 * Add a throttling limiter from an input ref, returning a ref with throttled update behavior.
 * @param input Ref to use as un-throttled input
 * @param ms Minimum time between successive updates of output
 */
export function throttleRef<T>(input: Ref<T>, ms: number): Ref<T> {
    const output: Ref<T> = ref(input.value) as Ref<T>;
    let timeout: NodeJS.Timeout = setTimeout(() => {});
    let lastUpdate = 0;
    watch(input, () => {
        clearTimeout(timeout);
        if (performance.now() - lastUpdate >= ms) {
            output.value = input.value;
            lastUpdate = performance.now();
        } else {
            timeout = setTimeout(() => {
                output.value = input.value;
                lastUpdate = performance.now();
            }, ms - performance.now() + lastUpdate);
        }
    });
    return output;
}
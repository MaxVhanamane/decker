export function isTouchOnlyDevice() {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isCoarsePointer = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    return hasTouch && isCoarsePointer;
}


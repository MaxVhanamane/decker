import { useEffect, RefObject, useRef } from 'react';

// I need the enabled flag in the LinkTooltip component because I have two refs in the same component that are conditionally rendered. To initialize the ref correctly when the component re-renders, I need this flag so that event listeners are correctly added or removed when one ref becomes null and the other receives a value due to conditional rendering.
function useClickOutside(
    ref: RefObject<HTMLElement>,
    enabled: boolean,
    callback: () => void,
    options?: {
        excludeRefs?: RefObject<HTMLElement>[];
        eventType?: 'mousedown' | 'click';
    }
): void {
    const callbackRef = useRef(callback);
    const {
        excludeRefs = [],
        eventType = 'mousedown'
    } = options || {};

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;

            // Check if click is inside the main ref
            if (ref.current && ref.current.contains(target)) {
                return;
            }

            // First check excluded refs (more efficient)
            for (const excludeRef of excludeRefs) {
                if (excludeRef.current && excludeRef.current.contains(target)) {
                    return;
                }
            }


            // If we get here, it's a valid outside click
            callbackRef.current();
        }

        document.addEventListener(eventType, handleClickOutside);
        return () => {
            document.removeEventListener(eventType, handleClickOutside);
        };

        // As we know, excludeRefs is an array of refs. Instead of passing the entire array directly,
        // it's better to spread the refs in the dependency array. This is because the component using this hook
        // might re-render and generate a new array instance each time, causing useEffect to run unnecessarily.
        // However, each individual ref in the array has a stable reference and doesn't change on re-renders.
        // So spreading the refs ensures that useEffect only re-runs when an actual ref changes.

    }, [ref, enabled, ...excludeRefs, eventType]);
}

export { useClickOutside };

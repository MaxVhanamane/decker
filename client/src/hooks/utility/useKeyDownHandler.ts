import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useCallback } from "react";

type KeyDownListeners = SyntheticListenerMap | undefined
// Prevents drag-start when pressing Enter on buttons inside a draggable element
export function useKeyDownHandler(listeners?: KeyDownListeners) {
    return useCallback(
        (e: React.KeyboardEvent) => {
            if (
                e.target instanceof HTMLElement &&
                (e.target.tagName === "BUTTON" || e.target.tagName === "A")
            ) {
                e.stopPropagation();
                return;
            }
            listeners?.onKeyDown?.(e);
        },
        [listeners]
    );
}

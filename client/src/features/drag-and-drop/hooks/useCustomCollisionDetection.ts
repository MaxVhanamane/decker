import { useCallback } from "react";
import { Active, ClientRect, rectIntersection } from "@dnd-kit/core";
import { DroppableContainer, RectMap } from "@dnd-kit/core/dist/store";
import { Coordinates } from "@dnd-kit/utilities";

export function useCustomCollisionDetection() {
    return useCallback((args: {
        active: Active;
        collisionRect: ClientRect;
        droppableRects: RectMap;
        droppableContainers: DroppableContainer[];
        pointerCoordinates: Coordinates | null;
    }) => {
        const collisions = rectIntersection(args);

        return collisions.sort((a, b) => {
            if (a.id === "CardDeleteArea") return -1;
            if (a.id === "DeckDeleteArea") return -1;
            if (b.id === "priority-drop") return 1;
            return 0;
        });
    }, []);
}

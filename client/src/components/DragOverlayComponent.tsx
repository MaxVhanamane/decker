import { DragOverlay } from "@dnd-kit/core";
import { lazy, memo, Suspense, useContext, useEffect } from "react";
import {
  DndCurrentDraggingCardContext,
  DndCurrentDraggingDeckContext,
} from "../context/DndItemContext";
const CardItemPresentational = lazy(
  () => import("./card/CardItemPresentational")
);
import DeckItemPresentational from "./deck/DeckItemPresentational";
import DraggingCardFallback from "./suspense-loaders/DraggingCardFallback";

const DragOverlayComponent = () => {
  const { currentDraggingCard } = useContext(DndCurrentDraggingCardContext);
  const { currentDraggingDeck } = useContext(DndCurrentDraggingDeckContext);

  // CardItemPresentational uses Slate.js. To keep the initial bundle smaller, we lazy‑load it and show a fallback while it’s loading. We also import it in a useEffect to pre‑load it, so the fallback only appears for a split second. Without this pre‑load, Suspense would wait for the module to download from the server before rendering the actual component. By using useEffect, the lazy‑loaded module is cached, and Suspense can render it immediately on subsequent loads.
  useEffect(() => {
    import("./card/CardItemPresentational");
  }, []);

  return (
    <DragOverlay zIndex={1001}>
      {currentDraggingDeck && (
        <DeckItemPresentational
          isDragging={currentDraggingDeck.isDragging}
          deck={currentDraggingDeck.deck}
          isDraggingOverDeleteArea={
            currentDraggingDeck.isDraggingOverDeleteArea
          }
        />
      )}
      {currentDraggingCard && (
        <div>
          <Suspense
            fallback={
              <DraggingCardFallback
                isDragging={currentDraggingCard?.isDragging}
                isDraggingCardOverDeleteArea={
                  currentDraggingCard?.isDraggingCardOverDeleteArea
                }
              />
            }
          >
            <CardItemPresentational {...currentDraggingCard} />
          </Suspense>
        </div>
      )}
    </DragOverlay>
  );
};

export default memo(DragOverlayComponent);

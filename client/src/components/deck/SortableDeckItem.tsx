import { memo, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { twMerge } from "tailwind-merge";
import DeckItem from "./DeckItem";
import { DeckItemType } from "../../types/types";
import { useKeyDownHandler } from "../../hooks/utility/useKeyDownHandler";

type PropTypes = {
  handleEditDeck: (deckId: string, title: string) => void;
  handlePin: (deckId: string, pinned: boolean) => Promise<void>;
  deck: DeckItemType;
  index: number;
};

const SortableDeckItem = memo(
  ({ handleEditDeck, handlePin, deck, index }: PropTypes) => {
    const {
      setNodeRef,
      listeners,
      attributes,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: deck.deckId,
      data: {
        index,
        name: "deck",
        isPinned: deck.pinned,
        deck,
      },
      transition: {
        duration: 500, // milliseconds
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    });

    // console.log(deck.order, deck.title);

    const style = useMemo(() => {
      return {
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0 : 1,
        touchAction: "pan-y",
      };
    }, [transition, transform, isDragging, deck]);

    const handleKeyDown = useKeyDownHandler(listeners);

    return (
      <>
        <div
          {...attributes}
          {...listeners}
          style={style}
          ref={setNodeRef}
          onKeyDown={handleKeyDown}
          className={twMerge(
            "outline-none focus-visible:ring-2 dark:focus-visible:ring-blue-500 focus-visible:ring-gray-500 rounded-md",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
        >
          {/* DnD Kit re-renders a lot, so I created DeckItem. Now, only the parent div re-renders, while DeckItem updates only on prop changes. */}
          <DeckItem
            handleEditDeck={handleEditDeck}
            deck={deck}
            handlePin={handlePin}
            key={deck.deckId}
            isDragging={isDragging}
          />
        </div>
      </>
    );
  }
);
SortableDeckItem.displayName = "Sortable Item";
export default SortableDeckItem;

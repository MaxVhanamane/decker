import { memo, useMemo } from "react";
import type { CardContentType, ContentTypeForEdit } from "../../types/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardItem from "./CardItem";
import { twMerge } from "tailwind-merge";
import { Descendant } from "slate";
import { useStableParams } from "../../context/stableParamsContext";

type ContentForFullScreen = CardContentType & {
  cardIndex: number | null;
};
type CardDeletionParams = {
  deckId: string;
  cardInfo: CardContentType;
  deletionIndex: number;
};
type PropTypes = {
  handleDeleteCard: (payload: CardDeletionParams) => void;
  handleEditCardButtonClick: (cardItem: ContentTypeForEdit) => void;
  handleShowFullScreen: (card: ContentForFullScreen) => void;
  card: {
    note: Descendant[];
    cardId: string;
    _id: string;
    createdAt: string;
  };
  index: number;
};
const SortableCardItem = ({
  handleEditCardButtonClick,
  handleShowFullScreen,
  card,
  handleDeleteCard,
  index,
}: PropTypes) => {
  const { deckId } = useStableParams();

  const {
    isDragging,
    listeners,
    attributes,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id: card.cardId,

    data: {
      name: "card",
      card: {
        note: card?.note,
        createdAt: card?.createdAt,
        cardId: card?.cardId,
        _id: card?._id,
      },
      index,
      deckId,
    },
    transition: {
      duration: 500,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = useMemo(() => {
    return {
      transition,
      transform: CSS.Transform.toString(transform),
      opacity: isDragging ? 0 : 1,
      touchAction: "pan-y",
    };
  }, [transition, transform, isDragging]);
  return (
    <div
      {...listeners}
      {...attributes}
      ref={setNodeRef}
      style={style}
      onClick={() => {
        handleShowFullScreen({
          ...card,
          cardIndex: index,
        });
      }}
      onKeyDown={(e) => {
        if (e.target instanceof HTMLElement && e.target.tagName === "BUTTON") {
          e.stopPropagation(); // Prevent drag when using Tab + Enter/Space
          return;
        }
        listeners?.onKeyDown?.(e);
      }}
      className={twMerge(
        "outline-none focus-visible:ring-2 dark:focus-visible:ring-blue-500 focus-visible:ring-gray-500 rounded-md h-full",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
    >
      <CardItem
        card={card}
        index={index}
        handleDeleteCard={handleDeleteCard}
        handleEditCardButtonClick={handleEditCardButtonClick}
        isDragging={isDragging}
      />
    </div>
  );
};

export default memo(SortableCardItem);

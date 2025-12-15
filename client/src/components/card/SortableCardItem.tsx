import { memo, useCallback, useContext, useMemo, useState } from "react";
import type { CardContentType, ContentTypeForEdit } from "../../types/types";
import { useSortable } from "@dnd-kit/sortable";
import CardItem from "./CardItem";
import { twMerge } from "tailwind-merge";
import { useStableParams } from "../../context/stableParamsContext";
import { motion } from "motion/react";
import { OfflineContext } from "../../context/OfflineContext";

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
  card: CardContentType;
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
  const [forceRender, setForceRender] = useState(false);
  const { isOnline } = useContext(OfflineContext);

  const handleEditClick = useCallback(
    (cardItem: ContentTypeForEdit) => {
      // force render only when online To avoid blured card when offline
      setForceRender(true);
      if (!isOnline) {
        setTimeout(() => {
          setForceRender(false);
        }, 500);
      }
      handleEditCardButtonClick(cardItem);
    },
    [setForceRender, handleEditCardButtonClick]
  );

  const cardData = card?.chapterId
    ? {
        note: card?.note,
        createdAt: card?.createdAt,
        cardId: card?.cardId,
        order: card?.order,
        chapterId: card?.chapterId,
      }
    : {
        note: card?.note,
        createdAt: card?.createdAt,
        cardId: card?.cardId,
        order: card?.order,
      };

  const { isDragging, listeners, attributes, setNodeRef, transform } =
    useSortable({
      id: card.cardId,
      data: {
        name: "card",
        card: cardData,
        index,
        deckId,
      },
      transition: {
        duration: 500,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
    });

  // dnd-kit - Motion-controlled transform
  const motionTransform = transform
    ? { x: transform.x, y: transform.y }
    : { x: 0, y: 0 };

  const style = useMemo(() => {
    return {
      touchAction: "pan-y",
    };
  }, [isDragging]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.target instanceof HTMLElement && e.target.tagName === "BUTTON") {
        e.stopPropagation(); // Prevent drag when using Tab + Enter/Space
        return;
      }
      if (
        e.target instanceof HTMLElement &&
        e.target.id === "cardContent" &&
        (e.key === "Enter" || e.key === " ")
      ) {
        e.stopPropagation(); // Prevent drag when using Tab + Enter/Space
        handleShowFullScreen({
          ...card,
          cardIndex: index,
        });
        return;
      }
      listeners?.onKeyDown?.(e);
    },
    [handleShowFullScreen, card, index]
  );

  return (
    <motion.div
      key={`card-${card.cardId}-${isDragging}`}
      ref={setNodeRef}
      style={style}
      animate={{
        ...motionTransform,
        opacity: isDragging ? 0 : 1,
        filter: forceRender && !isDragging ? "blur(6px)" : "blur(0px)",
      }} // dnd-kit transform handled by Framer Motion
      transition={{
        filter: { duration: 0.2 },
        opacity: {
          duration: 0.01,
          delay: isDragging ? 0 : 0.25,
        },
        layout: {
          type: "tween",
          ease: "easeInOut",
          duration: 0.3,
        },
      }}
      onLayoutAnimationStart={() => {
        setForceRender(false);
      }}
      layoutId={`deck-card-${card.cardId}`}
      onPointerUp={() => {
        handleShowFullScreen({
          ...card,
          cardIndex: index,
        });
        setForceRender(true);
      }}
      onKeyDown={onKeyDown}
      className={twMerge(
        "outline-none focus-visible:ring-2  dark:focus-visible:ring-blue-500 focus-visible:ring-gray-500 rounded-md h-full cursor-pointer"
      )}
    >
      <CardItem
        attributes={attributes}
        listeners={listeners}
        card={card}
        index={index}
        handleDeleteCard={handleDeleteCard}
        handleEditCardButtonClick={handleEditClick}
        isDragging={isDragging}
      />
    </motion.div>
  );
};

export default memo(SortableCardItem);

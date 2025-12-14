import { memo, useContext } from "react";
import { ShowToastContext } from "../context/ToastNotificationContext";
import { useDroppable } from "@dnd-kit/core";
import { CardContext } from "../context/CardContext";
import Button from "./Button";
import { motion } from "motion/react";
type PropType = {
  droppableId: string;
  altText: string;
};

const TrashCanDropZone = memo(({ droppableId, altText }: PropType) => {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  const { shouldTrashCanRotate } = useContext(CardContext);

  const { showToast } = useContext(ShowToastContext);

  const handleClick = () => {
    if (droppableId === "DeckDeleteArea") {
      showToast({
        message: "Drag and drop the deck onto the trash icon to delete it.",
        severity: "info",
        position: "bottom-right",
        theme: "auto",
        animationStyle: "scale-up",
      });
    } else {
      showToast({
        message: "Drag and drop the card onto the trash icon to delete it.",
        severity: "info",
        autoHideDuration: 5000,
        position: "bottom-right",
        theme: "auto",
      });
    }
  };
  return (
    <div
      ref={setNodeRef}
      className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700    lg:right-4 bottom-2 right-2   z-50 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center  ${
        isOver || shouldTrashCanRotate
          ? "ring-1 ring-red-500 shadow-md shadow-red-500 z-[5001]"
          : "ring-1 ring-slate-400/60 "
      }`}
    >
      <motion.div
        whileTap={{
          scale: 0.85,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 10,
        }}
      >
        <Button
          variant="plain"
          withTooltip
          tooltipAutoHideDuration={2000}
          toolTipText={
            droppableId === "DeckDeleteArea" ? "Delete Deck" : "Delete Card"
          }
          aria-label={`Drag and drop the ${
            droppableId === "DeckDeleteArea" ? "deck" : "card"
          } onto the trash icon to delete it.`}
          size="md"
          onClick={handleClick}
          className={`  !transition-transform !duration-200 rounded-full p-1  ${
            isOver || shouldTrashCanRotate ? "-rotate-12 " : "transform-none"
          } `}
        >
          <img
            src={
              isOver || shouldTrashCanRotate
                ? "/trashcan-open.svg"
                : "/trashcan-close.svg"
            }
            alt={altText}
            className="w-[30px] h-[30px] lg:w-[35px] lg:h-[35px]"
          />
        </Button>
      </motion.div>
    </div>
  );
});

export default TrashCanDropZone;

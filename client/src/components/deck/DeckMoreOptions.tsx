import React, { memo, useLayoutEffect, useState } from "react";
import Button from "../Button";
import { BiEdit } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import { DeckType } from "../../types/types";
import useDeleteDeck from "../../hooks/react-query/useDeleteDeck";

type DeckMoreOptionsProps = {
  moreOptionsRef: React.MutableRefObject<HTMLDivElement | null>;
  deck: DeckType;
  triggerRef: React.RefObject<HTMLElement | null>;
  handleEditDeck: (deckId: string, title: string) => void;
  searchParams?: {
    query: string;
    page: number;
  };
};

const EDGE_PADDING = 4;

const DeckMoreOptions = ({
  moreOptionsRef,
  deck,
  handleEditDeck,
  searchParams,
  triggerRef,
}: DeckMoreOptionsProps) => {
  const { mutate: deleteDeck } = useDeleteDeck();
  const [arrowLeft, setArrowLeft] = useState<number | null>(null);

  const calculateArrowPosition = () => {
    const dropdown = moreOptionsRef.current;
    const trigger = triggerRef.current;
    if (!dropdown || !trigger) return null;

    const dropdownRect = dropdown.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();

    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const arrowXInsideDropdown = triggerCenterX - dropdownRect.left;

    // Clamp arrow position within dropdown bounds
    const maxLeft = dropdownRect.width - 16; // 16px arrow width
    const clampedArrowLeft = Math.max(
      8,
      Math.min(arrowXInsideDropdown - 8, maxLeft)
    );

    return clampedArrowLeft;
  };

  useLayoutEffect(() => {
    const el = moreOptionsRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    // Shift left if overflowing right
    if (rect.right > window.innerWidth - EDGE_PADDING) {
      const overflowRight = rect.right - (window.innerWidth - EDGE_PADDING);
      const currentRight = parseFloat(getComputedStyle(el).right) || 0;
      const newRight = currentRight + overflowRight;
      el.style.right = `${newRight}px`;
    }

    // Shift right if overflowing left
    if (rect.left < EDGE_PADDING) {
      const overflowLeft = EDGE_PADDING - rect.left;
      const currentRight = parseFloat(getComputedStyle(el).right) || 0;
      const newRight = currentRight - overflowLeft;
      el.style.right = `${newRight}px`;
    }

    const newArrowLeft = calculateArrowPosition();
    setArrowLeft(newArrowLeft);
  }, []);

  return (
    <div
      ref={moreOptionsRef}
      className="absolute z-[100] -right-[19.5px] top-9 flex items-start justify-center flex-col gap-2 dark:bg-slate-800 bg-gray-200 rounded-md py-2 px-3 w-32 border border-slate-400 select-none outline-none"
    >
      <div
        className="absolute z-20 -top-[0.8px] md:hidden h-[1px] dark:bg-slate-800 bg-gray-200 w-[13.1px]"
        style={{ left: arrowLeft != null ? arrowLeft + 2 : "auto" }}
      ></div>
      <svg
        className="absolute z-10 top-[-10px]"
        style={{ left: arrowLeft ?? "auto" }}
        width="16"
        height="10"
        viewBox="0 0 16 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 0L16 10H0L8 0Z"
          className="dark:fill-slate-800 fill-gray-200"
        />
        <line
          x1="8"
          y1="0"
          x2="0"
          y2="10"
          strokeWidth="1"
          className="stroke-slate-400"
        />
        <line
          x1="8"
          y1="0"
          x2="16"
          y2="10"
          strokeWidth="1"
          className="stroke-slate-400"
        />
      </svg>

      <Button
        variant="plain"
        size="md"
        aria-label="Edit Deck"
        type="button"
        onClick={() => handleEditDeck(deck.deckId, deck.title)}
        className="flex items-center !justify-start w-full hover:dark:bg-slate-700 hover:bg-gray-300 rounded-md py-1 px-2 transition-colors duration-200"
      >
        <p className="text-sm text-gray-600 dark:text-gray-50 flex gap-2 items-center">
          <BiEdit /> Edit
        </p>
      </Button>

      <Button
        variant="plain"
        size="md"
        aria-label="Delete Deck"
        type="button"
        onClick={() =>
          deleteDeck({
            deckId: deck.deckId,
            searchParams,
          })
        }
        className="flex items-center !justify-start w-full hover:dark:bg-slate-700 hover:bg-gray-300 rounded-md py-1 px-2 transition-colors duration-200"
      >
        <p className="text-sm text-gray-600 dark:text-gray-50 flex gap-2 items-center">
          <BsTrash /> Delete
        </p>
      </Button>
    </div>
  );
};

export default memo(DeckMoreOptions);

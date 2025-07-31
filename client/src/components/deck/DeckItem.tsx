import { useContext, useEffect, useRef, useState, memo, JSX } from "react";
import type { DeckType } from "../../types/types";
import Button from "../Button";
import { BsFillPinFill, BsThreeDotsVertical, BsTrash } from "react-icons/bs";
import { BiEdit } from "react-icons/bi";
import { formatDate } from "../../functions/formatDate";
import { Link } from "react-router-dom";
import { BulbContext } from "../../context/BulbContext";
import { twMerge } from "tailwind-merge";
import { DeckContext } from "../../context/DeckContext";
import { useClickOutside } from "../../hooks/utility/useClickOutside";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";
import useDeleteDeck from "../../hooks/react-query/useDeleteDeck";

type PropTypes = {
  handleEditDeck: (deckId: string, title: string) => void;
  handlePin: (deckId: string, pinned: boolean) => void;
  deck: DeckType;
  highlightedTitle?: JSX.Element;
  closeSearchBar?: (deckId: string) => void;
  isDragging?: boolean;
  searchParams?: {
    query: string;
    page: number;
  };
};

const DeckItem = ({
  handleEditDeck,
  deck,
  handlePin,
  highlightedTitle,
  closeSearchBar,
  isDragging,
  searchParams,
}: PropTypes) => {
  const { deckContainerRef, newlyAddedDeckId, setNewlyAddedDeckId } =
    useContext(DeckContext);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const moreOptionsRef = useRef<HTMLDivElement | null>(null);
  const deckItemRef = useRef<HTMLDivElement | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const { bulbRef, removeBulbColorAfterTimeout } = useContext(BulbContext);
  const { mutate: deleteDeck } = useDeleteDeck();
  useClickOutside(dropdownRef, showMoreOptions, () => {
    setShowMoreOptions(false);
  });

  useFocusTrap(moreOptionsRef, "both", {
    onEscape: () => setShowMoreOptions(false),
    enabled: showMoreOptions,
  });
  useEffect(() => {
    if (newlyAddedDeckId === deck.deckId) {
      // Find the element you want to scroll to
      const elementToScrollTo = deckItemRef.current;

      if (elementToScrollTo && deckContainerRef.current) {
        const yOffset = -200; // Offset for better positioning
        const elementRect = elementToScrollTo.getBoundingClientRect();
        const containerRect = deckContainerRef.current.getBoundingClientRect();

        // Get element's position relative to the container
        const elementTop = elementRect.top - containerRect.top;
        const elementBottom = elementRect.bottom - containerRect.top;

        // Get container's scroll position
        const scrollTop = deckContainerRef.current.scrollTop;
        const containerHeight = deckContainerRef.current.clientHeight;

        // Check if element is fully in view
        const isInView = elementTop >= 0 && elementBottom <= containerHeight;

        if (!isInView) {
          const targetScrollPosition = scrollTop + elementTop + yOffset;
          deckContainerRef.current.scrollTo({
            top: targetScrollPosition,
            behavior: "smooth",
          });
        }

        bulbRef.current?.setBulbColor("cyan");
      }

      removeBulbColorAfterTimeout("cyan", 4500, () => {
        setNewlyAddedDeckId(null);
      });
    }
  }, [newlyAddedDeckId, deck.deckId]);

  useEffect(() => {
    if (!isDragging) return;

    if (timeoutIdRef.current) {
      setNewlyAddedDeckId(null);
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, [isDragging]);

  return (
    <div
      ref={deckItemRef}
      className={twMerge(
        "relative border dark:border-slate-700 border-slate-400 text-gray-700 dark:text-gray-50 rounded-md w-[10.5rem] xs:w-[10.9rem] ms:w-[12rem] sm:w-[10.9rem] px-2  min-h-[7rem]  flex  justify-center items-center  text-justify transition-[border-color,box-shadow,background-color] duration-200   before:absolute before:opacity-0 before:transition-all before:duration-200 shadow-4-sides hover:shadow-sky-500  dark:hover:bg-gray-900 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-gray-100 group",
        showMoreOptions ? "z-50" : "z-30 ",
        deck.isProcessing ? "cursor-not-allowed" : " ",
        newlyAddedDeckId === deck.deckId
          ? "shadow-2xl shadow-[#00DDDD] !border-[#00DDDD] dark:!border-[#00DDDD] !text-[#00DDDD] animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_3]"
          : null
      )}
    >
      <div
        className={`absolute w-full h-full bg-[url('/hexagongrid.svg')] bg-center bg-cover after:absolute  after:inset-0 after:m-auto  after:w-[40%] after:aspect-square  after:blur-[40px] after:rounded-full after:opacity-0  z-50 group-hover:after:bg-radialGradient group-hover:after:opacity-100 after:transition-all after:duration-200 pointer-events-none  `}
      ></div>

      <Button
        variant="plain"
        size="md"
        aria-label={deck.pinned ? "Unpin Deck" : "Pin Deck"}
        toolTipText={deck.pinned ? "Unpin Deck" : "Pin Deck"}
        withTooltip
        type="button"
        onClick={() => {
          handlePin(deck.deckId, deck.pinned);
        }}
        className="absolute  dark:bg-slate-800 bg-gray-200 rounded-full w-6 h-6 z-50 top-2 left-2 flex items-center justify-center group/Btn"
      >
        <p className=" rounded-tr text-sm px-1  text-center  text-red-600 group-hover/Btn:scale-95">
          <BsFillPinFill className="text-[0.9rem]" />
        </p>
      </Button>

      <div ref={dropdownRef}>
        <Button
          variant="plain"
          size="md"
          aria-label="Show more options"
          toolTipText="More options"
          withTooltip
          hideTooltip={showMoreOptions}
          toolTipPosition="bottom"
          type="button"
          onClick={() => setShowMoreOptions((prevValue) => !prevValue)}
          className="absolute z-50 right-2 top-2 hover:scale-95 rounded-full p-[0.1rem]  "
        >
          <BsThreeDotsVertical />
        </Button>

        {showMoreOptions && (
          <div
            ref={moreOptionsRef}
            className="absolute z-[100] -right-5 top-9 flex items-start justify-center flex-col gap-2 dark:bg-slate-800 bg-gray-200 rounded-md py-2 px-3 w-32 border border-slate-400 select-none"
          >
            <div className="absolute z-20 -top-[0.8px] right-[1.85rem] h-[1px] dark:bg-slate-800 bg-gray-200 w-[13.1px]"></div>
            <svg
              className="absolute z-10 top-[-10px] right-7"
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
        )}
      </div>

      <div className="z-40 w-full flex items-center justify-center ">
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 flex items-center justify-center gap-1 select-none">
          <span>{formatDate(deck.createdAt)}</span>{" "}
          <span className="inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>
            {deck.cardsCount || 0}{" "}
            {(deck.cardsCount || 0) === 1 ? "entry" : "entries"}
          </span>
        </div>

        {deck.isProcessing ? (
          <svg
            className="animate-spin h-5 w-5 text-gray-400 dark:text-gray-100"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <Link
            to={`cards/${deck.deckId}`}
            onClick={(e) => {
              if (highlightedTitle && closeSearchBar) {
                e.preventDefault();
                closeSearchBar(deck.deckId);
              }
            }}
            className="outline-none focus-visible:ring-2 dark:focus-visible:ring-blue-500 focus-visible:ring-gray-500 inline-block w-full rounded-sm"
          >
            <p className=" break-all font-bold  line-clamp-1 h-7 text-center  w-full  ">
              {highlightedTitle ? highlightedTitle : deck.title}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default memo(DeckItem);

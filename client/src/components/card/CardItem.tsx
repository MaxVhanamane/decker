import { MdOutlineDeleteOutline } from "react-icons/md";
import {
  useRef,
  memo,
  useEffect,
  useState,
  MouseEvent,
  useCallback,
} from "react";
import { BiEdit } from "react-icons/bi";
import { useContext } from "react";
import { OfflineContext } from "../../context/OfflineContext";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import type { CardContentType, ContentTypeForEdit } from "../../types/types";
import { CardContext } from "../../context/CardContext";
import { useParams } from "react-router-dom";
import Button from "../Button";
import { twMerge } from "tailwind-merge";
import { Descendant, Element as SlateElement, Text } from "slate";
import { extractTextFromSlateNodes } from "../../utils/editor/extractTextFromSlateNodes";

type CardDeletionParams = {
  deckId: string;
  cardInfo: CardContentType;
  deletionIndex: number;
};

type PropType = {
  handleDeleteCard: (payload: CardDeletionParams) => void;
  handleEditCardButtonClick: (cardItem: ContentTypeForEdit) => void;
  card: {
    note: Descendant[];
    cardId: string;
    _id: string;
    createdAt: string;
  };
  index: number;
  isDragging: boolean;
};

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    year: "numeric",
  };

  return new Date(dateString).toLocaleDateString("en-US", options);
};

const CardItem = memo(
  ({
    handleDeleteCard,
    handleEditCardButtonClick,
    card,
    isDragging,
    index,
  }: PropType) => {
    const { deckId } = useParams();
    const { showToast } = useContext(ShowToastContext);
    const { isOnline } = useContext(OfflineContext);
    const [shouldAnimateCardDeletion, setShouldAnimateCardDeletion] =
      useState(false);
    const elementRef = useRef<HTMLDivElement | null>(null);
    const { undoCardCardId, setShouldTrashCanRotate, setUndoCardId } =
      useContext(CardContext);

    useEffect(() => {
      if (isDragging) {
        setUndoCardId(null);
      }
    }, [isDragging]);

    // useEffect(() => {
    //   const element = elementRef.current;

    //   if (element && deletedCardId === card.cardId) {
    //     const rect = element.getBoundingClientRect();
    //     const fullyVisible =
    //       rect.top >= 0 &&
    //       rect.bottom <=
    //         (window.innerHeight || document.documentElement.clientHeight);

    //     bulbRef?.current?.setBulbColor("yellow");

    //     // Only scroll if the card is not fully visible
    //     if (!fullyVisible) {
    //       element.scrollIntoView({ behavior: "smooth", block: "center" });
    //     }

    //     element.focus();

    //     const timeout = setTimeout(() => {
    //       bulbRef?.current?.removeBulbColor("yellow");
    //       setDeletedCardId(null);
    //     }, 4500);

    //     return () => clearTimeout(timeout);
    //   }
    // }, []);

    const handleDeleteCardButtonClick = useCallback(
      (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
        event.stopPropagation();
        if (!isOnline) {
          showToast({
            message: "No internet connection",
            severity: "error",
            autoHideDuration: 5000,
            position: "top-center",
            animationStyle: "scale-up",
            theme: "auto",
          });
          return;
        }

        const element = elementRef.current;

        if (element) {
          // Get the element's position relative to the viewport
          const rect = element.getBoundingClientRect();
          const elementWidth = rect.width;

          // Calculate animation distances
          const toRight = rect.left - elementWidth / 4;
          const toBottom = rect.top;

          // Create a clone positioned absolutely over the entire viewport
          const clone = element.cloneNode(true) as HTMLElement;
          clone.style.position = "fixed";
          clone.style.top = `${rect.top}px`;
          clone.style.left = `${rect.left}px`;
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
          clone.style.zIndex = "9999";
          clone.style.pointerEvents = "none";
          clone.style.setProperty("--to-right", `${toRight}px`);
          clone.style.setProperty("--to-bottom", `${toBottom}px`);
          clone.classList.add("animate-translateToRightThenBottom");

          // Add the clone to body (outside any containers)
          document.body.appendChild(clone);

          // Hide the original element immediately
          element.style.opacity = "0";

          clone.addEventListener("animationend", (event) => {
            if (event.animationName === "translateToRightThenBottom") {
              document.body.removeChild(clone);
              handleDeleteCard({
                deckId: deckId!,
                cardInfo: {
                  note: card.note,
                  cardId: card.cardId,
                  createdAt: card.createdAt,
                },
                deletionIndex: index,
              });
              setShouldTrashCanRotate(false);
            }
          });
          clone.addEventListener("animationstart", (event) => {
            if (event.animationName === "translateToRightThenBottom") {
              setShouldTrashCanRotate(true);
            }
          });
        }

        if (undoCardCardId) {
          setUndoCardId(null);
        }
        setShouldAnimateCardDeletion(true);
      },
      [isOnline, undoCardCardId, card, index, deckId, handleDeleteCard]
    );

    const cardTitle =
      card.note &&
      SlateElement.isElement(card.note[0]) &&
      Text.isText(card.note[0].children?.[0]) &&
      card.note[0]?.children?.[0]?.text?.trim()
        ? card.note[0].children[0].text
        : "";

    const note = extractTextFromSlateNodes(card.note);

    return (
      <div
        ref={elementRef}
        className={twMerge(
          "relative border overflow-hidden group/card dark:border-slate-600 border-slate-400 shadow-4-sides rounded-md px-2 lg:pt-2 pt-[0.4rem] h-[9rem] lg:h-[9.5rem]  text-justify   transition-[background-color,border-color,box-shadow] duration-300  dark:hover:border-blue-500  dark:hover:shadow-blue-500  hover:border-sky-600 hover:shadow-sky-600 group",
          undoCardCardId === card.cardId &&
            "!border-yellow-400  !shadow-yellow-400 dark:text-yellow-400 text-yellow-400 animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_3] "
        )}
      >
        <div
          className={`absolute  top-0 -right-1 -z-10 ${
            (isDragging || shouldAnimateCardDeletion) && "z-10"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={twMerge(
              "  absolute -right-4 -top-8 h-20 w-20 origin-top-right stroke-[0.4]  duration-300 group-hover/card:scale-90 ",
              undoCardCardId === card.cardId
                ? "dark:text-yellow-400 text-yellow-500"
                : "text-black/10 dark:text-slate-700 group-hover/card:text-sky-500  dark:group-hover/card:text-blue-500"
            )}
          >
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={twMerge(
              "absolute -right-4 -top-8 h-28 w-28 origin-top-right stroke-[0.3] text-black/10 duration-500 group-hover/card:scale-90 dark:text-white/10 ",
              undoCardCardId === card.cardId
                ? "dark:text-yellow-400 text-yellow-500"
                : "text-black/10 dark:text-slate-700 group-hover/card:text-sky-500  dark:group-hover/card:text-blue-500"
            )}
          >
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 flex items-center justify-between w-full py-2 px-3 ">
          <div className="text-xs text-gray-400 ">
            <span>{formatDate(card.createdAt)}</span>
          </div>
          <div className="flex items-center justify-center gap-2 ">
            <div className=" dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors duration-300 hover:bg-gray-300  bg-gray-200 rounded-full w-6 h-6 z-50  flex items-center justify-center group/deleteCardBtn">
              <Button
                variant="unstyled"
                onClick={handleDeleteCardButtonClick}
                toolTipText="Delete card"
                withTooltip
                className="text-red-500 rounded-full p-[0.2rem]  text-center  transition-all duration-500 hover:text-red-600 "
                aria-label="Delete Card"
              >
                <MdOutlineDeleteOutline />
              </Button>
            </div>
            <div className=" dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors duration-300 bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6 z-50  flex items-center justify-center group/editBtn ">
              <Button
                variant="unstyled"
                onClick={(event) => {
                  event.stopPropagation();
                  if (undoCardCardId) {
                    setUndoCardId(null);
                  }
                  handleEditCardButtonClick({
                    ...card,
                    cardIndex: index,
                  });
                }}
                toolTipText="Edit card"
                withTooltip
                className="text-blue-500 dark:hover:text-sky-600 rounded-full p-[0.2rem] hover:text-blue-600 text-base text-center dark:text-sky-400"
                aria-label="Edit Card"
              >
                <BiEdit />
              </Button>
            </div>
          </div>
        </div>

        <p className="text-base text-gray-700 dark:text-white mb-1 p-1 line-clamp-1 break-words break-all ">
          {cardTitle ? (
            cardTitle
          ) : (
            <span className="text-sm lg:text-base font-normal dark:text-gray-500 text-gray-400">
              You have not added a title to this entry.
            </span>
          )}
        </p>

        <div className="text-sm  text-gray-800 dark:text-gray-100 p-1  break-words break-all font-light ">
          <p className="line-clamp-3">
            {note.trim().length > 0 ? (
              note
            ) : (
              <span className="font-normal dark:text-gray-500 text-gray-400">
                You have not added a note to this entry.
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }
);
CardItem.displayName = "CardItem";
export default CardItem;

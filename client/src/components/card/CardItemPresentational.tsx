import type { CurrentDraggingCardType } from "../../types/types";
import { BiEdit } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { formatDate } from "../../functions/formatDate";
import { Element as SlateElement } from "slate";
import { Text } from "slate";
import { extractTextFromSlateNodes } from "../../utils/editor/extractTextFromSlateNodes";
type PropType = NonNullable<CurrentDraggingCardType>;

const CardItemPresentational = ({
  isDraggingCardOverDeleteArea,
  isDragging,
  card,
}: PropType) => {
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
      className={`relative your-drag-preview-selector border overflow-hidden ${
        isDragging
          ? "shadow-2xl  border-violet-500  shadow-violet-500  dark:border-violet-500  dark:shadow-violet-500 animate-[pulse_3s_linear_infinite] dark:bg-slate-900 bg-white"
          : "dark:border-slate-600 border-slate-400"
      } ${
        isDraggingCardOverDeleteArea
          ? " !shadow-red-500 !border-red-500 "
          : null
      }    
        rounded-md px-2 lg:pt-2 pt-[0.4rem]  h-[9rem] lg:h-[9.5rem]  text-justify  transition-[background-color,border-color,box-shadow] duration-300 font-customInter `}
    >
      <div className={`absolute  top-0 -right-1 -z-10 ${isDragging && "z-10"}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={` ${
            isDragging && !isDraggingCardOverDeleteArea
              ? " dark:!text-violet-500 "
              : "group-hover/card:text-emerald-500  dark:group-hover/card:text-sky-500"
          } ${
            isDraggingCardOverDeleteArea && "dark:!text-red-500 !text-red-500 "
          } ${
            isDragging ? " animate-scaleUpDown" : ""
          } absolute -right-4 -top-8 h-20 w-20 origin-top-right stroke-[0.3] text-slate-400 dark:text-slate-600 duration-300 group-hover/card:scale-90 `}
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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`   absolute -right-4 -top-8 h-28 w-28 origin-top-right stroke-[0.2]  duration-500 group-hover/card:scale-90 text-slate-400 dark:text-slate-600
                      ${
                        isDragging && !isDraggingCardOverDeleteArea
                          ? " dark:!text-violet-500 "
                          : "group-hover/card:text-emerald-500  dark:group-hover/card:text-sky-500"
                      }

                      ${
                        isDraggingCardOverDeleteArea &&
                        "dark:!text-red-500 !text-red-500"
                      }
                      ${isDragging ? " animate-scaleUpDown" : ""}
                      `}
        >
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 flex items-center justify-between w-full py-2 px-3 ">
        <div className="text-xs text-gray-400 select-none">
          <span>{formatDate(card.createdAt)}</span>
        </div>
        <div className="flex items-center justify-center gap-3 ">
          <div className=" dark:bg-slate-800  bg-gray-200 rounded-full w-6 h-6 z-50  flex items-center justify-center ">
            <button
              className="text-gray-600 dark:text-slate-300  rounded-full p-[0.2rem] text-center "
              aria-label="Delete Card"
            >
              <MdOutlineDeleteOutline />
            </button>
          </div>
          <div className=" dark:bg-slate-800  bg-gray-200 hover:bg-gray-300 rounded-full w-6 h-6 z-50  flex items-center justify-center ">
            <button
              className="text-gray-600 dark:text-slate-300  rounded-full p-[0.2rem]  text-base text-center "
              aria-label="Edit Card"
            >
              <BiEdit />
            </button>
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
};

export default CardItemPresentational;

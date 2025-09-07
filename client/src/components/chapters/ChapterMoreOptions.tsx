import { Dispatch, memo, SetStateAction } from "react";
import Button from "../Button";
import { BiEdit } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";

type DeckMoreOptionsProps = {
  moreOptionsRef: React.MutableRefObject<HTMLDivElement | null>;
  setShowMoreOptions: Dispatch<SetStateAction<boolean>>;
  showMoreOptions: boolean;
  handleShowEditChapterModal: (currentChapterName: string) => void;
  chapterName: string;
  handleDeleteChapter: () => void;
};

const ChapterMoreOptions = ({
  moreOptionsRef,
  showMoreOptions,
  setShowMoreOptions,
  handleShowEditChapterModal,
  chapterName,
  handleDeleteChapter,
}: DeckMoreOptionsProps) => {
  useFocusTrap(moreOptionsRef, "both", {
    onEscape: () => setShowMoreOptions(false),
    enabled: showMoreOptions,
    initialFocusIndex: 0,
  });
  return (
    <>
      <div
        ref={moreOptionsRef}
        className="absolute z-[90] right-0 top-10 flex items-start justify-center flex-col gap-2 dark:bg-slate-800 bg-gray-200 rounded-md py-2 px-3 w-32 border border-slate-400 select-none outline-none"
      >
        <div className="absolute z-20 -top-[0.8px] right-[9.2px] h-[1px] dark:bg-slate-800 bg-gray-200 w-[13.5px]"></div>
        <svg
          className="absolute z-10 top-[-10px] right-2"
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMoreOptions(false);
            handleShowEditChapterModal(chapterName);
          }}
          variant="plain"
          size="md"
          aria-label="Edit Deck"
          type="button"
          className="flex items-center !justify-start w-full hover:dark:bg-slate-700 hover:bg-gray-300 rounded-md py-1 px-2 transition-colors duration-200"
        >
          <p className="text-sm text-gray-600 dark:text-gray-50 flex gap-2 items-center">
            <BiEdit /> Edit
          </p>
        </Button>

        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDeleteChapter();
          }}
          variant="plain"
          size="md"
          aria-label="Delete Deck"
          type="button"
          className="flex items-center !justify-start w-full hover:dark:bg-slate-700 hover:bg-gray-300 rounded-md py-1 px-2 transition-colors duration-200"
        >
          <p className="text-sm text-gray-600 dark:text-gray-50 flex gap-2 items-center">
            <BsTrash /> Delete
          </p>
        </Button>
      </div>
    </>
  );
};

export default memo(ChapterMoreOptions);

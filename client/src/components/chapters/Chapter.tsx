import React, { memo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChapterDetails } from "../../types/types";
import { useStableParams } from "../../context/stableParamsContext";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useClickOutside } from "../../hooks/utility/useClickOutside";
import { getDeckInfo, storeDeckInfo } from "../../functions/deckDataManager";
import ChapterMoreOptions from "./ChapterMoreOptions";
import { RiDraggable } from "react-icons/ri";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { DraggableAttributes } from "@dnd-kit/core";

type ChapterProps = {
  chapter: ChapterDetails;
  moreOptionsRef: React.MutableRefObject<HTMLDivElement | null>;
  handleShowEditChapterModal: (currentChapterName: string) => void;
  handleDeleteChapterButtonClick: (chapter: ChapterDetails) => void;
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
};

const Chapter = ({
  chapter,
  moreOptionsRef,
  handleShowEditChapterModal,
  handleDeleteChapterButtonClick,
  attributes,
  listeners,
}: ChapterProps) => {
  const { deckId, chapterId } = useStableParams();
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(
    moreOptionsRef,
    true,
    () => {
      setShowMoreOptions(false);
    },
    { excludeRefs: [triggerRef] }
  );
  const handleDeleteChapter = () => {
    handleDeleteChapterButtonClick(chapter);
    setShowMoreOptions(false);
  };

  return (
    <div className="group/chapter relative w-full flex items-center">
      <Link
        onClick={() => {
          const deckInfo = getDeckInfo();
          storeDeckInfo(deckInfo.deckTitle, chapter.chapterName);
        }}
        to={`/cards/${deckId}/${chapter.chapterId}`}
        className={twMerge(
          "flex-1 flex outline-none focus-visible:ring-2 dark:ring-blue-500 ring-gray-600 items-center text-sm justify-start w-full p-1 py-1.5 pl-6 rounded-lg transition-none lg:transition-[background-color,box-shadow] duration-200 relative",
          "group-hover/chapter:bg-gray-100 dark:group-hover/chapter:bg-slate-800",
          chapterId === chapter.chapterId && "dark:bg-slate-800 bg-gray-100",
          showMoreOptions &&
            "ring-1 ring-gray-200 dark:ring-slate-800 hover:ring-0"
        )}
      >
        <span
          className={twMerge(
            "block p-1 py-0 rounded-md  max-w-full w-full text-left overflow-hidden whitespace-nowrap text-ellipsis mr-6 lg:mr-auto relative"
          )}
        >
          {chapter.chapterName}
          <span
            className={twMerge(
              "absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 dark:from-slate-900 to-transparent lg:hidden",
              chapterId === chapter.chapterId && "hidden"
            )}
          />
        </span>
      </Link>
      <Button
        {...attributes}
        {...listeners}
        variant="unstyled"
        className="absolute left-0 top-1/2 -translate-y-1/2 p-1 rounded-md"
      >
        <RiDraggable className="text-lg" />
      </Button>

      <Button
        ref={showMoreOptions ? triggerRef : null}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMoreOptions((prev) => !prev);
        }}
        variant="unstyled"
        className={twMerge(
          "absolute right-0 lg:bg-gray-100 dark:lg:bg-slate-800 focus-visible:lg:bg-white dark:focus-visible:lg:bg-slate-900 p-1.5 rounded-lg lg:opacity-0 group-hover/chapter:opacity-100 focus-visible:opacity-100 group-focus-visible/chapter:lg:bg-white dark:group-focus-visible/chapter:lg:bg-slate-900 group-focus-visible/chapter:opacity-100 transition-none group-hover/chapter:transition-[opacity] group-hover/chapter:duration-200 group-hover/chapter:delay-100 lg:pointer-events-none group-hover/chapter:pointer-events-auto",
          chapterId !== chapter.chapterId &&
            showMoreOptions &&
            "lg:opacity-100 lg:bg-white transition-[background-color] duration-200 dark:lg:bg-slate-900 group-hover/chapter:duration-200 group-hover/chapter:transition-[background-color] group-hover/chapter:delay-0 dark:group-hover/chapter:lg:bg-slate-800 group-hover/chapter:lg:bg-gray-100",
          chapterId == chapter.chapterId && showMoreOptions && "lg:opacity-100",
          chapterId == chapter.chapterId &&
            "dark:group-focus-visible/chapter:lg:bg-slate-800 dark:focus-visible:lg:bg-slate-800 group-focus-visible/chapter:lg:bg-gray-100 focus-visible:lg:bg-gray-100"
        )}
      >
        <BsThreeDotsVertical className="rotate-90 " />
      </Button>

      {showMoreOptions && (
        <ChapterMoreOptions
          handleDeleteChapter={handleDeleteChapter}
          moreOptionsRef={moreOptionsRef}
          setShowMoreOptions={setShowMoreOptions}
          showMoreOptions={showMoreOptions}
          handleShowEditChapterModal={handleShowEditChapterModal}
          chapterName={chapter.chapterName}
        />
      )}
    </div>
  );
};

export default memo(Chapter);

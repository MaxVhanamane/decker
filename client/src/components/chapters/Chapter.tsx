import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChapterDetails } from "../../types/types";
import { useStableParams } from "../../context/stableParamsContext";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useClickOutside } from "../../hooks/utility/useClickOutside";
import { getDeckInfo, storeDeckInfo } from "../../functions/deckDataManager";
import ChapterMoreOptions from "./ChapterMoreOptions";

type ChapterProps = {
  chapter: ChapterDetails;
  moreOptionsRef: React.MutableRefObject<HTMLDivElement | null>;
  handleShowEditChapterModal: (currentChapterName: string) => void;
  handleDeleteChapterButtonClick: (chapter: ChapterDetails) => void;
};

const Chapter = ({
  chapter,
  moreOptionsRef,
  handleShowEditChapterModal,
  handleDeleteChapterButtonClick,
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
    <Link
      key={chapter.chapterId}
      onClick={() => {
        const deckInfo = getDeckInfo();
        storeDeckInfo(deckInfo.deckTitle, chapter.chapterName);
      }}
      to={`/cards/${deckId}/${chapter.chapterId}`}
      className=" w-full rounded-lg outline-none group/chapter focus-visible:ring-2 dark:ring-blue-500 ring-gray-600"
    >
      <li
        className={twMerge(
          "flex  items-center text-sm justify-start hover:bg-gray-100 w-full dark:hover:bg-slate-800 p-2 py-1.5 rounded-lg mr-2 transition-[background-color,box-shadow] duration-200 relative",
          chapterId === chapter.chapterId && "dark:bg-slate-800 bg-gray-100",
          showMoreOptions &&
            "ring-1 ring-gray-200 dark:ring-slate-800 hover:ring-0 "
        )}
      >
        <span className="block max-w-full w-full  text-left overflow-hidden whitespace-nowrap text-ellipsis mr-6 lg:mr-auto relative">
          {chapter.chapterName}
          {
            <span
              className={twMerge(
                "absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 dark:from-slate-900 to-transparent lg:hidden",
                chapterId === chapter.chapterId && "hidden"
              )}
            />
          }
        </span>

        <Button
          ref={showMoreOptions ? triggerRef : null}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMoreOptions((prev) => !prev);
          }}
          variant="unstyled"
          className={twMerge(
            "absolute right-0 lg:bg-gray-100 dark:lg:bg-slate-800 focus-visible:lg:bg-white dark:focus-visible:lg:bg-slate-900 p-1 rounded-lg lg:opacity-0 group-hover/chapter:opacity-100 focus-visible:opacity-100 group-focus-visible/chapter:lg:bg-white  dark:group-focus-visible/chapter:lg:bg-slate-900 group-focus-visible/chapter:opacity-100 transition-none group-hover/chapter:transition-[opacity] group-hover/chapter:duration-200 group-hover/chapter:delay-100 lg:pointer-events-none group-hover/chapter:pointer-events-auto",

            chapterId !== chapter.chapterId &&
              showMoreOptions &&
              "lg:opacity-100 lg:bg-white transition-[background-color] duration-200 dark:lg:bg-slate-900 group-hover/chapter:duration-200 group-hover/chapter:transition-[background-color] group-hover/chapter:delay-0 dark:group-hover/chapter:lg:bg-slate-800 group-hover/chapter:lg:bg-gray-100",
            chapterId == chapter.chapterId &&
              showMoreOptions &&
              "lg:opacity-100 ",
            chapterId == chapter.chapterId &&
              "dark:group-focus-visible/chapter:lg:bg-slate-800 dark:focus-visible:lg:bg-slate-800 group-focus-visible/chapter:lg:bg-gray-100 focus-visible:lg:bg-gray-100"
          )}
        >
          <BsThreeDotsVertical className="rotate-90 text-lg" />
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
      </li>
    </Link>
  );
};

export default Chapter;

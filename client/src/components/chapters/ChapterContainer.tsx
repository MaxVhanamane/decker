import { memo, useMemo } from "react";
import { ChapterDetails, GetChaptersResponseType } from "../../types/types";
import SortableChapterItem from "./SortableChapterItem";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type ChapterContainerProps = {
  data: GetChaptersResponseType;
  handleShowEditChapterModal: (currentChapterName: string) => void;
  handleDeleteChapterButtonClick: (chapter: ChapterDetails) => void;
};

const ChapterContainer = ({
  data,
  handleShowEditChapterModal,
  handleDeleteChapterButtonClick,
}: ChapterContainerProps) => {
  const items = useMemo(() => {
    return data.chapters?.map((chapter) => chapter?.chapterId);
  }, [data?.chapters]);

  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <ul className=" text-gray-700 dark:text-gray-200 flex items-start justify-center flex-col gap-1 pl-[10px] pr-2 ">
        {data?.chapters?.map((chapter, index) => {
          return (
            <SortableChapterItem
              key={chapter.chapterId}
              index={index}
              ChapterDetails={chapter}
              handleShowEditChapterModal={handleShowEditChapterModal}
              handleDeleteChapterButtonClick={handleDeleteChapterButtonClick}
            />
          );
        })}
      </ul>
    </SortableContext>
  );
};

export default memo(ChapterContainer);

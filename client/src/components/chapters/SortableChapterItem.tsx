import { useSortable } from "@dnd-kit/sortable";
import { ChapterDetails } from "../../types/types";
import { useContext, useMemo, useRef } from "react";
import { CSS } from "@dnd-kit/utilities";
import Chapter from "./Chapter";
import { DndCurrentDraggingChapterContext } from "../../context/DndItemContext";
import { twMerge } from "tailwind-merge";

type SortableChapterItemProps = {
  handleShowEditChapterModal: (currentChapterName: string) => void;
  handleDeleteChapterButtonClick: (chapter: ChapterDetails) => void;
  ChapterDetails: ChapterDetails;
  index: number;
};

const SortableChapterItem = ({
  handleDeleteChapterButtonClick,
  handleShowEditChapterModal,
  ChapterDetails,
  index,
}: SortableChapterItemProps) => {
  const moreOptionsRef = useRef<HTMLDivElement | null>(null);
  const { currentDraggingChapter } = useContext(
    DndCurrentDraggingChapterContext
  );
  const {
    isDragging,
    listeners,
    attributes,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id: ChapterDetails.chapterId,
    data: { name: "chapter", ChapterDetails, index },
    transition: {
      duration: 500,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });
  const style = useMemo(() => {
    return {
      transition,
      transform: CSS.Transform.toString(transform),
      opacity: isDragging ? 0 : 1,
      touchAction: "pan-y",
    };
  }, [transition, transform, isDragging]);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={twMerge(
        "w-full relative rounded-lg group/chapter focus-visible:ring-2 dark:ring-blue-500 ring-gray-600 outline-none",
        currentDraggingChapter &&
          "ring-1 ring-inset ring-slate-400/50 dark:ring-slate-400/40"
      )}
    >
      <Chapter
        key={ChapterDetails.chapterId}
        chapter={ChapterDetails}
        moreOptionsRef={moreOptionsRef}
        handleShowEditChapterModal={handleShowEditChapterModal}
        handleDeleteChapterButtonClick={handleDeleteChapterButtonClick}
        attributes={attributes}
        listeners={listeners}
      />
    </li>
  );
};

export default SortableChapterItem;

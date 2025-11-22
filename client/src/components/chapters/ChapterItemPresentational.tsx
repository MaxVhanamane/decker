import { RiDraggable } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import { BsThreeDotsVertical } from "react-icons/bs";
type ChapterItemOverlayProps = {
  chapterName: string;
  isDragging: boolean;
  isDraggingChapterOverDeleteArea: boolean;
};
const ChapterItemPresentational = ({
  chapterName,
  isDragging,
  isDraggingChapterOverDeleteArea,
}: ChapterItemOverlayProps) => {
  return (
    <div className="group/chapter relative w-full flex items-center">
      <div
        className={twMerge(
          "flex-1 flex items-center text-sm justify-start w-full p-1.5 pl-6 rounded-lg relative",
          "bg-white dark:bg-slate-900 shadow-lg ring-1 ring-gray-200 dark:ring-slate-700 text-gray-700 dark:text-gray-200",
          isDragging &&
            "shadow-4-sides shadow-green-500 dark:shadow-green-500 ring-1 dark:ring-green-500 ring-green-500 animate-[pulse_3s_linear_infinite]",
          isDraggingChapterOverDeleteArea &&
            "shadow-4-sides shadow-red-500 dark:shadow-red-500 ring-1 dark:ring-red-500 ring-red-500 animate-[pulse_3s_linear_infinite]"
        )}
      >
        <span className="block p-1 py-0 rounded-md max-w-full w-full text-left overflow-hidden whitespace-nowrap text-ellipsis mr-6 lg:mr-auto relative">
          {chapterName}
          <span className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 dark:from-slate-900 to-transparent lg:hidden" />
        </span>

        <Button
          variant="unstyled"
          className="absolute left-0 top-1/2 -translate-y-1/2 p-1 rounded-md"
        >
          <RiDraggable className="text-lg" />
        </Button>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-50 pointer-events-none">
          <BsThreeDotsVertical className="rotate-90 text-gray-700 dark:text-gray-200" />
        </span>
      </div>
    </div>
  );
};

export default ChapterItemPresentational;

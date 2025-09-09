import { twMerge } from "tailwind-merge";
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
    <div
      className={twMerge(
        "flex items-center text-sm justify-start w-full p-2 py-1.5 rounded-lg mr-2 relative",
        "bg-white dark:bg-slate-900 shadow-lg ring-1 ring-gray-200 dark:ring-slate-700 text-gray-700 dark:text-gray-200",
        isDragging &&
          "shadow-4-sides shadow-green-500 dark:shadow-green-500 ring-1 dark:ring-green-500 ring-green-500 animate-[pulse_3s_linear_infinite]",
        isDraggingChapterOverDeleteArea &&
          "shadow-4-sides shadow-red-500 dark:shadow-red-500 ring-1 dark:ring-red-500 ring-red-500 animate-[pulse_3s_linear_infinite]"
      )}
    >
      <span className="block max-w-full w-full text-left overflow-hidden whitespace-nowrap text-ellipsis mr-6 lg:mr-auto relative">
        {chapterName}
        <span className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-50 dark:from-slate-900 to-transparent lg:hidden" />
      </span>
    </div>
  );
};

export default ChapterItemPresentational;

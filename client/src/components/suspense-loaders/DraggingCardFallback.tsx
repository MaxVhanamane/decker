import { twMerge } from "tailwind-merge";

type DraggingCardFallbackProps = {
  isDragging: boolean;
  isDraggingCardOverDeleteArea: boolean;
};
const DraggingCardFallback = ({
  isDragging,
  isDraggingCardOverDeleteArea,
}: DraggingCardFallbackProps) => {
  return (
    <div
      className={twMerge(
        "relative border  rounded-md h-[9rem] lg:h-[9.5rem] w-full flex items-center justify-center",
        isDragging
          ? "shadow-2xl ring-1 border-violet-500 ring-violet-500 shadow-violet-500  dark:border-violet-500 dark:ring-violet-500 dark:shadow-violet-500 animate-[pulse_3s_linear_infinite] dark:bg-slate-900 bg-white"
          : "dark:border-slate-600 border-slate-400  shadow-4-sides",
        isDraggingCardOverDeleteArea
          ? " !shadow-red-500 !border-red-500  !ring-red-500 "
          : null
      )}
    >
      <div
        className={twMerge(
          "w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin",
          isDragging && "border-t-violet-500",
          isDraggingCardOverDeleteArea && "border-t-red-500"
        )}
      ></div>
    </div>
  );
};

export default DraggingCardFallback;

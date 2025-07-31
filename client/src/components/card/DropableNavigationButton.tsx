import { useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import Button from "../Button";

type DropableNavigationButtons = {
  direction: "prev" | "next";
  page: number;
  totalPages: number;
  onPageChange: (newPage: number, mode: "drag" | "normal") => void;
};

export const DropableNavigationButton = ({
  direction,
  page,
  totalPages,
  onPageChange,
}: DropableNavigationButtons) => {
  const isPrev = direction === "prev";
  const canNavigate = isPrev ? page > 1 : page < totalPages;

  const { setNodeRef, isOver } = useDroppable({
    id: `drag-navigation-${direction}`,
  });

  useEffect(() => {
    if (isOver && canNavigate) {
      const timeoutId = setTimeout(() => {
        const newPage = isPrev ? page - 1 : page + 1;
        onPageChange(newPage, "drag");
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [isOver, page, canNavigate, direction, onPageChange]);

  return (
    <div className="flex items-center justify-center">
      <Button
        ref={setNodeRef}
        variant="unstyled"
        disabled={!canNavigate}
        className={twMerge(
          "flex items-center gap-2 px-4 py-2 h-24 w-14 rounded-md border text-sm font-medium ",
          "border-slate-300 dark:border-slate-600 dark:text-white text-gray-800",
          "bg-white dark:bg-transparent",

          isOver &&
            canNavigate &&
            "border  border-sky-500 shadow-4-sides !shadow-sky-500 dark:!shadow-sky-500 text-sky-500 dark:border-sky-500 dark:text-sky-500",
          !canNavigate && "invisible"
        )}
      >
        {isPrev ? (
          <>
            <MdOutlineNavigateBefore className="w-full h-full" />
          </>
        ) : (
          <>
            <MdOutlineNavigateNext className="text-8xl" />
          </>
        )}
      </Button>
    </div>
  );
};

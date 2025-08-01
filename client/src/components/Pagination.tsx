import React from "react";
import { twMerge } from "tailwind-merge";
import Button from "./Button";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Regular pagination button (non-droppable)
const RegularPageButton: React.FC<{
  page: number | "...";
  isCurrent: boolean;
  onPageChange: (page: number, mode: "drag" | "normal") => void;
  idx: number;
}> = ({ page, isCurrent, onPageChange, idx }) => {
  const isEllipsis = page === "...";
  const isNumber = typeof page === "number";

  if (isEllipsis) {
    return (
      <div
        key={`${page}-${idx}`}
        className="w-10 h-8 flex items-center justify-center rounded border text-sm select-none text-gray-400 cursor-default border-gray-300"
      >
        {page}
      </div>
    );
  }

  if (isNumber) {
    return (
      <Button
        variant="unstyled"
        key={`${page}-${idx}`}
        className={twMerge(
          "w-10 h-8 flex items-center justify-center rounded border text-sm select-none transition-colors duration-200 dark:text-gray-100",
          isCurrent && "bg-blue-500 text-white border-blue-500",
          !isCurrent &&
            "cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 border-gray-300"
        )}
        onClick={() => !isCurrent && onPageChange(page, "normal")}
      >
        {page}
      </Button>
    );
  }

  return null;
};

// Regular navigation button (non-droppable)
const RegularNavButton: React.FC<{
  direction: "prev" | "next";
  targetPage: number;
  disabled: boolean;
  onPageChange: (page: number, mode: "drag" | "normal") => void;
  children: React.ReactNode;
}> = ({ targetPage, disabled, onPageChange, children }) => {
  return (
    <Button
      variant="unstyled"
      className={twMerge(
        "w-10 h-8  rounded border text-sm dark:text-gray-100 hover:bg-gray-100 transition border-gray-300",
        disabled && "opacity-30 cursor-not-allowed"
      )}
      onClick={() => onPageChange(targetPage, "normal")}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const shouldShowLeftDots = currentPage > 4;
    const shouldShowRightDots = currentPage < totalPages - 3;

    pages.push(1);
    if (shouldShowLeftDots) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (shouldShowRightDots) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="w-full md:px-4 px-2 mb-20">
      {/* Regular Pagination */}
      <div
        className={twMerge(
          "flex justify-center items-center gap-2 py-4 transition-opacity duration-300"
        )}
      >
        <RegularNavButton
          direction="prev"
          targetPage={Math.max(1, currentPage - 1)}
          disabled={currentPage === 1}
          onPageChange={onPageChange}
        >
          <MdOutlineNavigateBefore className="w-5 h-5" />
        </RegularNavButton>

        {getPageNumbers().map((page, idx) => (
          <RegularPageButton
            key={`${page}-${idx}`}
            page={page}
            isCurrent={page === currentPage}
            onPageChange={onPageChange}
            idx={idx}
          />
        ))}

        <RegularNavButton
          direction="next"
          targetPage={Math.min(totalPages, currentPage + 1)}
          disabled={currentPage === totalPages}
          onPageChange={onPageChange}
        >
          <MdOutlineNavigateNext className="w-5 h-5" />
        </RegularNavButton>
      </div>
    </div>
  );
};

export default Pagination;

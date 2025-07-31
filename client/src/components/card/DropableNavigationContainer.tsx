import { memo, useContext } from "react";
import { DropableNavigationButton } from "./DropableNavigationButton";
import { DndFlagsContext } from "../../context/DndItemContext";
import { twMerge } from "tailwind-merge";

type DropableNavigationContainerProps = {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number, mode: "drag" | "normal") => void;
};

const DropableNavigationContainer = ({
  onPageChange,
  page,
  totalPages,
}: DropableNavigationContainerProps) => {
  const { isDragStarted } = useContext(DndFlagsContext);
  return (
    <div
      className={twMerge(
        "hidden :block transition-opacity duration-300 z-50",
        isDragStarted ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="fixed left-6 top-1/2 -translate-y-1/2 ">
        <DropableNavigationButton
          direction="prev"
          onPageChange={onPageChange}
          page={page}
          totalPages={totalPages}
        />
      </div>
      <div className="fixed right-6 top-1/2 -translate-y-1/2">
        <DropableNavigationButton
          direction="next"
          onPageChange={onPageChange}
          page={page}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default memo(DropableNavigationContainer);

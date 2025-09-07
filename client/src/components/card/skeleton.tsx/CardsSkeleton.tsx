import { useCallback, useContext } from "react";
import { SidebarContex } from "../../../context/SidebarContext";
import useWindowDimension from "../../../hooks/utility/useWindowDimension";
import { twMerge } from "tailwind-merge";
import CardItemSkeleton from "./CardItemSkeleton";

const CardsSkeleton = ({ skeletonCount }: { skeletonCount: number }) => {
  const { isSidebarOpen } = useContext(SidebarContex);
  const windowDimensions = useWindowDimension();

  const getColumnCount = (width: number): number => {
    if (width >= (isSidebarOpen ? 1350 : 1150)) return 3; // large screens
    if (width >= 768) return 2; // medium screens
    return 1; // small screens
  };

  const getGridDimensions = useCallback(() => {
    const { width: containerWidth, height: viewportHeight } = windowDimensions;
    let columnsPerRow = getColumnCount(containerWidth);
    let gridContainerWidth: number;
    let eachColumnWidth: number;
    let eachRowHeight = 160;
    let gridContainerHeight: number;

    if (containerWidth >= (isSidebarOpen ? 1350 : 1150)) {
      // large screens
      gridContainerWidth = Math.min(containerWidth, 1070);
      eachRowHeight = 168;
      // Calculate width for each column:
      // - 7 this is so that the scrollbar doesn't appear close to container
      eachColumnWidth = Math.floor(gridContainerWidth / columnsPerRow - 7);
      // Use 70% of viewport height, clamped between 500px and 800px
      gridContainerHeight = Math.min(Math.max(viewportHeight * 0.7, 500), 800);
    } else if (containerWidth >= 768) {
      // medium screens
      gridContainerWidth = 755;
      eachColumnWidth = Math.floor(gridContainerWidth / columnsPerRow - 9);
      // Use 75% of viewport height
      gridContainerHeight = Math.min(Math.max(viewportHeight * 0.75, 450), 700);
    } else {
      // small screens
      eachColumnWidth = containerWidth;
      gridContainerWidth = containerWidth;
      // Use 80% of viewport height
      gridContainerHeight = Math.min(Math.max(viewportHeight * 0.8, 400), 600);
    }

    const totalRows = Math.ceil(skeletonCount / columnsPerRow);

    return {
      columnsPerRow,
      eachColumnWidth,
      eachRowHeight,
      gridContainerHeight,
      gridContainerWidth,
      totalRows,
    };
  }, [skeletonCount, windowDimensions, isSidebarOpen]);

  const {
    columnsPerRow,
    eachColumnWidth,
    eachRowHeight,
    gridContainerHeight,
    gridContainerWidth,
    totalRows,
  } = getGridDimensions();

  const SkeletonGridCell = ({
    columnIndex,
    rowIndex,
  }: {
    columnIndex: number;
    rowIndex: number;
  }) => {
    const cardIndex = rowIndex * columnsPerRow + columnIndex;

    if (cardIndex >= skeletonCount) return null;

    const style = {
      position: "absolute" as const,
      left: columnIndex * eachColumnWidth,
      top: rowIndex * eachRowHeight,
      width: eachColumnWidth,
      height: eachRowHeight,
    };

    return (
      <div style={style} className="md:pl-4 md:pt-4 md:px-0 px-2">
        <CardItemSkeleton />
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center w-full mb-8 opacity-0 animate-[opacity_2s_ease-in_forwards] [animation-delay:300ms]">
      <div
        className={twMerge(
          "relative !overflow-x-hidden overflow-y-auto scrollbar-gutter pb-20",
          skeletonCount > 50 && "dark:dark-scrollbar light-scrollbar"
        )}
        style={{
          height: gridContainerHeight,
          width: gridContainerWidth,
        }}
      >
        {Array.from({ length: totalRows }).map((_, rowIndex) =>
          Array.from({ length: columnsPerRow }).map((_, columnIndex) => (
            <SkeletonGridCell
              key={`${rowIndex}-${columnIndex}`}
              rowIndex={rowIndex}
              columnIndex={columnIndex}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CardsSkeleton;

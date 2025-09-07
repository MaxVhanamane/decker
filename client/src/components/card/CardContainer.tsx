import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { CardContentType, ContentTypeForEdit } from "../../types/types";
import { CardContext } from "../../context/CardContext";
import { Descendant } from "slate";
import { FixedSizeGrid } from "react-window";
import GridCell from "./GridCell";
import { twMerge } from "tailwind-merge";
import useDeleteCard from "../../hooks/react-query/useDeleteCard";
import { BulbContext } from "../../context/BulbContext";
import { useStableParams } from "../../context/stableParamsContext";
import { SidebarContex } from "../../context/SidebarContext";
import useWindowDimension from "../../hooks/utility/useWindowDimension";
type ContentForFullScreen = CardContentType & {
  cardIndex: number | null;
};
type PropType = {
  cards: {
    note: Descendant[];
    cardId: string;
    createdAt: string;
  }[];

  handleEditCardButtonClick: (cardItem: ContentTypeForEdit) => void;
  handleShowFullScreen: (card: ContentForFullScreen) => void;
};
type CardDeletionParams = {
  deckId: string;
  cardInfo: CardContentType;
  deletionIndex: number;
};

const CardContainer = ({
  cards,
  handleEditCardButtonClick,
  handleShowFullScreen,
}: PropType) => {
  const gridRef = useRef<FixedSizeGrid>(null);
  const { chapterId } = useStableParams();
  const { undoCardCardId, setUndoCardId } = useContext(CardContext);
  const { mutate: deleteCard } = useDeleteCard();
  const { bulbRef } = useContext(BulbContext);
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
      // - 7 this is so that the scrollbar doen't appear close to container
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

    const totalRows = Math.ceil(cards.length / columnsPerRow);

    return {
      columnsPerRow,
      eachColumnWidth,
      eachRowHeight,
      gridContainerHeight,
      gridContainerWidth,
      totalRows,
    };
  }, [cards.length, windowDimensions, isSidebarOpen]);

  const items = useMemo(() => {
    return cards.map((card) => card?.cardId);
  }, [cards]);

  const {
    columnsPerRow,
    eachColumnWidth,
    eachRowHeight,
    gridContainerHeight,
    gridContainerWidth,
    totalRows,
  } = getGridDimensions();

  useEffect(() => {
    if (undoCardCardId) {
      const cardIndex = cards.findIndex(
        (card) => card.cardId === undoCardCardId
      );

      if (cardIndex !== -1) {
        const rowIndex = Math.floor(cardIndex / columnsPerRow);

        // Use React Window's scrollToItem method for precise scrolling
        if (gridRef.current) {
          gridRef.current.scrollToItem({
            rowIndex,
            columnIndex: cardIndex % columnsPerRow,
            align: "center", // This will center the item in view
          });
        }

        // Set bulb color immediately since we know the card will be visible
        bulbRef?.current?.setBulbColor("yellow");

        // Clear the highlighting after 4.5 seconds
        const timeout = setTimeout(() => {
          bulbRef?.current?.removeBulbColor("yellow");
          setUndoCardId(null);
        }, 4500);

        return () => clearTimeout(timeout);
      }
    }
  }, [undoCardCardId, cards, columnsPerRow, bulbRef, setUndoCardId]);

  const handleDeleteCard = ({ deckId, cardInfo }: CardDeletionParams) => {
    deleteCard({ deckId, cardInfo, chapterId });
  };

  const outerGridRef = useRef<HTMLDivElement>(null);

  const gridData = useMemo(
    () => ({
      cards,
      columnsPerRow,
      handleEditCardButtonClick,
      handleShowFullScreen,
      handleDeleteCard,
    }),
    [
      cards,
      columnsPerRow,
      handleEditCardButtonClick,
      handleShowFullScreen,
      handleDeleteCard,
    ]
  );

  return (
    <div className="flex items-center justify-center w-full mb-8 animate-opacity_page_transition ">
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <FixedSizeGrid
          columnCount={columnsPerRow}
          rowCount={totalRows}
          itemData={gridData}
          height={gridContainerHeight}
          width={gridContainerWidth}
          overscanRowCount={2}
          columnWidth={eachColumnWidth}
          rowHeight={eachRowHeight}
          className={twMerge(
            "!overflow-x-hidden overflow-y-auto scrollbar-gutter pb-20  ",
            cards.length > 50 && "dark:dark-scrollbar light-scrollbar"
          )}
          outerRef={outerGridRef}
          ref={gridRef}
        >
          {GridCell}
        </FixedSizeGrid>
      </SortableContext>
    </div>
  );
};

export default memo(CardContainer);

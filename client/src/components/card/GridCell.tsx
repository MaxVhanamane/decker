import { memo } from "react";
import type { CardContentType, ContentTypeForEdit } from "../../types/types";
import SortableCardItem from "./SortableCardItem";

type CardDeletionParams = {
  deckId: string;
  cardInfo: CardContentType;
  deletionIndex: number;
};

type ContentForFullScreen = CardContentType & {
  cardIndex: number | null;
};

type GridCellProps = {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    cards: any[];
    columnsPerRow: number;
    handleEditCardButtonClick: (cardItem: ContentTypeForEdit) => void;
    handleShowFullScreen: (card: ContentForFullScreen) => void;
    handleDeleteCard: (params: CardDeletionParams) => void;
  };
};

const GridCell = ({ columnIndex, rowIndex, style, data }: GridCellProps) => {
  const {
    cards,
    columnsPerRow,
    handleEditCardButtonClick,
    handleShowFullScreen,
    handleDeleteCard,
  } = data;
  const cardIndex = rowIndex * columnsPerRow + columnIndex;
  const card = cards[cardIndex];
  if (!card) return null;

  return (
    <div style={{ ...style }} className="md:pl-4 md:pt-4 md:px-0 px-2">
      <SortableCardItem
        card={card}
        index={cardIndex}
        handleEditCardButtonClick={handleEditCardButtonClick}
        handleShowFullScreen={handleShowFullScreen}
        handleDeleteCard={handleDeleteCard}
      />
    </div>
  );
};

export default memo(GridCell);

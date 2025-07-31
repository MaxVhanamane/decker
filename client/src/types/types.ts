import { Descendant } from "slate";

export type userData = {
  username: string,
  profile_picture: string,
}

export type DeckType = {
  title: string,
  pinned: boolean,
  createdAt: string,
  cardsCount: number,
  deckId: string
  isProcessing?: boolean,
}


export type UndoDeckType = {
  title: string;
  deckId: string;
  pinned: boolean;
  createdAt: string;
  cardsCount: number;
  index: number | null,
  indexOfDeletedDeckSearchResult?: number,
  searchParams?: {
    query: string;
    page: number;
  };
}


export type CardListType = {
  title: string,
  cards: CardContentType[]
}


//bulb
export type bulbColors = "red" | "yellow" | "lime" | "fuchsia" | "violet" | "cyan";

//cards

export type CardContentType = {
  note: Descendant[]; cardId: string, createdAt: string
}

export type ContentTypeForEdit = CardContentType & {
  cardIndex: number | null;
}

export type DeleteDeckPayload = {
  deckId: string;
  searchParams?: {
    query: string;
    page: number;
  };
}

export type UndoCardPayloadData = {
  deckId: string;
  content: CardContentType;
  index: number;
  searchParams?: {
    query: string;
    page: number;
    undoCardDetails: CardSearchResult;
    indexOfCardInSearchResult: number;
  };
};

export type GetCardsResponseType = {
  title: string;
  cards: CardContentType[];
  deckId: string;
};


export type CreateCardPayloadType = {
  deckId: string;
  content: {
    note: Descendant[];
    cardId: string;
  };
};

export type moveCardPayloadType = {
  currentIndex: number;
  newIndex: number;
  deckId: string;
};

// Toast
export type PositionValues = | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export type AutoHideDurationValues = | 1000
  | 2000
  | 3000
  | 4000
  | 5000
  | 6000
  | 7000
  | 8000
  | 9000
  | 10000

export type ToastHandlerType = {
  message: string | null,
  severity: "info" | "success" | "warning" | "error" | null,
  autoHideDuration?: AutoHideDurationValues,
  position?: PositionValues,
  buttonText?: string,
  buttonHandler?: (() => void) | null;
  animationStyle?: "slide" | "scale-up",
  theme?: "auto" | "colored"
  progressBar?: "show" | "hide",
};

export type ToastMessageType = {
  message: string;
  severity: "info" | "success" | "warning" | "error";
  autoHideDuration: AutoHideDurationValues;
  position: PositionValues;
  buttonText?: string;
  buttonHandler?: (() => void) | null;
  id: string;
  animationStyle?: "slide" | "scale-up";
  theme?: "auto" | "colored";
  progressBar: "show" | "hide";
};

export type CurrentDraggingCardType = {
  isDragging: boolean;
  isDraggingCardOverDeleteArea: boolean;
  card: { title: string; note: Descendant[], createdAt: string };
} | null;


export type CardType = {
  title: string;
  cards:
  | []
  | CardContentType[];
  deckId: string;
}
  | undefined


export type DeleteDeckResponseType = {
  undoToken: string,
  deletedDeckInfo: {
    title: string;
    deckId: string;
    pinned: boolean;
    createdAt: string;
    cardsCount: number;
    originalIndexOnServer: number;
  };
  success: boolean;
};

//Search result 
export type DeckSearchResult = {
  type: 'deck';
  deckId: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  cardsCount: number;
};

export type ChapterSearchResult = {
  type: 'chapter';
  deckId: string;
  deckTitle: string;
  chapterId: string;
  chapterTitle: string;
  createdAt: string;
};

export type DeckCardSearchResult = {
  type: 'deck-card';
  deckId: string;
  deckTitle: string;
  cardId: string;
  note: Descendant[];
  createdAt: string;
  cardIndex: number;
};

export type ChapterCardSearchResult = {
  type: 'chapter-card';
  deckId: string;
  deckTitle: string;
  chapterId: string;
  chapterTitle: string;
  cardId: string;
  note: Descendant[];
  createdAt: string;
  cardIndex: number;
};
export type CardSearchResult = DeckCardSearchResult | ChapterCardSearchResult;
export type SearchResult = DeckSearchResult | ChapterSearchResult | CardSearchResult;


export interface responseData {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SearchResponse {
  success: boolean;
  data: responseData;
}


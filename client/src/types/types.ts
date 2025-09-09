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
  cards: CardContentType[]
  maxOrder: number
}


//bulb
export type bulbColors = "red" | "yellow" | "lime" | "fuchsia" | "violet" | "cyan" | "green";

//cards

export type CardContentType = {
  note: Descendant[]; cardId: string, createdAt: string, order: number, chapterId?: string
}

export type ContentTypeForEdit = CardContentType
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
  searchParams?: {
    query: string;
    page: number;
    undoCardDetails: CardSearchResult;
    indexOfCardInSearchResult: number;
  };
};

export type GetCardsResponseType = {
  cards: CardContentType[];
  maxOrder: number
};
export type ChapterDetails = {
  deckId: string;
  chapterId: string;
  createdAt: string;
  chapterName: string
  cardsCount: number
  order: number
}
export type GetChaptersResponseType = {
  chapters: ChapterDetails[];
  maxOrder: number

};


export type CreateCardPayloadType = {
  deckId: string;
  content: {
    note: Descendant[];
    cardId: string;
  };
  maxOrder: number;
  chapterId?: string
};

export type moveCardPayloadType = {
  cardId: string;
  newOrder: number;
  fromIndex: number;
  toIndex: number;
  deckId: string;
  chapterId?: string,
  reindexNeeded: boolean
};
export type moveChapterPayloadType = {
  chapterId: string;
  newOrder: number;
  deckId: string;
  reindexNeeded: boolean
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
  cards:
  | []
  | CardContentType[];
  maxOrder: number
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
  order: number;
  note: Descendant[];
  createdAt: string;
};

export type ChapterCardSearchResult = {
  type: 'chapter-card';
  deckId: string;
  deckTitle: string;
  chapterId: string;
  chapterTitle: string;
  cardId: string;
  order: number;
  note: Descendant[];
  createdAt: string;
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


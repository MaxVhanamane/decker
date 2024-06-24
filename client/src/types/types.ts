
import { Dispatch } from 'react';
export type userData = {
  username: string,
  profile_picture: string,
  email: string,
}

export type AlertData = {
  severity: string,
  show: boolean,
  message: string,
  autoHideDuration: number
};
export type AlertType = {
  alert: AlertData
  setAlert: Dispatch<React.SetStateAction<AlertData>>
}

export type DeckType = {
  _id: string,
  title: string,
  pinned: boolean,
  isProcessing?: boolean
}

export type DeckAndCardType = {
  _id: string,
  title: string,
  cards: { title: string, note: string, cardId: string, _id: string }[],
  pinned: boolean,
}

export type DeckTypeWithIndex = {
  _id: string,
  title: string,
  pinned: boolean,
  index: number
  email: string,
  date: Date
  cards: { title: string, note: string, cardId: string, _id: string }[]
}

export type CardDataType = {
  title: string,
  cards: {
    title: string,
    note: string,
    cardId: string
    _id: string
  }[]
}



export type FetchErrorType = {
  message: string;
  response: {
    data: {
      message: string;
    };
    status: number;
  };
};

export type SearchResultCardsType = {
  deck_id: string;
  title: string;
  note: string;
  cardIndex: number;
  cardId: string;
  _id: string;
  deckTitle: string;
};

export type SearchResultDeckType = {
  deck_id: string;
  title: string;
  pinned: boolean;
  cards: {
    title: string;
    note: string;
    _id: string;
    cardId: string
  }[] | [];
};

//cards
export type ContentType = {
  title: string;
  note: string;
  _id: string;
  cardId: string;
};


export type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
}

export type CardsDataType = {
  _id: string;
  title: string;
  cards: { title: string; note: string; cardId: string; _id: string }[];
};

export type UndoCardPayloadData = {
  deck_id: string;
  content: {
    title: string;
    note: string;
    cardId: string;
    _id: string
  };
  index: number;
};

export type DeckTypeForSearch = {
  title: string;
  deck_id: string;
  cards:
  | []
  | {
    title: string;
    note: string;
    _id: string;
    cardId: string;
  }[];
};

export type GetCardsResponseType = {
  title: string;
  cards: { title: string; note: string; cardId: string; _id: string }[];
  _id: string;
};


export type CreateCardPayloadType = {
  deck_id: string;
  content: {
    title: string;
    note: string;
    cardId: string;
  };
};

export type moveCardPayloadDataType = {
  deleteIndex: number;
  moveIndex: number;
  deck_id: string;
};

export type DeleteCardPayloadType = {
  deck_id: string;
  index: number;
};

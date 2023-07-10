
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
    _id: string
  }[]
}

export type Data = {
  _id: string;
  title: string;
  cards: { title: string, note: string }[];
} & { message?: string }

export type AxiosErrorType = {
  message: string;
  response: {
    data: {
      message: string;
    };
    status: number;
  };
};

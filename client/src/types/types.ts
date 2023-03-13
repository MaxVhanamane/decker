
import { Dispatch } from 'react';
export type userData = {
  _id: string,
  username: string,
  profile_picture: string,
  email: string,
  __v: number
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
  cards: { title: string, note: string }[],
  pinned: boolean,
  email: string,
  date: Date,
}

export type DeckTypeWithIndex = {
  _id: string,
  title: string,
  cards: { title: string, note: string }[],
  pinned: boolean,
  email: string,
  date: Date,
  index: number
}

export type CardDataType = {
  title: string,
  cards: {
    title: string,
    note: string,
    _id: string
  }[]
}

export type Data={
  title:string;
  cards:{title:string,note:string}[];
}& {message?:string}

export type AxiosErrorType = {
  message: string;
  response: {
    data: {
      message: string;
    };
    status: number;
  };
};

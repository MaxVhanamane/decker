
import { Dispatch } from 'react';
export type userData={
    _id: string,
  username:string,
  profile_picture:string,
  email: string,
  __v:number
}

export type AlertData={
  severity: string,
  show: boolean,
  message: string
};
export type AlertType={
  alert:AlertData
  setAlert:Dispatch<React.SetStateAction<AlertData >>
}

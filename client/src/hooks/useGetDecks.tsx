import {useQuery} from "react-query"

import { request } from "../utils/axios-utils";

export type DeckTypes = {
    _id: string;
    title: string;
    cards:string[];
    pinned:boolean;
  };
  
 const getDecks = async ():Promise<DeckTypes[]>=>{
    const decks = await request.get(`/deck`);
    return decks.data ;
}

export default function useGetDecks(){

  return useQuery("decks",getDecks)

}

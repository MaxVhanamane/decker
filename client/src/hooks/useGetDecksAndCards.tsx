import {useQuery} from "react-query"
import { DeckAndCardType } from "../types/types";

import { request } from "../utils/axios-utils";

type DeckTypeValue=DeckAndCardType[] & {message?:string}
  
 const getDecksAndCards = async ():Promise<DeckTypeValue>=>{
    const decks = await request.get(`/decks-and-cards`);
    return decks.data ;
}

export default function useGetDecksAndCards(){

  return useQuery("decks-and-cards",getDecksAndCards,{
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 3, // Retry up to 3 times on network errors
  })

}

import {useQuery} from "react-query"
import { DeckType } from "../types/types";

import { request } from "../utils/axios-utils";

type DeckTypeValue=DeckType[] & {message?:string}
  
 const getDecks = async ():Promise<DeckTypeValue>=>{
    const decks = await request.get(`/deck`);
    return decks.data ;
}

export default function useGetDecks(){

  return useQuery("decks",getDecks,{
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 3, // Retry up to 3 times on network errors
  
  })

}

import {useQuery} from "react-query"
import { DeckType } from "../types/types";

import { request } from "../utils/axios-utils";

  
 const getDecks = async ():Promise<DeckType[]>=>{
    const decks = await request.get(`/deck`);
    return decks.data ;
}

export default function useGetDecks(){

  return useQuery("decks",getDecks)

}

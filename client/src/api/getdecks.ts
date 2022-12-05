import { request } from "../utils/axios-utils";

export type DeckTypes = {
    _id: string;
    title: string;
    cards:string[];
    pinned:boolean;
  };
export const getDecks = async ():Promise<DeckTypes[]>=>{
    const decks = await request.get("http://localhost:5000/deck");
    return decks.data ;
}

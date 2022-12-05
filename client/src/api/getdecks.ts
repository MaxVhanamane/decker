import { request } from "../utils/axios-utils";

export type DeckTypes = {
    _id: string;
    title: string;
    cards:string[];
    pinned:boolean;
  };
export const getDecks = async ():Promise<DeckTypes[]>=>{
    const decks = await request.get(`${import.meta.env.VITE_APP_API_URL}/deck`);
    return decks.data ;
}

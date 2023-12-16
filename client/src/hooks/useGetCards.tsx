import { request } from "../utils/fetch-utils";
import { useQuery } from "@tanstack/react-query";
import { Data } from "../types/types";
import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";

interface DeckType {
  cards: { title: string; note: string; cardId: string; _id: string }[];
  deck_id: string;
  pinned: boolean;
  title: string;
}

interface DeckResponse {
  title: string;
  cards: { title: string; note: string; cardId: string; _id: string }[];
}

type ErrorResponse = {
  message: string;
  status: number;
};

const getCards = async (
  _id: string,
  deck: DeckType | null
): Promise<Data | DeckResponse | null | ErrorResponse> => {
  //If the searchBar is open or there is a deck or search_index value available, it means that I have come to /cards/deck_id page from the searchBar. In this case, I will use the data that I have sent in the Link tag using the state. I will not make any network request. This way, I can achieve offline functionality.
  if (!deck) {
    try {
      const data = await request.get(`/cards/${_id}`);
      if (data?.message) {
        return { message: data?.message, status: data?.status };
      } else {
        return data?.data;
      }
    } catch (error) {
      return {
        message:
          "An unexpected error occurred while fetching card data. Please try again later.",
        status: 400,
      };
    }
  } else if (deck) {
    return { title: deck.title, cards: deck.cards };
  }

  return null;
};

const useGetCards = (deck_id: string, deck: DeckType | null) => {
  /*We will use a different query key when a search index is present because if we keep the same query key (e.g., ["cards", deck_id]) for every request, it will replace the old cached value with null if search index is present. So, when the user visits the /cards/1234 page, they will initially be served a null value, and then a network request is made to fetch the actual cards. During those 2-3 seconds when the value is null, the user will see a message saying 'Looks like you have not added any cards.' To avoid this, we will create a new query key when a search index is present. Additionally, we will not cache the response when a search index is present using enabled: !search_index because I am returning null, so there is no point in caching it. However, we will cache the response when the user opens the deck from the search results or from the home page because both have the same data, so there is no problem with caching*/
  const queryKey = ["cards", deck_id];

  return useQuery({
    queryKey: queryKey,
    queryFn: () => {
      return getCards(deck_id, deck);
    },

    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: 0, // no retry on network errorMessage
  });
};

export default useGetCards;

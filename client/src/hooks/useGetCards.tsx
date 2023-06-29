import { request } from "../utils/axios-utils";
import { useQuery } from "react-query";
import { AlertData, AxiosErrorType, Data } from "../types/types";
import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";
import { searchContext } from "../context/SearchContext";

interface DeckType {
  cards: { title: string; note: string; cardId: string; _id: string }[];
  deck_id: string;
  pinned: boolean;
  title: string;
}
interface DeckResponse {
  title: string;
  cards: { title: string; note: string; cardId: string; _id: string }[];
  message: null;
}
const getCards = async (
  _id: string,
  search_index: string | null,
  deck: DeckType | null,
  showSearchBar: boolean
): Promise<Data | DeckResponse | null> => {
  //If the searchBar is open or there is a deck or search_index value available, it means that I have come to /cards/deck_id page from the searchBar. In this case, I will use the data that I have sent in the Link tag using the state. I will not make any network request. This way, I can achieve offline functionality.
  if (!search_index && !deck && !showSearchBar) {
    try {
      const data = await request.get(`/cards/${_id}`);
      return data.data;
    } catch (error) {
      // network errors, such as a lack of internet connection/no internet connection, may not be recognized as traditional errors by the Axios library. if I don't add if statement like this it will run onSuccess instead of onError.
      if ((error as Error).message === "Network Error") {
        throw new Error("Network Error");
      }
      throw error;
    }
  } else if (deck) {
    return { title: deck.title, cards: deck.cards, message: null };
  }
  return null;
};

const useGetCards = (
  deck_id: string,
  search_index: string | null,
  deck: DeckType | null
) => {
  const { setAlert } = useContext(AlertContext);
  const { showSearchBar } = useContext(searchContext);

  return useQuery(
    ["cards", deck_id],
    () => {
      return getCards(deck_id, search_index, deck, showSearchBar);
    },
    {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: 0, // no retry on network errors

      onError: (error) => {
        const message =
          (error as Error).message === "Network Error"
            ? "No internet connection"
            : (error as Error).message;
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: (error as AxiosErrorType)?.response?.data.message || message,
          autoHideDuration: 7000,
        }));
      },
      onSettled: (Data, error) => {
        if (deck) {
          deck = null;
        }
        if (search_index) {
          search_index = null;
        }
      },
    }
  );
};

export default useGetCards;

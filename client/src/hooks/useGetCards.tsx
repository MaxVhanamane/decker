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
      if ((error as AxiosErrorType)?.response?.status === 500) {
        throw new Error("Internal server error");
      } else if ((error as Error).message === "Network Error") {
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
  /*We will use a different query key when a search index is present because if we keep the same query key (e.g., ["cards", deck_id]) for every request, it will replace the old cached value with null if search index is present. So, when the user visits the /cards/1234 page, they will initially be served a null value, and then a network request is made to fetch the actual cards. During those 2-3 seconds when the value is null, the user will see a message saying 'Looks like you have not added any cards.' To avoid this, we will create a new query key when a search index is present. Additionally, we will not cache the response when a search index is present using enabled: !search_index because I am returning null, so there is no point in caching it. However, we will cache the response when the user opens the deck from the search results or from the home page because both have the same data, so there is no problem with caching*/
  const queryKey = ["cards", deck_id];
  if (search_index) {
    queryKey.push(search_index);
  }
  return useQuery(
    queryKey,
    () => {
      return getCards(deck_id, search_index, deck, showSearchBar);
    },
    {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: 0, // no retry on network errorMessage
      // We will cache only when there is no search index present because when a search index is present, I am returning null. Therefore, there is no point in caching it.
      enabled: !search_index,
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
        //When a new card is added, it invalidates the query for /cards/deck_id. However, if you have navigated to the /cards/deck_id page using the search results, and there is a value for the deck in the getCards function, I prevent it from making a new network request. To ensure fresh data is displayed, I set the deck value to null. This is necessary because the previous value of deck is preserved when the user loads the /cards/deck_id page from the search results. By setting the deck value to null, the query is invalidated, allowing me to fetch the latest data. Without this, the card will be added, but the user will only see the outdated data.
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

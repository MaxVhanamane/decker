import { useMutation, useQueryClient } from "react-query";
import { request } from "./../utils/axios-utils";
import { AlertContext } from "../context/AlertContext";
import {
  AlertData,
  AxiosErrorType,
  DeckAndCardType,
  DeckType,
} from "../types/types";
import { useContext } from "react";
import { searchContext } from "../context/SearchContext";
type CardData = {
  deck_id: string;
  newTitle: string;
};

type PromiseData = {
  title: string;
  _id: string;
  cards: { title: string; note: string }[];
  pinned: boolean;
};

const editDeck = async (deckItem: CardData): Promise<PromiseData> => {
  try {
    const data = await request.put(`/deck/editdeck/${deckItem.deck_id}`, {
      title: deckItem.newTitle,
    });
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
};

const useEditDeck = () => {
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  const { showSearchBar } = useContext(searchContext);

  return useMutation(editDeck, {
    // Not doing any optimistic updates we will only show the data once it is added in the db.

    onMutate: async (deckItem) => {
      await queryClient.cancelQueries("decks");
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryData = queryClient.getQueryData<DeckType[]>("decks");
      queryClient.setQueryData<DeckType[] | undefined>(
        "decks",
        (oldQueryData) => {
          if (oldQueryData) {
            // find the deck using deck_id and update it
            const newDeck = oldQueryData.map((deck) => {
              if (deck._id === deckItem.deck_id) {
                return { ...deck, title: deckItem.newTitle };
              }
              return deck;
            });
            return [...newDeck];
          }
        }
      );

      //When a user performs a search, they will receive updated data. If I don't implement this, there is a possibility that if the user changes the deck name on the home page and then performs a search, they might see old deck name for a sec.Only after the network request completes, they will see the updated data.
      const previousQueryDataForSearch =
        queryClient.getQueryData<DeckAndCardType[]>("decks-and-cards");
      if (previousQueryDataForSearch) {
        await queryClient.cancelQueries("decks-and-cards");
        queryClient.setQueryData<DeckAndCardType[] | undefined>(
          "decks-and-cards",
          (oldQueryData) => {
            if (oldQueryData) {
              // find the deck using deck_id and update it
              const newDeck = oldQueryData.map((deck) => {
                if (deck._id === deckItem.deck_id) {
                  return { ...deck, title: deckItem.newTitle };
                }
                return deck;
              });
              return [...newDeck];
            }
          }
        );
      }

      // Return previous data so that if something goes wrong we can use this in onError method
      return { previousQueryData, previousQueryDataForSearch };
    },
    onError: (error, _title, context) => {
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
      queryClient.setQueryData("decks", context?.previousQueryData);
      queryClient.setQueryData(
        "decks-and-cards",
        context?.previousQueryDataForSearch
      );
    },

    onSettled: (serverData, error, data, context) => {
      queryClient.invalidateQueries("decks");
      // If the search bar is open, it means that the user performed this  operation from the search results.

      if (showSearchBar) {
        queryClient.invalidateQueries("decks-and-cards");
      }
    },
  });
};

export default useEditDeck;

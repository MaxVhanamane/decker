import { useMutation, useQueryClient } from "react-query";
import { request } from "./../utils/axios-utils";
import { AlertContext } from "../context/AlertContext";
import { AlertData, AxiosErrorType, DeckType } from "../types/types";
import { useContext } from "react";
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
    if ((error as Error).message === "Network Error") {
      throw new Error("Network Error");
    }
    throw error;
  }
};

const useEditDeck = () => {
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
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
      // Return previous data so that if something goes wrong we can use this in onError method
      return previousQueryData;
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
      queryClient.setQueryData("decks", context);
    },

    onSettled: (serverData, error, data, context) => {
      queryClient.invalidateQueries("decks");
    },
  });
};

export default useEditDeck;

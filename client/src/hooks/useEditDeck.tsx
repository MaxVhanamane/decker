import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../utils/fetch-utils";
import { DeckAndCardType, DeckType } from "../types/types";
import { useContext } from "react";
import { searchContext } from "../context/SearchContext";
import { CustomError } from "../utils/customError";
import { updateCache } from "../utils/updateCache";

type DeckData = {
  deck_id: string;
  newTitle: string;
};

type SuccessResponseType = {
  title: string;
  _id: string;
  cards: { title: string; note: string }[];
  pinned: boolean;
};

const editDeck = async (
  deckItem: DeckData
): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.put(`/deck/editdeck/${deckItem.deck_id}`, {
      title: deckItem.newTitle,
    });

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useEditDeck = () => {
  const queryClient = useQueryClient();
  const { showSearchBar } = useContext(searchContext);

  return useMutation({
    mutationFn: editDeck,
    // Not doing any optimistic updates we will only show the data once it is added in the db.

    onMutate: async (deckItem) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryData = queryClient.getQueryData<DeckType[]>(["decks"]);
      queryClient.setQueryData<DeckType[] | undefined>(
        ["decks"],
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
      const previousCardAndDeckQueryData = queryClient.getQueryData<
        DeckAndCardType[]
      >(["decks-and-cards"]);
      if (previousCardAndDeckQueryData) {
        await queryClient.cancelQueries({ queryKey: ["decks-and-cards"] });
        queryClient.setQueryData<DeckAndCardType[] | undefined>(
          ["decks-and-cards"],
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
      return { previousQueryData, previousCardAndDeckQueryData };
    },

    onError: (error, _title, context) => {
      queryClient.setQueryData(["decks"], context?.previousQueryData);
      queryClient.setQueryData(
        ["decks-and-cards"],
        context?.previousCardAndDeckQueryData
      );
    },

    onSuccess: (responseData, mutationData, context) => {
      updateCache("editDeck", "search-cache", "decks-and-cards", mutationData);
    },

    onSettled: (serverData, error, data, context) => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      // If the search bar is open, it means that the user performed this  operation from the search results.

      if (showSearchBar) {
        queryClient.invalidateQueries({ queryKey: ["decks-and-cards"] });
      }
    },
  });
};

export default useEditDeck;

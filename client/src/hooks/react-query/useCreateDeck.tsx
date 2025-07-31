import { request } from "../../utils/fetch-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeckType } from "../../types/types";
import { CustomError } from "../../utils/customError";
import { useContext } from "react";
import { DeckContext } from "../../context/DeckContext";
import { BulbContext } from "../../context/BulbContext";

const createDeck = async ({
  title,
  deckId,
}: {
  title: string;
  deckId: string;
}) => {
  try {
    const data = await request.post(`/deck`, { title, deckId });

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useCreateDeck = () => {
  const queryClient = useQueryClient();
  const { setNewlyAddedDeckId } = useContext(DeckContext);
  const { bulbRef } = useContext(BulbContext);
  // whatever we pass to useMutations mutate function that will be reaceived in the createDeck function and in onMutate and other properities of useMutation.
  return useMutation({
    mutationFn: createDeck,
    onMutate: async ({ title, deckId }: { title: string; deckId: string }) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });

      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryData: DeckType[] = queryClient.getQueryData([
        "decks",
      ])!;

      queryClient.setQueryData(
        ["decks"],
        (oldQueryData: DeckType[] | undefined) => {
          if (oldQueryData) {
            return [
              {
                title,
                deckId,
                pinned: false,
                isProcessing: true,
                createdAt: new Date().toDateString(),
                cardsCount: 0,
              },
              ...oldQueryData,
            ];
          }
        }
      );
      setNewlyAddedDeckId(deckId);

      // Return previous data so that if something goes wrong we can use this in onError method
      return { previousQueryData };
    },

    onSuccess: () => {
      const allDecks: DeckType[] | undefined = queryClient.getQueryData([
        "decks",
      ]);
      if (allDecks) {
        queryClient.setQueryData(
          ["decks"],
          (oldQueryData: DeckType[] | undefined) => {
            if (oldQueryData) {
              return oldQueryData.map((deck) =>
                deck.deckId === allDecks[0].deckId
                  ? { ...deck, isProcessing: false }
                  : deck
              );
            }
          }
        );
      }
    },

    onError: (error, _title, context) => {
      // I have returned the previous query data in onMutate function I can receive that data in context. I can use that data to
      // reverse what I have done in onMutate because onMutate runs before request goes to server there I have assumed that
      // Everthing will be fine on the server and I did optimistic updates in onMutate function. If some error occures I will
      // reverse that here using previousQuery dataW
      queryClient.setQueryData(["decks"], context?.previousQueryData);

      //We reset the bulb color and DeckId if deck creation fails.
      // Normally, this happens via a timeout inside the DeckItem component.
      // However, when creation fails, the DeckItem gets unmounted immediately. This means the deck that was animating disappears right away, but the bulb still retains the color set during creation. Since the color reset is managed by a timeout in the context (not tied to the component), it still runs—even after the component unmounts.
      // As a result, the bulb resets with a slight delay, causing a visual desynchronization between the deck disappearing and the bulb animation ending.
      // To keep the animations in sync, we reset the bulb color and DeckId here instead.
      bulbRef.current?.removeBulbColor("cyan");
      setNewlyAddedDeckId(null);
    },

    // onSettled is called in the end it doesnt matter if the mutation is successful or failed it will be called everytime. After doing above operations we will refetch the data. so that our data and the data in the db will be in sync.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export default useCreateDeck;

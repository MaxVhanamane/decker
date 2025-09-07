import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../utils/fetch-utils";
import type { DeckType, SearchResponse } from "../../types/types";
import { CustomError } from "../../utils/customError";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useContext } from "react";

type PayloadType = {
  deckId: string;
  newTitle: string;
  searchParams?: {
    query: string;
    page: number;
  };
};

type SuccessResponseType = {
  success: boolean;
};

const editDeck = async (
  payload: PayloadType
): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.put(`/deck/editdeck/${payload.deckId}`, {
      title: payload.newTitle,
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
  const { showToast } = useContext(ShowToastContext);

  return useMutation({
    mutationFn: editDeck,

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      if (payload.searchParams) {
        await queryClient.cancelQueries({
          queryKey: [
            "searchResult",
            payload.searchParams.query,
            payload.searchParams.page,
          ],
        });
      }
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryData = queryClient.getQueryData<DeckType[]>(["decks"]);
      queryClient.setQueryData<DeckType[] | undefined>(
        ["decks"],
        (oldQueryData) => {
          if (oldQueryData) {
            // find the deck using deckId and update it
            const newDeck = oldQueryData.map((deck) => {
              if (deck.deckId === payload.deckId) {
                return { ...deck, title: payload.newTitle };
              }
              return deck;
            });
            return [...newDeck];
          }
        }
      );

      //update search result
      let previousSearchResult: SearchResponse | undefined;
      if (payload.searchParams) {
        previousSearchResult = queryClient.getQueryData<SearchResponse>([
          "searchResult",
          payload.searchParams.query,
          payload.searchParams.page,
        ]);
        if (previousSearchResult) {
          queryClient.setQueryData<SearchResponse>(
            [
              "searchResult",
              payload.searchParams.query,
              payload.searchParams.page,
            ],
            (oldQueryData) => {
              if (oldQueryData) {
                const newResults = oldQueryData?.data?.results?.map((deck) => {
                  if (deck.type === "deck" && deck.deckId === payload.deckId) {
                    return { ...deck, title: payload.newTitle };
                  }
                  return deck;
                });
                return {
                  ...oldQueryData,
                  data: { ...oldQueryData.data, results: newResults },
                };
              }
            }
          );
        }
      }

      // Return previous data so that if something goes wrong we can use this in onError method
      return { previousQueryData, previousSearchResult };
    },

    onError: (error, payload, context) => {
      queryClient.setQueryData(["decks"], context?.previousQueryData);
      if (payload?.searchParams) {
        queryClient.setQueryData(
          [
            "searchResult",
            payload.searchParams.query,
            payload.searchParams.page,
          ],
          context?.previousSearchResult
        );
      }
      showToast({
        message:
          error?.message ||
          "Failed to save changes to the deck title. Please try again.",
        severity: "error",
        autoHideDuration: 3000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export default useEditDeck;

import { request } from "../../utils/fetch-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { DeckType, SearchResponse } from "../../types/types";
import { CustomError } from "../../utils/customError";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useContext } from "react";

type PayloadType = {
  deckId: string;
  pinned: boolean;
  newOrder: string;
  searchParams?: {
    query: string;
    page: number;
  };
};

type SuccessResponseType = {
  success: boolean;
};

export const pinDeck = async (
  inputData: PayloadType
): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.patch(`/deck/togglepin/${inputData.deckId}`, {
      pinned: inputData.pinned,
      newOrder: inputData.newOrder,
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

const usePinDeck = () => {
  const queryClient = useQueryClient();
  const { showToast } = useContext(ShowToastContext);

  return useMutation({
    mutationFn: pinDeck,
    onMutate: async (payload: PayloadType) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      if (payload.searchParams) {
        await queryClient.cancelQueries({
          queryKey: [
            "searchResult",
            payload.searchParams.query,
            payload?.searchParams.page,
          ],
        });
      }
      const previousQueryData = queryClient.getQueryData<DeckType>(["decks"]);
      // Make a deep copy because if an error occurs, we are returning the previousQueryData. If I directly work on it, I won't be able to reverse the changes made in case of an error.
      if (previousQueryData) {
        const CopiedPreviousQueryData: DeckType = JSON.parse(
          JSON.stringify(previousQueryData)
        );

        let finalUpdatedDecks: DeckType;
        if (payload.pinned) {
          const decks = CopiedPreviousQueryData.decks
            .map((deck) => {
              if (deck.deckId === payload.deckId) {
                deck.order = payload.newOrder;
                deck.pinned = payload.pinned;
                return deck;
              } else {
                return deck;
              }
            })
            .sort((a, b) => {
              // descending order: higher order comes first
              if (a.order > b.order) return -1;
              if (a.order < b.order) return 1;
              return 0;
            });
          finalUpdatedDecks = { decks };
        } else {
          const decks = CopiedPreviousQueryData.decks
            .map((deck) => {
              if (deck.deckId === payload.deckId) {
                deck.order = payload.newOrder;
                deck.pinned = payload.pinned;
                return deck;
              } else {
                return deck;
              }
            })
            .sort((a, b) => {
              // descending order: higher order comes first
              if (a.order > b.order) return -1;
              if (a.order < b.order) return 1;
              return 0;
            });
          finalUpdatedDecks = { decks };
        }

        queryClient.setQueryData<DeckType | undefined>(["decks"], () => {
          return finalUpdatedDecks;
        });
      }

      // Update search result
      let previousSearchResult: SearchResponse | undefined;
      if (payload.searchParams) {
        previousSearchResult = queryClient.getQueryData([
          "searchResult",
          payload.searchParams.query,
          payload?.searchParams.page,
        ]);

        if (previousSearchResult) {
          const copiedPreviousSearchResult: SearchResponse = JSON.parse(
            JSON.stringify(previousSearchResult)
          );

          const updatedData = copiedPreviousSearchResult.data.results.map(
            (obj) => {
              if (obj.type === "deck" && obj.deckId === payload.deckId) {
                obj.pinned = payload.pinned;
                obj.order = payload.newOrder;
                return obj;
              } else {
                return obj;
              }
            }
          );

          queryClient.setQueryData<SearchResponse | undefined>(
            [
              "searchResult",
              payload.searchParams.query,
              payload?.searchParams.page,
            ],
            () => {
              return {
                ...copiedPreviousSearchResult,
                data: {
                  ...copiedPreviousSearchResult.data,
                  results: updatedData,
                },
              };
            }
          );
        }
      }

      return { previousQueryData, previousSearchResult };
    },

    onError: (error, payload, context) => {
      queryClient.setQueryData(["decks"], context?.previousQueryData);

      showToast({
        message:
          "We couldn’t pin the deck due to a network or system issue. Please try again shortly.",
        severity: "error",
        position: "top-center",
        theme: "auto",
      });
      if (payload.searchParams) {
        queryClient.setQueryData(
          [
            "searchResult",
            payload.searchParams.query,
            payload?.searchParams.page,
          ],
          context?.previousSearchResult
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export default usePinDeck;

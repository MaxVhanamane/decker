import { request } from "../../utils/fetch-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeckType, UndoDeckType, SearchResponse } from "../../types/types";
import { CustomError } from "../../utils/customError";

type SuccessResponseType = {
  success: boolean;
};

const undoDeck = async (
  undoDeck: UndoDeckType
): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.put("/deck/undodeck", {
      deckId: undoDeck.deckId,
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

const useUndoDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: undoDeck,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryData: DeckType[] = queryClient.getQueryData([
        "decks",
      ])!;

      if (payload.index !== null) {
        const index = payload.index;
        queryClient.setQueryData(["decks"], () => {
          const newArray = [...previousQueryData];
          newArray.splice(index, 0, {
            deckId: payload.deckId,
            title: payload.title,
            pinned: payload.pinned,
            createdAt: payload.createdAt,
            cardsCount: payload.cardsCount,
          });
          return newArray;
        });
      }

      let previousSearchResult: SearchResponse | undefined;
      if (
        payload.searchParams &&
        payload.indexOfDeletedDeckSearchResult !== undefined
      ) {
        const queryKey = [
          "searchResult",
          payload.searchParams.query,
          payload.searchParams.page,
        ];
        await queryClient.cancelQueries({
          queryKey,
        });

        const previousSearchResult =
          queryClient.getQueryData<SearchResponse>(queryKey);

        if (previousSearchResult) {
          const newArray = [...previousSearchResult.data.results];
          newArray.splice(payload.indexOfDeletedDeckSearchResult, 0, {
            type: "deck",
            deckId: payload.deckId,
            title: payload.title,
            pinned: payload.pinned,
            createdAt: payload.createdAt,
            cardsCount: payload.cardsCount,
          });

          queryClient.setQueryData(queryKey, {
            ...previousSearchResult,
            data: {
              ...previousSearchResult.data,
              results: newArray,
            },
          });
        }
      }

      // Return previous data so that if something goes wrong we can use this in onError method
      // you can pass it in object or you can pass it directly like I did above in create deck
      return { previousQueryData, previousSearchResult };
    },

    onError: (_error, payload, context) => {
      // I have returned the previous query data in onMutate function I can receive that data in context. I can use that data to
      // reverse what I have done in onMutate because onMutate runs before request goes to server there I have assumed that
      // Everthing will be fine on the server and I did optimistic updates in onMutate function. If some error occures I will
      // reverse that here using previousQuery data
      queryClient.setQueryData(["decks"], context?.previousQueryData);
      if (payload?.searchParams) {
        queryClient.setQueryData(
          [
            "searchResult",
            payload?.searchParams.query,
            payload?.searchParams.page,
          ],
          context?.previousSearchResult
        );
      }
    },

    // onSettled is called in the end it doesnt matter if the mutation is successful or failed it will be called everytime. After doing above operations we will refetch the data. so that our data and the data in the db will be in sync.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export default useUndoDeck;

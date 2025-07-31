import { request } from "../../utils/fetch-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { DeckSearchResult, SearchResponse } from "../../types/types";
import { CustomError } from "../../utils/customError";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useContext } from "react";

type PayloadType = {
  deckId: string;
  pinned: boolean;
  searchParams?: {
    query: string;
    page: number;
  };
};

type DeckType = {
  deckId: string;
  title: string;
  cards: string[];
  pinned: boolean;
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
      const previousQueryData = queryClient.getQueryData<DeckType[]>(["decks"]);
      // Make a deep copy because if an error occurs, we are returning the previousQueryData. If I directly work on it, I won't be able to reverse the changes made in case of an error.
      if (previousQueryData) {
        const CopiedPreviousQueryData: DeckType[] = JSON.parse(
          JSON.stringify(previousQueryData)
        );

        // all this code is to show pinned and unpinned items in the beginning
        // To store index of an item that we want to pin or unpin
        let indexValue: number;
        // first get the item which we want to pin or unpin
        const deckToBeChanged = CopiedPreviousQueryData!.find((obj, index) => {
          if (obj.deckId === payload.deckId) {
            indexValue = index;
            return obj;
          }
        });

        // once we get the item then we will change the pinned property
        deckToBeChanged!.pinned = payload.pinned;
        // then we will remove the item that we want pin or unpin
        CopiedPreviousQueryData!.splice(indexValue!, 1);
        // then we will add the item in the beginning of an array using unshift
        CopiedPreviousQueryData!.unshift(deckToBeChanged!);

        queryClient.setQueryData<DeckType[] | undefined>(["decks"], () => {
          return CopiedPreviousQueryData;
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

          // all this code is to show pinned and unpinned items in the beginning
          // To store index of an item that we want to pin or unpin
          let indexValue: number | undefined;
          // first get the item which we want to pin or unpin
          const deckToBeChanged = copiedPreviousSearchResult.data.results.find(
            (obj, index) => {
              if (obj.type === "deck" && obj.deckId === payload.deckId) {
                indexValue = index;
                return obj;
              }
            }
          ) as DeckSearchResult | undefined;

          // once we get the item then we will change the pinned property
          if (deckToBeChanged && indexValue !== undefined) {
            deckToBeChanged.pinned = payload.pinned;
            // then we will remove the item that we want pin or unpin
            copiedPreviousSearchResult.data.results.splice(indexValue, 1);
            // then we will add the item in the beginning of an array using unshift
            copiedPreviousSearchResult.data.results.unshift(deckToBeChanged);
            queryClient.setQueryData<SearchResponse | undefined>(
              [
                "searchResult",
                payload.searchParams.query,
                payload?.searchParams.page,
              ],
              () => {
                return copiedPreviousSearchResult;
              }
            );
          }
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

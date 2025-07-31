import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../utils/fetch-utils";
import { CustomError } from "../../utils/customError";
import type {
  CardListType,
  SearchResponse,
  UndoCardPayloadData,
} from "../../types/types";
import { useContext } from "react";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { CardContext } from "../../context/CardContext";

type SuccessResponseType = {
  success: boolean;
};

const undoCard = async (
  undoCardInfo: UndoCardPayloadData
): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.put("/card/undocard", undoCardInfo);

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useUndoCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useContext(ShowToastContext);
  const { setUndoCardId } = useContext(CardContext);

  return useMutation({
    mutationFn: undoCard,
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deckId],
      });

      // if we have data.searchPaylod it means delete request came from search result
      if (data.searchParams) {
        await queryClient.cancelQueries({
          queryKey: [
            "searchResult",
            data.searchParams.query,
            data?.searchParams.page,
          ],
        });
      }

      const previousQueryData: CardListType[] | undefined =
        queryClient.getQueryData(["cards", data.deckId]);

      queryClient.setQueryData<CardListType | undefined>(
        ["cards", data.deckId],
        (oldQueryData) => {
          if (oldQueryData) {
            const newArray = [...oldQueryData.cards];
            newArray.splice(data.index, 0, {
              ...data.content,
            });
            return { ...oldQueryData, cards: newArray };
          }
        }
      );
      setUndoCardId(data.content.cardId);
      // update search result
      let previousSearchResult: SearchResponse | undefined;
      if (data.searchParams) {
        previousSearchResult = queryClient.getQueryData([
          "searchResult",
          data.searchParams.query,
          data?.searchParams.page,
        ]);
        if (previousSearchResult) {
          queryClient.setQueryData<SearchResponse>(
            ["searchResult", data.searchParams.query, data?.searchParams.page],
            (result) => {
              if (!result || !data?.searchParams) return;

              const deepCopiedResult: SearchResponse = JSON.parse(
                JSON.stringify(result)
              );

              deepCopiedResult?.data?.results.splice(
                data?.searchParams?.indexOfCardInSearchResult,
                0,
                data?.searchParams?.undoCardDetails
              );

              return deepCopiedResult;
            }
          );
        }
      }

      return { previousQueryData, previousSearchResult };
    },

    onError: (error, dataThatWePassed, context) => {
      showToast({
        message:
          "We're sorry, but we couldn't undo your card due to a technical issue. Your card may not be restored. We apologize for any inconvenience.",
        severity: "error",
        autoHideDuration: 7000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      queryClient.setQueryData(
        ["cards", dataThatWePassed.deckId],
        context?.previousQueryData
      );
      if (dataThatWePassed?.searchParams && context?.previousSearchResult) {
        queryClient.setQueryData(
          [
            "searchResult",
            dataThatWePassed.searchParams?.query,
            dataThatWePassed?.searchParams?.page,
          ],
          context?.previousSearchResult
        );
      }
    },
    onSettled: (_dataReturnedByTheServer, _error, dataThatWePassed) => {
      queryClient.invalidateQueries({
        queryKey: ["cards", dataThatWePassed.deckId],
      });
    },
  });
};

export default useUndoCard;

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
  undoCardInfo: UndoCardPayloadData,
): Promise<SuccessResponseType | CustomError> => {
  const {
    content: { chapterId, ...rest },
  } = undoCardInfo;
  const undoCardDetails = {
    deckId: undoCardInfo.deckId,
    ...rest,
  };
  const serverData = chapterId
    ? { ...undoCardDetails, chapterId }
    : undoCardDetails;
  try {
    const data = await request.put("/api/v1/cards/undocard", serverData);

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
      if (!data?.content?.chapterId) {
        const queryKey = ["cards", data.deckId];
        await queryClient.cancelQueries({
          queryKey,
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
          queryClient.getQueryData(queryKey);

        queryClient.setQueryData<CardListType | undefined>(
          queryKey,
          (oldQueryData) => {
            if (oldQueryData) {
              const newArray = [...oldQueryData.cards, data.content].sort(
                (a, b) => b.order - a.order,
              );

              return { ...oldQueryData, cards: newArray };
            }
          },
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
              [
                "searchResult",
                data.searchParams.query,
                data?.searchParams.page,
              ],
              (result) => {
                if (!result || !data?.searchParams) return;

                const deepCopiedResult: SearchResponse = JSON.parse(
                  JSON.stringify(result),
                );

                deepCopiedResult?.data?.results.splice(
                  data?.searchParams?.indexOfCardInSearchResult,
                  0,
                  data?.searchParams?.undoCardDetails,
                );

                return deepCopiedResult;
              },
            );
          }
        }

        return { previousQueryData, previousSearchResult };
      } else {
        const queryKey = [
          "chapter-cards",
          data.deckId,
          data.content?.chapterId,
        ];
        await queryClient.cancelQueries({
          queryKey,
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
          queryClient.getQueryData(queryKey);

        queryClient.setQueryData<CardListType | undefined>(
          queryKey,
          (oldQueryData) => {
            if (oldQueryData) {
              const newArray = [...oldQueryData.cards, data.content].sort(
                (a, b) => b.order - a.order,
              );

              return { ...oldQueryData, cards: newArray };
            }
          },
        );
        setUndoCardId(data.content.cardId);

        return { previousQueryData };
      }
    },

    onError: (error, dataThatWePassed, context) => {
      const queryKey = dataThatWePassed.content?.chapterId
        ? [
            "chapter-cards",
            dataThatWePassed.deckId,
            dataThatWePassed.content?.chapterId,
          ]
        : ["cards", dataThatWePassed.deckId];
      showToast({
        message:
          "We're sorry, but we couldn't undo your card due to a technical issue. Your card may not be restored. We apologize for any inconvenience.",
        severity: "error",
        autoHideDuration: 7000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      queryClient.setQueryData(queryKey, context?.previousQueryData);

      if (dataThatWePassed?.searchParams && context?.previousSearchResult) {
        queryClient.setQueryData(
          [
            "searchResult",
            dataThatWePassed.searchParams?.query,
            dataThatWePassed?.searchParams?.page,
          ],
          context?.previousSearchResult,
        );
      }
    },
    onSettled: (_dataReturnedByTheServer, _error, dataThatWePassed) => {
      const queryKey = dataThatWePassed.content?.chapterId
        ? [
            "chapter-cards",
            dataThatWePassed.deckId,
            dataThatWePassed.content?.chapterId,
          ]
        : ["cards", dataThatWePassed.deckId];
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
};

export default useUndoCard;

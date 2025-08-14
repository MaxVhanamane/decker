import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../utils/fetch-utils";
import type { CardListType, SearchResponse } from "../../types/types";
import { CustomError } from "../../utils/customError";
import { Descendant } from "slate";

type editCardPayloadType = {
  deckId: string;
  newContent: {
    note: Descendant[];
  };
  cardId: string;
  searchParams?: {
    query: string;
    page: number;
    cardId: string;
  };
};

type SuccessResponseType = {
  success: boolean;
};

const editCard = async (
  cardData: editCardPayloadType
): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.patch(`/card/${cardData.deckId}`, {
      cardId: cardData.cardId,
      newContent: {
        note: cardData.newContent.note,
      },
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

const useEditCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editCard,
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deckId],
      });

      if (data.searchParams) {
        await queryClient.cancelQueries({
          queryKey: [
            "searchResult",
            data.searchParams.query,
            data?.searchParams.page,
          ],
        });
      }

      const previousCardQueryData: CardListType[] | undefined =
        queryClient.getQueryData(["cards", data.deckId]);
      queryClient.setQueryData<CardListType | undefined>(
        ["cards", data.deckId],
        (oldQueryData) => {
          if (oldQueryData) {
            const newArray = [...oldQueryData.cards];
            const updatedCardData = newArray.map((card) => {
              if (card.cardId === data.cardId) {
                return {
                  ...card,
                  note: data?.newContent.note,
                };
              } else {
                return card;
              }
            });

            return { ...oldQueryData, cards: updatedCardData };
          }
        }
      );

      let previousSearchResult: SearchResponse | undefined;
      if (data.searchParams) {
        previousSearchResult = queryClient.getQueryData([
          "searchResult",
          data.searchParams.query,
          data?.searchParams.page,
        ]);
        queryClient.setQueryData<SearchResponse>(
          ["searchResult", data.searchParams.query, data?.searchParams.page],
          (oldQueryData) => {
            if (oldQueryData) {
              const deepCopiedResult: SearchResponse = JSON.parse(
                JSON.stringify(oldQueryData)
              );
              deepCopiedResult.data.results =
                deepCopiedResult.data?.results?.map((obj) => {
                  if (
                    obj.type === "deck-card" &&
                    obj.cardId === data?.searchParams?.cardId &&
                    obj.deckId === data.deckId
                  ) {
                    return {
                      ...obj,
                      note: data?.newContent?.note,
                    };
                  } else {
                    return obj;
                  }
                });
              return deepCopiedResult;
            }
          }
        );
      }

      // Return previous data so that if something goes wrong we can use this in onError method
      return { previousCardQueryData, previousSearchResult };
    },

    onError: (_error, data, context) => {
      queryClient.setQueryData(
        ["cards", data.deckId],
        context?.previousCardQueryData
      );
      if (data?.searchParams) {
        queryClient.setQueryData(
          ["searchResult", data.searchParams.query, data?.searchParams.page],
          context?.previousSearchResult
        );
      }
    },

    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, data) => {
      queryClient.invalidateQueries({
        queryKey: ["cards", data.deckId],
      });
    },
  });
};

export default useEditCard;

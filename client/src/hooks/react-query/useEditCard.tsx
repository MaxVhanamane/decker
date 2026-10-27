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
  chapterId?: string;
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
  cardData: editCardPayloadType,
): Promise<SuccessResponseType | CustomError> => {
  try {
    const url = cardData?.chapterId
      ? `/api/v1/cards/${cardData.deckId}/${cardData?.chapterId}`
      : `/api/v1/cards/${cardData.deckId}`;
    const data = await request.patch(url, {
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
      if (!data?.chapterId) {
        const queryKey = ["cards", data.deckId];
        await queryClient.cancelQueries({
          queryKey,
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
          queryClient.getQueryData(queryKey);
        queryClient.setQueryData<CardListType | undefined>(
          queryKey,
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
          },
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
                  JSON.stringify(oldQueryData),
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
            },
          );
        }

        // Return previous data so that if something goes wrong we can use this in onError method
        return { previousCardQueryData, previousSearchResult };
      } else {
        const queryKey = ["chapter-cards", data.deckId, data?.chapterId];
        await queryClient.cancelQueries({
          queryKey,
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
          queryClient.getQueryData(queryKey);
        queryClient.setQueryData<CardListType | undefined>(
          queryKey,
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
          },
        );
        return { previousCardQueryData };
      }
    },

    onError: (_error, data, context) => {
      const queryKey = data?.chapterId
        ? ["chapter-cards", data.deckId, data.chapterId]
        : ["cards", data.deckId];
      queryClient.setQueryData(queryKey, context?.previousCardQueryData);
      if (data?.searchParams) {
        queryClient.setQueryData(
          ["searchResult", data.searchParams.query, data?.searchParams.page],
          context?.previousSearchResult,
        );
      }
    },

    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, data) => {
      const queryKey = data?.chapterId
        ? ["chapter-cards", data.deckId, data.chapterId]
        : ["cards", data.deckId];
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
};

export default useEditCard;

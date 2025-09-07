import { request } from "../../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { CardListType, CreateCardPayloadType } from "../../types/types";
import { CustomError } from "../../utils/customError";

const createCard = async (payload: CreateCardPayloadType) => {
  try {
    const serverData = payload.chapterId
      ? {
          content: payload.content,
          maxOrder: payload.maxOrder,
          chapterId: payload.chapterId,
        }
      : {
          content: payload.content,
          maxOrder: payload.maxOrder,
        };
    const data = await request.post(`/card/${payload.deckId}`, serverData);

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useCreateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCard,
    onMutate: async (data: CreateCardPayloadType) => {
      if (!data?.chapterId) {
        const queryKey = ["cards", data.deckId];
        await queryClient.cancelQueries({
          queryKey,
        });

        const previousCardData: CardListType[] =
          queryClient.getQueryData(queryKey)!;

        queryClient.setQueryData<CardListType | undefined>(
          queryKey,
          (oldCardData) => {
            if (oldCardData) {
              // creating a new array using spread operator if I directly assign newArray=oldCardData.cards like this It will reference the same array so If I modify here It will change data in original array which is not good because I am returning previousCardData so that I can reverse optimistic updates in onError function If some error occures. and there I want old array as it is.
              const newArray = [...oldCardData.cards];

              newArray.unshift({
                ...data.content,
                createdAt: new Date().toDateString(),
                order: data.maxOrder + 10,
              });
              return { ...oldCardData, cards: newArray };
            }
          }
        );

        return { previousCardData };
      } else {
        const queryKey = ["chapter-cards", data.deckId, data.chapterId];
        await queryClient.cancelQueries({
          queryKey,
        });

        const previousCardData: CardListType[] =
          queryClient.getQueryData(queryKey)!;

        queryClient.setQueryData<CardListType | undefined>(
          queryKey,
          (oldCardData) => {
            if (oldCardData) {
              // creating a new array using spread operator if I directly assign newArray=oldCardData.cards like this It will reference the same array so If I modify here It will change data in original array which is not good because I am returning previousCardData so that I can reverse optimistic updates in onError function If some error occures. and there I want old array as it is.
              const newArray = [...oldCardData.cards];

              newArray.unshift({
                ...data.content,
                createdAt: new Date().toDateString(),
                order: data.maxOrder + 10,
                chapterId: data.chapterId,
              });
              return {
                ...oldCardData,
                cards: newArray,
                maxOrder: data.maxOrder + 10,
              };
            }
          }
        );

        return { previousCardData };
      }
    },

    onError: (_error, data: CreateCardPayloadType, context) => {
      const queryKey = data?.chapterId
        ? ["chapter-cards", data.deckId, data.chapterId]
        : ["cards", data.deckId];
      queryClient.setQueryData(queryKey, context?.previousCardData);
    },

    onSettled: (_dataReturnedByTheServer, _error, mutationData) => {
      const queryKey = mutationData?.chapterId
        ? ["chapter-cards", mutationData.deckId, mutationData.chapterId]
        : ["cards", mutationData.deckId];
      queryClient.invalidateQueries({
        queryKey,
      });
    },
    retry: false,
  });
};

export default useCreateCard;

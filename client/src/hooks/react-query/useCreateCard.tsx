import { request } from "../../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { CardListType, CreateCardPayloadType } from "../../types/types";
import { CustomError } from "../../utils/customError";

const createCard = async (payload: CreateCardPayloadType) => {
  try {
    const data = await request.post(`/card/${payload.deckId}`, {
      content: payload.content,
      maxOrder: payload.maxOrder,
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

const useCreateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCard,
    onMutate: async (data: CreateCardPayloadType) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deckId],
      });

      const previousCardData: CardListType[] = queryClient.getQueryData([
        "cards",
        data.deckId,
      ])!;

      queryClient.setQueryData<CardListType | undefined>(
        ["cards", data.deckId],
        (oldCardData) => {
          if (oldCardData) {
            // creating a new array using spread operator if I directly assign newArray=oldCardData.cards like this It will reference the same array so If I modify here It will change data in original array which is not good because I am returning previousCardData so that I can reverse optimistic updates in onError function If some error occures. and there I want old array as it is.
            const newArray = [...oldCardData.cards];

            newArray.unshift({
              ...data.content,
              createdAt: new Date().toDateString(),
              order: data.maxOrder,
            });
            return { ...oldCardData, cards: newArray };
          }
        }
      );

      return { previousCardData };
    },

    onError: (_error, data: CreateCardPayloadType, context) => {
      queryClient.setQueryData(
        ["cards", data.deckId],
        context?.previousCardData
      );
    },

    onSettled: (_dataReturnedByTheServer, _error, mutationData) => {
      queryClient.invalidateQueries({
        queryKey: ["cards", mutationData.deckId],
      });
    },
    retry: false,
  });
};

export default useCreateCard;

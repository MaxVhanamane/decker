import { request } from "../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { CardDataType, DeckAndCardType } from "../types/types";
import { CustomError } from "../utils/customError";
import { updateCache } from "../utils/updateCache";

type DeleteCardPayloadType = {
  deck_id: string;
  index: number;
};

type SuccessResponseType = {
  success: boolean;
};

const deleteCard = async (
  payLoad: DeleteCardPayloadType
): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.delete(
      `/card/${payLoad.deck_id}/${payLoad.index}`
    );

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useDeleteCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCard,
    onMutate: async (data: DeleteCardPayloadType) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deck_id],
      });
      await queryClient.cancelQueries({
        queryKey: ["decks-and-cards"],
      });
      const previousCardQueryData: CardDataType[] | undefined =
        queryClient.getQueryData(["cards", data.deck_id]);

      queryClient.setQueryData<CardDataType | undefined>(
        ["cards", data.deck_id],
        (oldQueryData) => {
          if (oldQueryData) {
            const newArray = [...oldQueryData?.cards];
            newArray.splice(data.index, 1);
            return { ...oldQueryData, cards: newArray };
          }
        }
      );
      // update decks-and-cards which is used for searching
      const previousCardAndDeckQueryData: DeckAndCardType[] | undefined =
        queryClient.getQueryData(["decks-and-cards"]);

      queryClient.setQueryData<DeckAndCardType[]>(
        ["decks-and-cards"],
        (oldQueryData) => {
          if (oldQueryData) {
            const deepCopiedDecks: DeckAndCardType[] = JSON.parse(
              JSON.stringify(oldQueryData)
            );
            const modifiedData = deepCopiedDecks.map((obj) => {
              if (obj._id === data.deck_id) {
                const updatedCards = [...obj.cards]; // Create a new reference for obj.cards
                updatedCards.splice(data.index, 1);

                // Return a new object with the updated cards
                return { ...obj, cards: updatedCards };
              } else {
                return obj;
              }
            });

            return modifiedData;
          }
        }
      );

      return { previousCardQueryData, previousCardAndDeckQueryData };
    },
    onSuccess: (_serverResponse, mutationData) => {
      updateCache(
        "deleteCard",
        "search-cache",
        "decks-and-cards",
        mutationData
      );
    },

    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, mutationData, context) => {
      if (error) {
        queryClient.setQueryData(
          ["cards", mutationData.deck_id],
          context?.previousCardQueryData
        );
        queryClient.setQueryData(
          ["decks-and-cards"],
          context?.previousCardAndDeckQueryData
        );
      }
      // If the search bar is open, it means that the user has deleted the card after searching. As I am using the "decks-and-cards" query for searching, I need updated data, so I will invalidate the query and retrieve fresh data.
      //As deck-and-card data might be large in size, we won't invalidate it every time a user deletes a card to prevent frequent transfer of big data. We will only do optimistic updates instead.

      queryClient.invalidateQueries({
        queryKey: ["cards", mutationData.deck_id],
      });
    },
  });
};

export default useDeleteCard;

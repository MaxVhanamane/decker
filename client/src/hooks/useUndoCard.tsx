import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../utils/fetch-utils";
import { CustomError } from "../utils/customError";
import {
  CardDataType,
  DeckAndCardType,
  UndoCardPayloadData,
} from "../types/types";
import { updateCache } from "../utils/updateCache";

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
  return useMutation({
    mutationFn: undoCard,
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deck_id],
      });
      await queryClient.cancelQueries({
        queryKey: ["decks-and-cards", data.deck_id],
      });

      const previousQueryData: CardDataType[] | undefined =
        queryClient.getQueryData(["cards", data.deck_id]);

      queryClient.setQueryData<CardDataType | undefined>(
        ["cards", data.deck_id],
        (oldQueryData) => {
          if (oldQueryData) {
            const newArray = [...oldQueryData?.cards];
            newArray.splice(data.index, 0, {
              ...data.content,
            });
            return { ...oldQueryData, cards: newArray };
          }
        }
      );

      // update decks-and-cards which is used for searching
      const previousCardAndDeckQueryData: DeckAndCardType[] | undefined =
        queryClient.getQueryData(["decks-and-cards"]);

      if (previousCardAndDeckQueryData) {
        queryClient.setQueryData<DeckAndCardType[]>(
          ["decks-and-cards"],
          (decks) => {
            if (decks) {
              const deepCopiedDecks: DeckAndCardType[] = JSON.parse(
                JSON.stringify(decks)
              );

              const modifiedDecksAndCards = deepCopiedDecks.map((deck) => {
                if (deck?._id === data?.deck_id) {
                  const newArray = [...deck?.cards];
                  newArray.splice(data.index, 0, {
                    ...data.content,
                  });
                  return { ...deck, cards: newArray };
                } else {
                  return deck;
                }
              });

              return modifiedDecksAndCards;
            }
          }
        );
      }

      return { previousQueryData, previousCardAndDeckQueryData };
    },

    onSuccess: (_serverResponse, mutationData) => {
      updateCache("undoCard", "search-cache", "decks-and-cards", mutationData);
    },

    onError: (error, dataThatWePassed, context) => {
      queryClient.setQueryData(
        ["cards", dataThatWePassed.deck_id],
        context?.previousQueryData
      );
      queryClient.setQueryData(
        ["decks-and-cards"],
        context?.previousCardAndDeckQueryData
      );
    },
    onSettled: (
      _dataReturnedByTheAxiosRequest,
      _error,
      dataThatWePassed,
      _context
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["cards", dataThatWePassed.deck_id],
      });
    },
  });
};

export default useUndoCard;

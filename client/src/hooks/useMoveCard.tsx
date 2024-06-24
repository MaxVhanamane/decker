import { request } from "../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  CardDataType,
  DeckAndCardType,
  moveCardPayloadDataType,
} from "../types/types";
import { CustomError } from "../utils/customError";
import { updateCache } from "../utils/updateCache";
import { OfflineContext } from "../context/OfflineContext";
import { useContext } from "react";

type SuccessResponseType = {
  success: true;
};

type AlternateSuccessResponseType = {
  success: true;
  message: string;
};

const moveCard = async (
  inputData: moveCardPayloadDataType
): Promise<
  SuccessResponseType | AlternateSuccessResponseType | CustomError
> => {
  try {
    const data = await request.put(
      `/card/changeposition/${inputData.deck_id}/${inputData.deleteIndex}/${inputData.moveIndex}`
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

const useMoveCard = () => {
  const { deck, setDeck } = useContext(OfflineContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveCard,
    onMutate: async (data: moveCardPayloadDataType) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deck_id],
      });
      await queryClient.cancelQueries({
        queryKey: ["decks-and-cards"],
      });
      const previousCardData: CardDataType[] | undefined =
        queryClient.getQueryData(["cards", data.deck_id]);

      queryClient.setQueryData<CardDataType | undefined>(
        ["cards", data.deck_id],
        (oldCardData) => {
          if (oldCardData) {
            const newArray = [...oldCardData.cards]; // creating a new array using spread operator if I directly assign newArray=oldCardData.cards like this It will refere the same array so If I modify here It will change data in original array which is not good because I am returning previousCardData so that I can reverse optimistic updates in onError function If some error occures. and there I want old array as it is.
            let element_to_move = newArray.splice(data.deleteIndex, 1)[0];
            newArray.splice(data.moveIndex, 0, element_to_move);
            return { ...oldCardData, cards: newArray };
          }
        }
      );
      // update decks-and-cards which is used for searching
      const previousCardAndDeckQueryData: DeckAndCardType[] | undefined =
        queryClient.getQueryData(["decks-and-cards"]);

      queryClient.setQueryData<DeckAndCardType[]>(
        ["decks-and-cards"],
        (oldDecksAndCards) => {
          if (oldDecksAndCards) {
            const deepCopiedDecks: DeckAndCardType[] = JSON.parse(
              JSON.stringify(oldDecksAndCards)
            );
            const modifiedData = deepCopiedDecks.map((deck) => {
              if (deck?._id === data?.deck_id) {
                const newCardsArray = [...deck.cards];
                let element_to_move = newCardsArray.splice(
                  data.deleteIndex,
                  1
                )[0];
                newCardsArray.splice(data.moveIndex, 0, element_to_move);
                return { ...deck, cards: newCardsArray };
              } else {
                return deck;
              }
            });
            return modifiedData;
          }
        }
      );

      return { previousCardData, previousCardAndDeckQueryData };
    },
    onSuccess: (serverResponse, mutationData) => {
      if (deck) {
        setDeck(null);
      }
      updateCache("moveCard", "search-cache", "decks-and-cards", mutationData);
    },

    onError: (error, data: moveCardPayloadDataType, context) => {
      queryClient.setQueryData(
        ["cards", data.deck_id],
        context?.previousCardData
      );
      queryClient.setQueryData(
        ["decks-and-cards"],
        context?.previousCardAndDeckQueryData
      );
    },
    onSettled: (dataReturnedByTheServer, error, dataThatWePassed) => {
      queryClient.invalidateQueries({
        queryKey: ["cards", dataThatWePassed.deck_id],
      });
    },
  });
};

export default useMoveCard;

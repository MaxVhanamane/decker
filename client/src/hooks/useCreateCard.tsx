import { request } from "../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  CardDataType,
  CreateCardPayloadType,
  DeckAndCardType,
} from "../types/types";
import { CustomError } from "../utils/customError";
import shortid from "shortid";
import { updateCache } from "../utils/updateCache";
import { useContext } from "react";
import { OfflineContext } from "../context/OfflineContext";

const createCard = async (payload: CreateCardPayloadType) => {
  try {
    const data = await request.post(`/card/${payload.deck_id}`, {
      content: payload.content,
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
  const { deck, setDeck } = useContext(OfflineContext);
  return useMutation({
    mutationFn: createCard,
    onMutate: async (data: CreateCardPayloadType) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deck_id],
      });
      await queryClient.cancelQueries({
        queryKey: ["decks-and-cards"],
      });
      const previousCardData: CardDataType[] = queryClient.getQueryData([
        "cards",
        data.deck_id,
      ])!;

      queryClient.setQueryData<CardDataType | undefined>(
        ["cards", data.deck_id],
        (oldCardData) => {
          if (oldCardData) {
            // creating a new array using spread operator if I directly assign newArray=oldCardData.cards like this It will reference the same array so If I modify here It will change data in original array which is not good because I am returning previousCardData so that I can reverse optimistic updates in onError function If some error occures. and there I want old array as it is.
            const newArray = [...oldCardData.cards];
            // Generate a temporary _id using shortid.generate() because the server creates the _id when the card is saved in the database.
            newArray.unshift({ ...data.content, _id: shortid.generate() });
            return { ...oldCardData, cards: newArray };
          }
        }
      );

      // update decks-and-cards which is used for searching
      const previousCardAndDeckQueryData: DeckAndCardType[] | undefined =
        queryClient.getQueryData(["decks-and-cards"]);

      // setQueryData is a synchronous function that can be used to immediately update a query's cached data.

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
                  const newArray = [...deck.cards];
                  newArray.unshift({
                    ...data.content,
                    _id: shortid.generate(),
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

      return { previousCardData, previousCardAndDeckQueryData };
    },

    onSuccess: (_serverResponse, mutationData) => {
      if (deck) {
        setDeck(null);
      }
      updateCache(
        "createCard",
        "search-cache",
        "decks-and-cards",
        mutationData
      );
    },

    onError: (_error, data: CreateCardPayloadType, context) => {
      queryClient.setQueryData(
        ["cards", data.deck_id],
        context?.previousCardData
      );
      queryClient.setQueryData(
        ["decks-and-cards"],
        context?.previousCardAndDeckQueryData
      );
    },

    onSettled: (_dataReturnedByTheServer, _error, mutationData) => {
      queryClient.invalidateQueries({
        queryKey: ["cards", mutationData.deck_id],
      });
    },
    retry: false,
  });
};

export default useCreateCard;

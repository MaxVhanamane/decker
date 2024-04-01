import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../utils/fetch-utils";
import { CardDataType, DeckAndCardType } from "../types/types";
import { useContext } from "react";
import { searchContext } from "../context/SearchContext";
import { CustomError } from "../utils/customError";
import { updateCache } from "../utils/updateCache";

type CardData = {
  deck_id: string;
  newContent: { title: string; note: string; cardId: string; _id: string };
  index: number;
};

type QueryData = {
  title: string;
  note: string;
  cardId: string;
  _id: string;
};

type SuccessResponseType = {
  success: boolean;
};

const editCard = async (
  cardData: CardData
): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.patch(`/card/${cardData.deck_id}`, {
      index: cardData.index,
      newContent: {
        title: cardData.newContent.title,
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
  const { showSearchBar, cardInfo, setCardInfo } = useContext(searchContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editCard,
    onMutate: async (data) => {
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
            const newArray: QueryData[] = [...oldQueryData?.cards];
            newArray.splice(data.index, 1, data?.newContent);
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
            const modifiedDecks = deepCopiedDecks.map((deck) => {
              if (deck?._id === data.deck_id) {
                const updatedCards = [...deck?.cards];
                updatedCards?.splice(data?.index, 1, data?.newContent);
                deck.cards = updatedCards;
                return deck;
              } else {
                return deck;
              }
            });
            return modifiedDecks;
          }
        }
      );

      if (showSearchBar) {
        setCardInfo({
          ...cardInfo,
          title: data?.newContent?.title,
          note: data?.newContent?.note,
        });
      }
      // Return previous data so that if something goes wrong we can use this in onError method
      return { previousCardQueryData, previousCardAndDeckQueryData };
    },

    onSuccess: (_serverResponse, mutationData) => {
      updateCache("editCard", "search-cache", "decks-and-cards", mutationData);
    },

    onError: (_error, data, context) => {
      queryClient.setQueryData(
        ["cards", data.deck_id],
        context?.previousCardQueryData
      );
      queryClient.setQueryData(
        ["decks-and-cards"],
        context?.previousCardAndDeckQueryData
      );
    },

    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, data, context) => {
      // If the search bar is open, it indicates that the user edited the card from the search result. The search bar is using the 'decks' query as data, so we will invalidate the decks query to keep it updated.
      // As the data for decks might be large in size, to avoid transferring huge data again and again on edit/delete, we will just perform optimistic updates.
      // if (showSearchBar) {
      //   queryClient.invalidateQueries({ queryKey: ["decks-and-cards"] });
      // }
      queryClient.invalidateQueries({
        queryKey: ["cards", data.deck_id],
      });
    },
  });
};

export default useEditCard;

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../utils/fetch-utils";
import { OldData } from "./useDeleteCard";
import { CardDataType } from "../types/types";
import { useContext } from "react";
import { searchContext } from "../context/SearchContext";

type CardData = {
  deck_id: string;
  newContent: { title: string; note: string; _id: string };
  index: number;
};

type QueryData = {
  title: string;
  note: string;
  _id: string;
};

type PromiseData = {
  title: string;
  _id: string;
  cards: { title: string; note: string }[];
  pinned: boolean;
};

type ErrorResponse = {
  message: string;
  status: number;
};

const editCard = async (
  cardData: CardData
): Promise<PromiseData | ErrorResponse> => {
  try {
    const data = await request.patch(`/card/${cardData.deck_id}`, {
      index: cardData.index,
      newContent: {
        title: cardData.newContent.title,
        note: cardData.newContent.note,
      },
    });
    if (data?.message) {
      return { message: data?.message, status: data?.status };
    } else {
      return data?.data;
    }
  } catch (error) {
    return {
      message:
        "An unexpected error occurred while editing the card. Please try again later.",
      status: 400,
    };
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
      const previousQueryData: CardDataType[] = queryClient.getQueryData([
        "cards",
        data.deck_id,
      ])!;
      queryClient.setQueryData<OldData | undefined>(
        ["cards", data.deck_id],
        (oldQueryData) => {
          if (oldQueryData) {
            const newArray: QueryData[] = [...oldQueryData?.cards];
            newArray.splice(data.index, 1, data.newContent);
            return { ...oldQueryData, cards: newArray };
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
      return previousQueryData;
    },
    onSuccess: (data) => {
      if (data && "message" in data) {
        if (data?.message) {
          throw new Error(data?.message);
        } else {
          throw new Error(
            "An unexpected error occurred while creating the card. Please try again later."
          );
        }
      }
    },

    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, data, context) => {
      if (error) {
        queryClient.setQueryData(["cards", data.deck_id], context);
      }
      // If the search bar is open, it indicates that the user edited the card from the search result. The search bar is using the 'decks' query as data, so we will invalidate the decks query to keep it updated.
      if (showSearchBar) {
        queryClient.invalidateQueries({ queryKey: ["decks-and-cards"] });
      }
      queryClient.invalidateQueries({
        queryKey: ["cards", data.deck_id],
      });
    },
  });
};

export default useEditCard;

import { useMutation, useQueryClient } from "react-query";
import { request } from "./../utils/axios-utils";
import { OldData } from "./useDeleteCard";
import { AlertContext } from "../context/AlertContext";
import { AlertData, AxiosErrorType, CardDataType } from "../types/types";
import { useContext } from "react";
import { UserContext } from "./../context/UserContext";

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

const editCard = async (cardData: CardData): Promise<PromiseData> => {
  try {
    const data = await request.patch(`/card/${cardData.deck_id}`, {
      index: cardData.index,
      newContent: {
        title: cardData.newContent.title,
        note: cardData.newContent.note,
      },
    });
    return data.data;
  } catch (error) {
    // network errors, such as a lack of internet connection/no internet connection, may not be recognized as traditional errors by the Axios library. if I don't add if statement like this it will run onSuccess instead of onError.
    if ((error as Error).message === "Network Error") {
      throw new Error("Network Error");
    }
    throw error;
  }
};

const useEditCard = () => {
  const { showSearchBar } = useContext(UserContext);
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  return useMutation(editCard, {
    onMutate: async (data) => {
      await queryClient.cancelQueries(["cards", data.deck_id]);
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
      // Return previous data so that if something goes wrong we can use this in onError method
      return previousQueryData;
    },
    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, data, context) => {
      if (error) {
        queryClient.setQueryData(["cards", data.deck_id], context);
        const message =
          (error as Error).message === "Network Error"
            ? "No internet connection"
            : (error as Error).message;
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: (error as AxiosErrorType)?.response?.data.message || message,
          autoHideDuration: 7000,
        }));
      }
      // If the search bar is open, it indicates that the user edited the card from the search result. The search bar is using the 'decks' query as data, so we will invalidate the decks query to keep it updated.
      if (showSearchBar) {
        queryClient.invalidateQueries("decks");
      }
      queryClient.invalidateQueries(["cards", data.deck_id]);
    },
  });
};

export default useEditCard;

import { request } from "../utils/axios-utils";
import { useQueryClient } from "react-query";
import { useMutation } from "react-query";
import { AlertContext } from "../context/AlertContext";
import { AlertData, AxiosErrorType } from "../types/types";
import { useContext } from "react";
type DataType = {
  id: string;
  pinned: boolean;
};

type DeckTypes = {
  _id: string;
  title: string;
  cards: string[];
  pinned: boolean;
};
export const updateDeck = async (data: DataType) => {
  try {
    // you don't need to add try catch block as axios will automatically throw an error.
    // If you want to throw an error then do it manually  using throw keyword because usequery or usemutation need that
    const response = await request.patch(`/deck/${data.id}`, {
      pinned: data.pinned,
    });
    return response.data;
  } catch (error) {
    // network errors, such as a lack of internet connection/no internet connection, may not be recognized as traditional errors by the Axios library. if I don't add if statement like this it will run onSuccess instead of onError.
    if ((error as Error).message === "Network Error") {
      throw new Error("Network Error");
    }
    throw error;
  }
};

const usePinDeck = () => {
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  return useMutation(updateDeck, {
    onMutate: async (data: DataType) => {
      await queryClient.cancelQueries("decks");
      const previousQueryData = queryClient.getQueryData<DeckTypes[]>("decks");

      // all this code is to show pinned and unpinned items in the beginning
      // To store index of an item that we want to pin or unpin
      let indexValue: number;
      // first get the item which we want to pin or unpin
      const deckToBeChanged = previousQueryData!.find((obj, index) => {
        if (obj._id === data.id) {
          indexValue = index;
          return obj;
        }
      });

      // once we get the item then we will change the pinned property
      deckToBeChanged!.pinned = data.pinned;
      // then we will remove the item that we want pin or unpin
      previousQueryData!.splice(indexValue!, 1);
      // then we will add the item in the beginning of an array using unshift
      previousQueryData!.unshift(deckToBeChanged!);

      queryClient.setQueryData<DeckTypes[] | undefined>("decks", () => {
        return previousQueryData;
      });
      return previousQueryData;
    },

    onError: (error, _title, context) => {
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
      queryClient.setQueryData("decks", context);
    },

    onSettled: () => {
      queryClient.invalidateQueries("decks");
    },
  });
};

export default usePinDeck;

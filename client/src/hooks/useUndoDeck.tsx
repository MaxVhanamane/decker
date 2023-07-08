import { request } from "../utils/axios-utils";
import { useMutation, useQueryClient } from "react-query";
import { AlertContext } from "../context/AlertContext";
import {
  AlertData,
  AxiosErrorType,
  DeckAndCardType,
  DeckType,
  DeckTypeWithIndex,
} from "../types/types";
import { useContext } from "react";
const deleteDeck = async (undoDeck: DeckTypeWithIndex) => {
  try {
    const response = await request.put("/undodeck", undoDeck);
    return response.data;
  } catch (error) {
    // network errors, such as a lack of internet connection/no internet connection, may not be recognized as traditional errors by the Axios library. if I don't add if statement like this it will run onSuccess instead of onError.
    if ((error as AxiosErrorType)?.response?.status === 500) {
      throw new Error("Internal server error");
    } else if ((error as Error).message === "Network Error") {
      throw new Error("Network Error");
    }
    throw error;
  }
};

const useUndoDeck = () => {
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  return useMutation(deleteDeck, {
    onMutate: async (data) => {
      await queryClient.cancelQueries("decks");
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryData: DeckType[] = queryClient.getQueryData("decks")!;

      queryClient.setQueryData("decks", () => {
        const newArray = [...previousQueryData];
        newArray.splice(data.index, 0, {
          _id: data._id,
          title: data.title,
          pinned: data.pinned,
        });
        return newArray;
      });

      await queryClient.cancelQueries("decks-and-cards");
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryDataForSearch: DeckAndCardType[] =
        queryClient.getQueryData("decks-and-cards")!;
      if (previousQueryDataForSearch) {
        queryClient.setQueryData("decks-and-cards", () => {
          const newArray = [...previousQueryDataForSearch];
          newArray.splice(data.index, 0, {
            _id: data._id,
            title: data.title,
            pinned: data.pinned,
            cards: data.cards,
          });
          return newArray;
        });
      }

      // Return previous data so that if something goes wrong we can use this in onError method
      // you can pass it in object or you can pass it directly like I did above in create deck
      return { previousQueryData, previousQueryDataForSearch };
    },

    onError: (error, _title, context) => {
      // I have returned the previous query data in onMutate function I can receive that data in context. I can use that data to
      // reverse what I have done in onMutate because onMutate runs before request goes to server there I have assumed that
      // Everthing will be fine on the server and I did optimistic updates in onMutate function. If some error occures I will
      // reverse that here using previousQuery data
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
      queryClient.setQueryData("decks", context?.previousQueryData);
      queryClient.setQueryData(
        "decks-and-cards",
        context?.previousQueryDataForSearch
      );
    },

    // onSettled is called in the end it doesnt matter if the mutation is successful or failed it will be called everytime. After doing above operations we will refetch the data. so that our data and the data in the db will be in sync.
    onSettled: () => {
      queryClient.invalidateQueries("decks");
    },
  });
};

export default useUndoDeck;

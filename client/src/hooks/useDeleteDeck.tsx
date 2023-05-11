import { request } from "../utils/axios-utils";
import { useMutation, useQueryClient } from "react-query";
import { AlertContext } from "../context/AlertContext";
import { AlertData, DeckType, DeckTypeWithIndex } from "../types/types";
import { useContext } from "react";

type ResponseType = {
  modifiedDeckInfo: {
    _id: string;
    title: string;
    pinned: boolean;
    email: string;
    date: Date;
    cards:
      | {
          cardId: string;
          note: string;
          title: string;
          _id: string;
        }[]
      | [];
  };
  success: boolean;
};

const deleteDeck = async ({ _id }: { _id: string }) => {
  try {
    const response = await request.delete(`/deck/${_id}`);
    return response.data;
  } catch (error) {
    return error;
  }
};

const useDeleteDeck = () => {
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  return useMutation(deleteDeck, {
    onMutate: async ({
      _id,
      handleUndoDeck,
    }: {
      _id: string;
      handleUndoDeck: (data: DeckTypeWithIndex | null) => void;
    }) => {
      await queryClient.cancelQueries("decks");
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      let indexOfDeletedDeck!:number
      const previousQueryData: DeckType[] = queryClient.getQueryData("decks")!;
      queryClient.setQueryData(
        "decks",
        (oldQueryData: DeckType[] | undefined) => {
          if (!oldQueryData) return [];
          const newData = oldQueryData?.filter(
            (deck: DeckType, index: number) => {
              if (deck._id === _id) {
                indexOfDeletedDeck=index
              }
              return deck._id != _id;
            }
          );
          return newData;
        }
      );
      // Return previous data so that if something goes wrong we can use this in onError method
      // you can pass it in object or you can pass it directly like I did above in create deck
      return { previousQueryData ,indexOfDeletedDeck,handleUndoDeck};
    },
    onSuccess: (data: ResponseType,_variables,context) => {
      // we need index of deck here so that when we undo, we can insert it in a right place.
      let deletedDeckInformation = { ...data.modifiedDeckInfo, index:context!.indexOfDeletedDeck };
      context?.handleUndoDeck(deletedDeckInformation);
    },

    onError: (_error, _title, context) => {
      // I have returned the previous query data in onMutate function I can receive that data in context. I can use that data to
      // reverse what I have done in onMutate because onMutate runs before request goes to server there I have assumed that
      // Everthing will be fine on the server and I did optimistic updates in onMutate function. If some error occures I will
      // reverse that here using previousQuery data
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "Some error occured, please try again!",
      }));
      queryClient.setQueryData("decks", context?.previousQueryData);
    },

    // onSettled is called in the end it doesnt matter if the mutation is successful or failed it will be called everytime. After doing above operations we will refetch the data. so that our data and the data in the db will be in sync.
    onSettled: () => {
      queryClient.invalidateQueries("decks");
    },
  });
};

export default useDeleteDeck;

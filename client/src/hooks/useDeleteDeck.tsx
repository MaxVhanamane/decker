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
import { useContext, RefObject } from "react";

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
    // if I don't check (error as Error).message === "Network Error") it doen't throw isError===true i.e mutation error when there is no internet.
    if ((error as AxiosErrorType)?.response?.status === 500) {
      throw new Error("Internal server error");
    } else if ((error as Error).message === "Network Error") {
      throw new Error("Network Error");
    }
    throw error;
  }
};

const useDeleteDeck = () => {
  const { setAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  return useMutation(deleteDeck, {
    onMutate: async ({
      _id,
      handleUndoDeck,
      undoButtonRef,
      handlePopupForUndoButton,
      timeout,
    }: {
      _id: string;
      handleUndoDeck: (data: DeckTypeWithIndex | null) => void;
      undoButtonRef: RefObject<HTMLDivElement>;
      handlePopupForUndoButton: () => void;
      timeout: NodeJS.Timeout;
    }) => {
      await queryClient.cancelQueries("decks");
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      let indexOfDeletedDeck!: number;
      const previousQueryData: DeckType[] = queryClient.getQueryData("decks")!;
      queryClient.setQueryData(
        "decks",
        (oldQueryData: DeckType[] | undefined) => {
          if (!oldQueryData) return [];
          const newData = oldQueryData?.filter(
            (deck: DeckType, index: number) => {
              if (deck._id === _id) {
                indexOfDeletedDeck = index;
              }
              return deck._id != _id;
            }
          );
          return newData;
        }
      );

      const previousQueryDataForSearch: DeckAndCardType[] =
        queryClient.getQueryData("decks-and-cards")!;
      if (previousQueryDataForSearch) {
        queryClient.setQueryData(
          "decks-and-cards",
          (oldQueryData: DeckAndCardType[] | undefined) => {
            if (!oldQueryData) return [];
            const newData = oldQueryData?.filter(
              (deck: DeckType, index: number) => {
                if (deck._id === _id) {
                  indexOfDeletedDeck = index;
                }
                return deck._id != _id;
              }
            );
            return newData;
          }
        );
      }

      // Return previous data so that if something goes wrong we can use this in onError method
      // you can pass it in object or you can pass it directly like I did above in create deck
      return {
        previousQueryData,
        indexOfDeletedDeck,
        handleUndoDeck,
        undoButtonRef,
        handlePopupForUndoButton,
        timeout,
        previousQueryDataForSearch,
      };
    },
    onSuccess: (data: ResponseType, _variables, context) => {
      // we need index of deck here so that when we undo, we can insert it in a right place.
      let deletedDeckInformation = {
        ...data.modifiedDeckInfo,
        index: context!.indexOfDeletedDeck,
      };
      context?.handleUndoDeck(deletedDeckInformation);
      // If user deletes decks one after the another that creates problem because when user deletes second deck
      // at that time undoButtonRef contains scale-100 so the undo button gets hidden to avoid that I have used if condition here.
      if (context!.undoButtonRef.current?.classList.contains("scale-0")) {
        context!.handlePopupForUndoButton();
      } else {
        clearTimeout(context!.timeout);
        context!.undoButtonRef?.current?.classList.remove("scale-100");

        context!.undoButtonRef?.current?.classList.add("scale-0");
        context!.undoButtonRef?.current?.classList.add("hidden");
        context!.handlePopupForUndoButton();
      }
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

export default useDeleteDeck;

import { request } from "../utils/fetch-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeckAndCardType, DeckType, DeckTypeWithIndex } from "../types/types";
import { RefObject } from "react";
import { CustomError } from "../utils/customError";
import { updateCache } from "../utils/updateCache";

type SuccessResponseType = {
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

const deleteDeck = async ({
  _id,
}: {
  _id: string;
}): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.delete(`/deck/${_id}`);

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useDeleteDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDeck,
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
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      let indexOfDeletedDeck!: number;
      const previousQueryData: DeckType[] = queryClient.getQueryData([
        "decks",
      ])!;
      queryClient.setQueryData(
        ["decks"],
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

      const previousCardAndDeckQueryData: DeckAndCardType[] =
        queryClient.getQueryData(["decks-and-cards"])!;
      if (previousCardAndDeckQueryData) {
        queryClient.setQueryData(
          ["decks-and-cards"],
          (oldQueryData: DeckAndCardType[] | undefined) => {
            if (!oldQueryData) return [];
            const newData = oldQueryData?.filter(
              (deck: DeckType, index: number) => {
                if (deck._id === _id) {
                  indexOfDeletedDeck = index;
                }
                return deck._id !== _id;
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
        previousCardAndDeckQueryData,
      };
    },
    onSuccess: (
      data: SuccessResponseType | CustomError,
      mutationData,
      context
    ) => {
      // we need index of deck here so that when we undo, we can insert it in a right place.
      if (data && "modifiedDeckInfo" in data) {
        let deletedDeckInformation = {
          ...data.modifiedDeckInfo,
          index: context!.indexOfDeletedDeck,
        };

        mutationData?.handleUndoDeck(deletedDeckInformation);
        // If user deletes decks one after the another that creates problem because when user deletes second deck
        // at that time undoButtonRef contains scale-100 so the undo button gets hidden to avoid that I have used if condition here.
        if (
          mutationData!.undoButtonRef.current?.classList.contains("scale-0")
        ) {
          mutationData!.handlePopupForUndoButton();
        } else {
          clearTimeout(mutationData!.timeout);
          mutationData!.undoButtonRef?.current?.classList.remove("scale-100");
          mutationData!.undoButtonRef?.current?.classList.add("scale-0");
          mutationData!.undoButtonRef?.current?.classList.add("hidden");
          mutationData!.handlePopupForUndoButton();
        }
        updateCache("deleteDeck", "search-cache", "decks-and-cards", {
          deck_id: mutationData?._id,
        });
      }
    },

    onError: (error, _title, context) => {
      // I have returned the previous query data in onMutate function I can receive that data in context. I can use that data to
      // reverse what I have done in onMutate because onMutate runs before request goes to server there I have assumed that
      // Everthing will be fine on the server and I did optimistic updates in onMutate function. If some error occures I will
      // reverse that here using previousQuery data

      queryClient.setQueryData(["decks"], context?.previousQueryData);
      queryClient.setQueryData(
        ["decks-and-cards"],
        context?.previousCardAndDeckQueryData
      );
    },

    // onSettled is called in the end it doesnt matter if the mutation is successful or failed it will be called everytime. After doing above operations we will refetch the data. so that our data and the data in the db will be in sync.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export default useDeleteDeck;

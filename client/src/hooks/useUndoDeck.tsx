import { request } from "../utils/fetch-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeckAndCardType, DeckType, DeckTypeWithIndex } from "../types/types";
import { CustomError } from "../utils/customError";
const deleteDeck = async (undoDeck: DeckTypeWithIndex) => {
  try {
    const data = await request.put("/undodeck", undoDeck);

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useUndoDeck = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDeck,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryData: DeckType[] = queryClient.getQueryData([
        "decks",
      ])!;

      queryClient.setQueryData(["decks"], () => {
        const newArray = [...previousQueryData];
        newArray.splice(data.index, 0, {
          _id: data._id,
          title: data.title,
          pinned: data.pinned,
        });
        return newArray;
      });

      await queryClient.cancelQueries({ queryKey: ["decks-and-cards"] });
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryDataForSearch: DeckAndCardType[] =
        queryClient.getQueryData(["decks-and-cards"])!;
      if (previousQueryDataForSearch) {
        queryClient.setQueryData(["decks-and-cards"], () => {
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
      queryClient.setQueryData(["decks"], context?.previousQueryData);
      queryClient.setQueryData(
        ["decks-and-cards"],
        context?.previousQueryDataForSearch
      );
    },

    // onSettled is called in the end it doesnt matter if the mutation is successful or failed it will be called everytime. After doing above operations we will refetch the data. so that our data and the data in the db will be in sync.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
};

export default useUndoDeck;

import { request } from "../utils/fetch-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { DeckAndCardType } from "../types/types";
import { useContext } from "react";
import { searchContext } from "../context/SearchContext";
import { CustomError } from "../utils/customError";
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
export const updateDeck = async (inputData: DataType) => {
  try {
    // you don't need to add try catch block as axios will automatically throw an error.
    // If you want to throw an error then do it manually  using throw keyword because usequery or usemutation need that
    const data = await request.patch(`/deck/togglepin/${inputData.id}`, {
      pinned: inputData.pinned,
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

const usePinDeck = () => {
  const queryClient = useQueryClient();
  const { showSearchBar } = useContext(searchContext);

  return useMutation({
    mutationFn: updateDeck,
    onMutate: async (data: DataType) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });

      const previousQueryData = queryClient.getQueryData<DeckTypes[]>([
        "decks",
      ]);
      // Make a deep copy because if an error occurs, we are returning the previousQueryData. If I directly work on it, I won't be able to reverse the changes made in case of an error.
      const CopiedPreviousQueryData: DeckTypes[] = JSON.parse(
        JSON.stringify(previousQueryData)
      );

      // all this code is to show pinned and unpinned items in the beginning
      // To store index of an item that we want to pin or unpin
      let indexValue: number;
      // first get the item which we want to pin or unpin
      const deckToBeChanged = CopiedPreviousQueryData!.find((obj, index) => {
        if (obj._id === data.id) {
          indexValue = index;
          return obj;
        }
      });

      // once we get the item then we will change the pinned property
      deckToBeChanged!.pinned = data.pinned;
      // then we will remove the item that we want pin or unpin
      CopiedPreviousQueryData!.splice(indexValue!, 1);
      // then we will add the item in the beginning of an array using unshift
      CopiedPreviousQueryData!.unshift(deckToBeChanged!);

      queryClient.setQueryData<DeckTypes[] | undefined>(["decks"], () => {
        return CopiedPreviousQueryData;
      });

      //To keep search result in sync.
      await queryClient.cancelQueries({ queryKey: ["decks-and-cards"] });

      const previousQueryDataForSearch = queryClient.getQueryData<
        DeckAndCardType[]
      >(["decks-and-cards"]);

      if (previousQueryDataForSearch) {
        const CopiedPreviousQueryDataForSearch: DeckAndCardType[] = JSON.parse(
          JSON.stringify(previousQueryDataForSearch)
        );
        // all this code is to show pinned and unpinned items in the beginning
        // To store index of an item that we want to pin or unpin
        let indexValue: number;
        // first get the item which we want to pin or unpin
        const deckToBeChanged = CopiedPreviousQueryDataForSearch!.find(
          (obj, index) => {
            if (obj._id === data.id) {
              indexValue = index;
              return obj;
            }
          }
        );

        // once we get the item then we will change the pinned property
        deckToBeChanged!.pinned = data.pinned;
        // then we will remove the item that we want pin or unpin
        CopiedPreviousQueryDataForSearch!.splice(indexValue!, 1);
        // then we will add the item in the beginning of an array using unshift
        CopiedPreviousQueryDataForSearch!.unshift(deckToBeChanged!);

        queryClient.setQueryData<DeckAndCardType[] | undefined>(
          ["decks-and-cards"],
          () => {
            return CopiedPreviousQueryDataForSearch;
          }
        );
      }

      return { previousQueryData, previousQueryDataForSearch };
    },

    onError: (error, _title, context) => {
      queryClient.setQueryData(["decks"], context?.previousQueryData);
      queryClient.setQueryData(
        ["decks-and-cards"],
        context?.previousQueryDataForSearch
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      // If the search bar is open, it means that the user performed this  operation from the search results.
      if (showSearchBar) {
        queryClient.invalidateQueries({ queryKey: ["decks-and-cards"] });
      }
    },
  });
};

export default usePinDeck;

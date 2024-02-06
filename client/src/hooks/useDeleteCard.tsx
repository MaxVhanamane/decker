import { request } from "../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { CardDataType } from "../types/types";
import { CustomError } from "../utils/customError";

export type DeckTypes = {
  success: boolean;
  cards: { _id: string; title: string; cards: string[] };
};
type PayloadType = {
  deck_id: string;
  index: number;
};

export type OldData = {
  cards: { title: string; note: string; _id: string }[];
  title: string;
};
type ErrorResponse = {
  message: string;
  status: number;
};

const deleteCard = async (
  payLoad: PayloadType
): Promise<DeckTypes | ErrorResponse> => {
  try {
    const data = await request.delete(
      `/card/${payLoad.deck_id}/${payLoad.index}`
    );

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useDeleteCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCard,
    onMutate: async (data: PayloadType) => {
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deck_id],
      });
      await queryClient.cancelQueries({
        queryKey: ["decks-and-cards"],
      });
      const previousQueryData: CardDataType[] = queryClient.getQueryData([
        "cards",
        data.deck_id,
      ])!;

      queryClient.setQueryData<OldData | undefined>(
        ["cards", data.deck_id],
        (oldQueryData) => {
          if (oldQueryData) {
            const newArray = [...oldQueryData?.cards];
            newArray.splice(data.index, 1);
            return { ...oldQueryData, cards: newArray };
          }
        }
      );
      const allDecksAndCards = queryClient.getQueryData(["decks-and-cards"]);
      queryClient.setQueryData<any>(
        ["decks-and-cards"],
        (oldQueryData: any) => {
          if (oldQueryData) {
            const newArr = JSON.parse(JSON.stringify(oldQueryData));

            const modifiedData = newArr.map((obj: any) => {
              if (obj._id === data.deck_id) {
                const updatedCards = [...obj.cards]; // Create a new reference for obj.cards
                updatedCards.splice(data.index, 1);

                // Return a new object with the updated cards
                return { ...obj, cards: updatedCards };
              } else {
                return obj;
              }
            });

            return modifiedData;
          }
        }
      );
      return previousQueryData;
    },

    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, data, context) => {
      if (error) {
        queryClient.setQueryData(["cards", data.deck_id], context);
      }
      // If the search bar is open, it means that the user has deleted the card after searching. As I am using the "decks" query for searching, I need updated data, so I will invalidate the query and retrieve fresh data.

      queryClient.invalidateQueries({
        queryKey: ["cards", data.deck_id],
      });
    },
  });
};

export default useDeleteCard;

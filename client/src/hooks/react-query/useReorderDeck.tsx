import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeckType } from "../../types/types";
import { CustomError } from "../../utils/customError";
import { request } from "../../utils/fetch-utils";

type SuccessResponseType = {
  success: boolean;
};

export const reOrderDeck = async ({
  currentIndex,
  newIndex,
}: {
  currentIndex: number;
  newIndex: number;
}): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.post(`/reorder-deck`, {
      currentIndex,
      newIndex,
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

const useReorderDeck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reOrderDeck,
    onMutate: async ({
      currentIndex,
      newIndex,
    }: {
      currentIndex: number;
      newIndex: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      await queryClient.cancelQueries({ queryKey: ["decks-and-cards"] });
      const previousQueryData: DeckType[] = queryClient.getQueryData([
        "decks",
      ])!;
      queryClient.setQueryData<DeckType[]>(["decks"], (oldDecks) => {
        if (oldDecks) {
          const updatedDecks = [...oldDecks];
          // Step 1: Remove the item from the old index
          const [movedItem] = updatedDecks.splice(currentIndex, 1);

          // Step 2: Insert the item at the new index
          updatedDecks.splice(newIndex, 0, movedItem);

          return updatedDecks;
        }
      });

      return previousQueryData;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["decks"] }),
  });
};

export default useReorderDeck;

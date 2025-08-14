import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeckType } from "../../types/types";
import { CustomError } from "../../utils/customError";
import { request } from "../../utils/fetch-utils";
import { useContext } from "react";
import { ShowToastContext } from "../../context/ToastNotificationContext";

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
  const { showToast } = useContext(ShowToastContext);

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

      return { previousQueryData };
    },
    onError: (_error, _var, context) => {
      showToast({
        message: "We couldn't reorder your deck. Please try again.",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      queryClient.setQueryData(["decks"], context?.previousQueryData);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["decks"] }),
  });
};

export default useReorderDeck;

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback, useContext } from "react";
import { request } from "../../utils/fetch-utils";
import { CustomError } from "../../utils/customError";
import type { DeckType } from "../../types/types";
import { ShowToastContext } from "../../context/ToastNotificationContext";

type ReorderDeckPayload = {
  deckId: string;
  nextDeckId: string | null;
  prevDeckId: string | null;
  reindexNeeded?: boolean;
};

type SuccessResponseType = {
  success: boolean;
};

interface QueuedOperation {
  id: number;
  payload: ReorderDeckPayload;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export const reOrderDeck = async ({
  deckId,
  prevDeckId,
  nextDeckId,
  reindexNeeded = false,
}: ReorderDeckPayload): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.put(`/deck/changeposition/${deckId}`, {
      prevDeckId,
      nextDeckId,
      reindexNeeded,
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

  // queue mechanics
  const operationQueue = useRef<QueuedOperation[]>([]);
  const isProcessing = useRef(false);
  const operationIdCounter = useRef(0);

  const isReindexRequested = useRef(false);

  const processQueue = useCallback(async () => {
    if (isProcessing.current || operationQueue.current.length === 0) return;
    isProcessing.current = true;

    while (operationQueue.current.length > 0) {
      const operation = operationQueue.current.shift()!;

      if (isReindexRequested.current) {
        operation.reject(
          new Error("A reindex operation was triggered. Please try again.")
        );
        continue;
      }

      try {
        if (operation.payload.reindexNeeded) {
          isReindexRequested.current = true;
        }

        const result = await reOrderDeck(operation.payload);
        operation.resolve(result);
      } catch (error) {
        operation.reject(error);
      }
    }

    isProcessing.current = false;
  }, []);

  const queueReorderDeck = useCallback(
    (payload: ReorderDeckPayload): Promise<any> => {
      return new Promise((resolve, reject) => {
        const operationId = ++operationIdCounter.current;

        operationQueue.current.push({
          id: operationId,
          payload,
          resolve,
          reject,
        });

        processQueue();
      });
    },
    [processQueue]
  );

  const mutation = useMutation({
    mutationFn: queueReorderDeck,

    // Optimistic update
    onMutate: async ({ deckId, prevDeckId, nextDeckId }) => {
      const queryKey = ["decks"];
      await queryClient.cancelQueries({ queryKey });

      const previousData: DeckType | undefined =
        queryClient.getQueryData(queryKey);

      if (!previousData) return { rollbackData: undefined };

      // Make a copy
      const updatedDecks = [...previousData.decks];
      const draggedIndex = updatedDecks.findIndex((d) => d.deckId === deckId);
      if (draggedIndex === -1) return { rollbackData: previousData };

      const [dragged] = updatedDecks.splice(draggedIndex, 1);

      // Find insertion point
      let insertIndex = updatedDecks.length;
      if (prevDeckId) {
        const prevIndex = updatedDecks.findIndex(
          (d) => d.deckId === prevDeckId
        );
        if (prevIndex !== -1) insertIndex = prevIndex + 1;
      } else if (nextDeckId) {
        const nextIndex = updatedDecks.findIndex(
          (d) => d.deckId === nextDeckId
        );
        if (nextIndex !== -1) insertIndex = nextIndex;
      }

      updatedDecks.splice(insertIndex, 0, dragged);

      // Update cache immediately
      queryClient.setQueryData(queryKey, {
        ...previousData,
        decks: updatedDecks,
      });

      return { rollbackData: previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.rollbackData) {
        queryClient.setQueryData(["decks"], context.rollbackData);
      }
      showToast({
        message: "We couldn't reorder your deck. Please try again.",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
    },

    onSettled: () => {
      if (operationQueue.current.length === 0 && !isProcessing.current) {
        queryClient.invalidateQueries({ queryKey: ["decks"] });
        isReindexRequested.current = false;
      }
    },
  });

  return { ...mutation };
};

export default useReorderDeck;

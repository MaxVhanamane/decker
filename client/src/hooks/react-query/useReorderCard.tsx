import { request } from "../../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { CardListType, moveCardPayloadType } from "../../types/types";
import { CustomError } from "../../utils/customError";
import { useRef, useCallback } from "react";

type MoveCardResponse =
  | { success: true; message?: string }
  | { success: false; message: string };

interface QueuedOperation {
  id: number;
  payload: moveCardPayloadType;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

const moveCard = async (
  inputData: moveCardPayloadType
): Promise<MoveCardResponse | CustomError> => {
  try {
    const data = await request.put(
      `/card/changeposition/${inputData.deckId}/${inputData.cardId}/${inputData.newOrder}`
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

const useReorderCard = () => {
  const queryClient = useQueryClient();

  // Queue to handle ALL operations sequentially
  const operationQueue = useRef<QueuedOperation[]>([]);
  const isProcessing = useRef(false);
  const operationIdCounter = useRef(0);

  const processQueue = useCallback(async () => {
    if (isProcessing.current || operationQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;

    // Process ALL operations in the queue sequentially
    while (operationQueue.current.length > 0) {
      const operation = operationQueue.current.shift()!;

      try {
        // Execute each operation without cancellation
        const result = await moveCard(operation.payload);
        operation.resolve(result);
      } catch (error) {
        operation.reject(error);
      }
    }

    isProcessing.current = false;
  }, [queryClient]);

  const queueMoveCard = useCallback(
    (payload: moveCardPayloadType): Promise<any> => {
      return new Promise((resolve, reject) => {
        const operationId = ++operationIdCounter.current;

        operationQueue.current.push({
          id: operationId,
          payload,
          resolve,
          reject,
        });

        // Start processing if not already processing
        processQueue();
      });
    },
    [processQueue]
  );

  const mutation = useMutation({
    mutationFn: queueMoveCard,
    onMutate: async (payload: moveCardPayloadType) => {
      // Only cancel queries to prevent stale data interference
      // DO NOT cancel actual HTTP requests
      await queryClient.cancelQueries({
        queryKey: ["cards", payload.deckId],
      });

      const previousCardData: CardListType | undefined =
        queryClient.getQueryData(["cards", payload.deckId]);

      // Safe copy for rollback: previousCardData is a reference to the React Query cache.
      // When we call setQueryData, we update an object (e.g., the order key).
      // Even if we create a shallow copy, all objects inside are still pointing
      // to the same memory. This causes rollbackData to be updated as well.
      // To avoid this, we create new references for all objects too.

      const rollbackData = previousCardData
        ? {
            ...previousCardData,
            cards: previousCardData.cards.map((c) => ({ ...c })),
          }
        : undefined;
      // Apply optimistic update immediately for smooth UX
      queryClient.setQueryData<CardListType | undefined>(
        ["cards", payload.deckId],
        (oldCardData) => {
          if (oldCardData) {
            const newArray = [...oldCardData.cards];
            const [movedItem] = newArray.splice(payload.fromIndex, 1);
            newArray.splice(payload.toIndex, 0, movedItem);
            movedItem.order = payload.newOrder;
            return { ...oldCardData, cards: newArray };
          }
        }
      );

      return {
        rollbackData,
        operationId: operationIdCounter.current,
      };
    },

    onError: (_error, data: moveCardPayloadType, context) => {
      // Only rollback if this was the last operation
      // Otherwise, let the final invalidation handle sync
      if (operationQueue.current.length === 0) {
        if (context) {
          queryClient.setQueryData(
            ["cards", data.deckId],
            context.rollbackData
          );
        }
      }
    },

    onSettled: (_dataReturnedByTheServer, _error, dataThatWePassed) => {
      // Only invalidate when ALL operations in queue are complete
      if (operationQueue.current.length === 0 && !isProcessing.current) {
        queryClient.invalidateQueries({
          queryKey: ["cards", dataThatWePassed.deckId],
        });
      }
    },
  });

  return {
    ...mutation,
  };
};

export default useReorderCard;

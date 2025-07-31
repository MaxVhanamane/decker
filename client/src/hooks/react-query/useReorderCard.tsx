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
      `/card/changeposition/${inputData.deckId}/${inputData.currentIndex}/${inputData.newIndex}`
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

      // Store previous data for potential rollback
      const previousCardData: CardListType[] | undefined =
        queryClient.getQueryData(["cards", payload.deckId]);

      // Apply optimistic update immediately for smooth UX
      queryClient.setQueryData<CardListType | undefined>(
        ["cards", payload.deckId],
        (oldCardData) => {
          if (oldCardData) {
            const newArray = [...oldCardData.cards];
            const elementToMove = newArray.splice(payload.currentIndex, 1)[0];
            if (elementToMove) {
              newArray.splice(payload.newIndex, 0, elementToMove);
            }
            return { ...oldCardData, cards: newArray };
          }
        }
      );

      return {
        previousCardData,
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
            context.previousCardData
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

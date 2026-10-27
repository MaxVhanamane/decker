import { request } from "../../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type {
  GetChaptersResponseType,
  moveChapterPayloadType,
} from "../../types/types";
import { CustomError } from "../../utils/customError";
import { useRef, useCallback } from "react";

type MoveChapterResponse = { success: boolean; reindexed: boolean };

interface QueuedOperation {
  id: number;
  payload: moveChapterPayloadType;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}
const moveChapter = async (
  inputData: moveChapterPayloadType,
): Promise<MoveChapterResponse | CustomError> => {
  try {
    const url = `/api/v1/chapters/changeposition/${inputData.deckId}/${inputData.chapterId}/${inputData.newOrder}`;
    const data = await request.put(url, {
      reindexNeeded: inputData.reindexNeeded,
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

const useReorderChapter = () => {
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
        const result = await moveChapter(operation.payload);
        operation.resolve(result);
      } catch (error) {
        operation.reject(error);
      }
    }

    isProcessing.current = false;
  }, [queryClient]);

  const queueMoveChapter = useCallback(
    (payload: moveChapterPayloadType): Promise<any> => {
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
    [processQueue],
  );

  const mutation = useMutation({
    mutationFn: queueMoveChapter,
    onMutate: async (payload: moveChapterPayloadType) => {
      // Only cancel queries to prevent stale data interference
      // DO NOT cancel actual HTTP requests
      const queryKey = ["chapters", payload.deckId];
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousChaptersData: GetChaptersResponseType | undefined =
        queryClient.getQueryData(queryKey);

      // Safe copy for rollback: previousChaptersData is a reference to the React Query cache.
      // When we call setQueryData, we update an object (e.g., the order key).
      // Even if we create a shallow copy, all objects inside are still pointing
      // to the same memory. This causes rollbackData to be updated as well.
      // To avoid this, we create new references for all objects too.

      const rollbackData = previousChaptersData
        ? {
            ...previousChaptersData,
            chapters: previousChaptersData.chapters.map((c) => ({ ...c })),
          }
        : undefined;

      queryClient.setQueryData<GetChaptersResponseType | undefined>(
        queryKey,
        (oldChapterData) => {
          if (oldChapterData) {
            const newArray = [...oldChapterData.chapters];
            const updatedArray = newArray
              .map((chapter) => {
                if (chapter.chapterId === payload.chapterId) {
                  return { ...chapter, order: payload.newOrder };
                } else {
                  return chapter;
                }
              })
              .sort((a, b) => b.order - a.order);
            return { ...oldChapterData, chapters: updatedArray };
          }
        },
      );

      return {
        rollbackData,
        operationId: operationIdCounter.current,
      };
    },

    onError: (_error, data: moveChapterPayloadType, context) => {
      // Only rollback if this was the last operation
      // Otherwise, let the final invalidation handle sync
      const queryKey = ["chapters", data.deckId];

      if (operationQueue.current.length === 0) {
        if (context) {
          queryClient.setQueryData(queryKey, context.rollbackData);
        }
      }
    },

    onSettled: (_dataReturnedByTheServer, _error, dataThatWePassed) => {
      const queryKey = ["chapters", dataThatWePassed.deckId];

      // Only invalidate when ALL operations in queue are complete
      if (operationQueue.current.length === 0 && !isProcessing.current) {
        queryClient.invalidateQueries({
          queryKey,
        });
      }
    },
  });

  return {
    ...mutation,
  };
};

export default useReorderChapter;

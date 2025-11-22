import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../utils/fetch-utils";
import { CustomError } from "../../utils/customError";
import { useContext } from "react";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { ChapterDetails, GetChaptersResponseType } from "../../types/types";

type UndoChapterPayload = ChapterDetails & { deletedBatchId: string };
const undoChapter = async (payload: UndoChapterPayload) => {
  try {
    const data = await request.put("/chapter/undo", {
      deckId: payload.deckId,
      chapterId: payload.chapterId,
      deletedBatchId: payload.deletedBatchId,
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

const useUndoChapter = () => {
  const queryClient = useQueryClient();
  const { showToast } = useContext(ShowToastContext);
  return useMutation({
    mutationFn: undoChapter,
    onMutate: async (payload) => {
      const queryKey = ["chapters", payload.deckId];
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousQueryData: GetChaptersResponseType | undefined =
        queryClient.getQueryData(queryKey);

      queryClient.setQueryData<GetChaptersResponseType | undefined>(
        queryKey,
        (oldQueryData) => {
          if (oldQueryData) {
            const newChaptersArray = [...oldQueryData.chapters];

            newChaptersArray.push(payload);
            newChaptersArray.sort((a, b) => b.order - a.order);
            return {
              ...oldQueryData,
              chapters: newChaptersArray,
              maxOrder: newChaptersArray[0].order,
            };
          }
        }
      );
      return { previousQueryData };
    },

    onError: (_error, payload, context) => {
      showToast({
        message:
          "We're sorry, but we couldn't undo your chapter due to a technical issue. Your chapter may not be restored. We apologize for any inconvenience.",
        severity: "error",
        autoHideDuration: 7000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      const queryKey = ["chapters", payload.deckId];
      queryClient.setQueryData(queryKey, context?.previousQueryData);
    },
    onSettled: (_data, _error, payload) => {
      const queryKey = ["chapters", payload.deckId];
      const queryKeyForChapterCards = [
        "chapter-cards",
        payload.deckId,
        payload.chapterId,
      ];

      queryClient.invalidateQueries({
        queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeyForChapterCards,
      });
    },
  });
};

export default useUndoChapter;

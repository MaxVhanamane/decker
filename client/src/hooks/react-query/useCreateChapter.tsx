import { request } from "../../utils/fetch-utils";
import { CustomError } from "../../utils/customError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GetChaptersResponseType } from "../../types/types";
import { useNavigate } from "react-router-dom";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useContext } from "react";

type CreateChapterPayload = {
  chapterId: string;
  deckId: string;
  chapterName: string;
  maxOrder: number;
};

const createChapter = async ({
  chapterId,
  deckId,
  chapterName,
  maxOrder,
}: CreateChapterPayload) => {
  try {
    const data = await request.post(`/api/v1/chapters`, {
      deckId,
      chapterId,
      chapterName,
      maxOrder,
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
const useCreateChapter = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useContext(ShowToastContext);

  return useMutation({
    mutationFn: createChapter,
    onMutate: async (payload) => {
      const queryKey = ["chapters", payload.deckId];
      await queryClient.cancelQueries({ queryKey });
      const previousChaptersQueryData: GetChaptersResponseType | undefined =
        queryClient.getQueryData(queryKey);

      queryClient.setQueryData<GetChaptersResponseType | undefined>(
        queryKey,
        (oldQueryData) => {
          if (oldQueryData) {
            const newArray = [...oldQueryData.chapters];
            newArray.unshift({
              chapterId: payload.chapterId,
              deckId: payload.deckId,
              chapterName: payload.chapterName,
              order: payload.maxOrder + 10,
              cardsCount: 0,
              createdAt: Date.now().toLocaleString(),
            });
            return {
              ...oldQueryData,
              chapters: newArray,
              maxOrder: oldQueryData.maxOrder + 10,
            };
          }
        },
      );
      navigate(`/cards/${payload.deckId}/${payload.chapterId}`, {
        state: { isNewChapter: true },
      });
      return { previousChaptersQueryData };
    },
    onError: (error, payload, context) => {
      const defaultErrorMessage =
        "Something went wrong! While creating your chapter";
      showToast({
        message: error?.message || defaultErrorMessage,
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      const queryKey = ["chapters", payload.deckId];
      queryClient.setQueryData(queryKey, context?.previousChaptersQueryData);
      navigate(`/cards/${payload.deckId}`);
    },
    onSuccess: (data, payload) => {
      const queryKey = ["chapters", payload.deckId];
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export default useCreateChapter;

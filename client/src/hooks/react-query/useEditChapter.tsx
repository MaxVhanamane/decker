import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../utils/fetch-utils";
import type { GetChaptersResponseType } from "../../types/types";
import { CustomError } from "../../utils/customError";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useContext } from "react";

type PayloadType = {
  deckId: string;
  chapterId: string;
  newChapterName: string;
  searchParams?: {
    query: string;
    page: number;
  };
};

type SuccessResponseType = {
  success: boolean;
};

const editChapter = async (
  payload: PayloadType,
): Promise<SuccessResponseType | CustomError> => {
  try {
    const data = await request.put(
      `/api/v1/chapters/editchapter/${payload.deckId}/${payload.chapterId}`,
      {
        chapterName: payload.newChapterName,
      },
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

const useEditChapter = () => {
  const queryClient = useQueryClient();
  const { showToast } = useContext(ShowToastContext);

  return useMutation({
    mutationFn: editChapter,
    onMutate: async (payload) => {
      const queryKey = ["chapters", payload.deckId];
      await queryClient.cancelQueries({ queryKey });
      if (payload.searchParams) {
        await queryClient.cancelQueries({
          queryKey: [
            "searchResult",
            payload.searchParams.query,
            payload.searchParams.page,
          ],
        });
      }
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const previousQueryData =
        queryClient.getQueryData<GetChaptersResponseType>(queryKey);
      queryClient.setQueryData<GetChaptersResponseType | undefined>(
        queryKey,
        (oldQueryData) => {
          if (oldQueryData) {
            const newChapters = oldQueryData?.chapters.map((chapter) => {
              if (chapter.chapterId === payload.chapterId) {
                return { ...chapter, chapterName: payload.newChapterName };
              }
              return chapter;
            });
            return { ...oldQueryData, chapters: newChapters };
          }
        },
      );
      //update search result

      return { previousQueryData };
    },

    onError: (error, payload, context) => {
      queryClient.setQueryData(
        ["chapters", payload.deckId],
        context?.previousQueryData,
      );
      //   if (payload?.searchParams) {
      //     queryClient.setQueryData(
      //       [
      //         "searchResult",
      //         payload.searchParams.query,
      //         payload.searchParams.page,
      //       ],
      //       context?.previousSearchResult
      //     );
      //   }
      showToast({
        message:
          error?.message ||
          "Failed to save changes to the deck title. Please try again.",
        severity: "error",
        autoHideDuration: 3000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
    },

    onSettled: (_, _error, payload) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", payload.deckId] });
    },
  });
};

export default useEditChapter;

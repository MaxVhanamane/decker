import { request } from "../../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type {
  ChapterDetails,
  GetChaptersResponseType,
} from "../../types/types";
import { CustomError } from "../../utils/customError";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useContext, useRef } from "react";
import { useAudio } from "../../context/AudioContext";
import { OfflineContext } from "../../context/OfflineContext";
import { useNavigate } from "react-router-dom";
import useUndoChapter from "./useUndoChapter";

type SuccessResponseType = {
  success: boolean;
  deletedBatchId: string;
  softDeletedCards: number;
};

type DeleteChapterPayloadType = {
  chapterInfo: ChapterDetails;
  searchParams?: {
    query: string;
    page: number;
  };
};

const deleteChapter = async (
  payload: DeleteChapterPayloadType
): Promise<SuccessResponseType> => {
  try {
    const url = `/chapter/${payload.chapterInfo?.deckId}/${payload?.chapterInfo?.chapterId}`;
    const data = await request.delete(url);

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  const { showToast } = useContext(ShowToastContext);
  const { handlePlayAudio } = useAudio();
  const undoChapterDataRef = useRef<
    null | (ChapterDetails & { deletedBatchId: string })
  >(null);
  const { isOnline } = useContext(OfflineContext);
  const navigate = useNavigate();
  const { mutate: undoChapter } = useUndoChapter();

  const handleUndoChapterButtonClick = () => {
    if (!isOnline) {
      showToast({
        message: "No internet connection",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });

      return;
    }
    if (undoChapterDataRef.current) {
      undoChapter(undoChapterDataRef.current);
    }
  };

  return useMutation({
    mutationFn: deleteChapter,
    onMutate: async (data: DeleteChapterPayloadType) => {
      const queryKey = ["chapters", data.chapterInfo.deckId];

      await queryClient.cancelQueries({
        queryKey,
      });

      // if we have data.searchPaylod it means delete request came from search result
      if (data.searchParams) {
        await queryClient.cancelQueries({
          queryKey: [
            "searchResult",
            data.searchParams.query,
            data?.searchParams.page,
          ],
        });
      }

      const previousChaptersQueryData: GetChaptersResponseType | undefined =
        queryClient.getQueryData(queryKey);

      queryClient.setQueryData<GetChaptersResponseType | undefined>(
        queryKey,
        (oldQueryData) => {
          if (oldQueryData) {
            const updatedArray = oldQueryData.chapters.filter(
              (chapter) => chapter.chapterId !== data.chapterInfo.chapterId
            );
            return {
              ...oldQueryData,
              chapters: updatedArray,
              maxOrder: updatedArray[0]?.order ?? 0,
            };
          }
        }
      );
      setTimeout(() => {
        navigate(`/cards/${data.chapterInfo.deckId}`, { replace: true });
      }, 50);

      return { previousChaptersQueryData };
    },
    onSuccess: (serverResponse, payload) => {
      undoChapterDataRef.current = {
        ...payload?.chapterInfo,
        deletedBatchId: serverResponse.deletedBatchId,
      };

      showToast({
        message: "Chapter deleted successfully!",
        severity: "success",
        autoHideDuration: 7000,
        position: "bottom-right",
        buttonText: "Undo",
        buttonHandler: handleUndoChapterButtonClick,
      });
      handlePlayAudio("deletedSuccessfully", "/cards");
    },
    onError: (error) => {
      showToast({
        message: error?.message || "Error deleting chapter",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
    },
    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, mutationData, context) => {
      const queryKey = ["chapters", mutationData.chapterInfo.deckId];
      if (error) {
        queryClient.setQueryData(queryKey, context?.previousChaptersQueryData);

        // if (mutationData?.searchParams && context?.previousSearchResult) {
        //   queryClient.setQueryData(
        //     [
        //       "searchResult",
        //       mutationData.searchParams?.query,
        //       mutationData?.searchParams?.page,
        //     ],
        //     context?.previousSearchResult
        //   );
        // }
      }

      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
};

export default useDeleteChapter;

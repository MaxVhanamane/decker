import { request } from "../../utils/fetch-utils";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type {
  CardListType,
  DeckCardSearchResult,
  SearchResponse,
  UndoCardPayloadData,
} from "../../types/types";
import { CustomError } from "../../utils/customError";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useContext, useRef } from "react";
import { AudioContext } from "../../context/AudioContext";
import { Descendant } from "slate";
import useUndoCard from "./useUndoCard";
import { OfflineContext } from "../../context/OfflineContext";

type SuccessResponseType = {
  success: boolean;
};

type DeleteCardPayloadType = {
  deckId: string;
  cardInfo: {
    note: Descendant[];
    cardId: string;
    createdAt: string;
    order: number;
  };
  searchParams?: {
    query: string;
    page: number;
  };
};

const deleteCard = async (
  payload: DeleteCardPayloadType
): Promise<SuccessResponseType> => {
  try {
    const data = await request.delete(
      `/card/${payload.deckId}/${payload.cardInfo?.cardId}/${payload.cardInfo?.order}`
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

const useDeleteCard = () => {
  const queryClient = useQueryClient();
  const { showToast } = useContext(ShowToastContext);
  const { handlePlayAudio, isPlayingAudioAllowed } = useContext(AudioContext);
  const undoCardDataRef = useRef<null | UndoCardPayloadData>(null);
  const { mutate: undoCardItem } = useUndoCard();
  const { isOnline } = useContext(OfflineContext);

  const handleUndoCardButtonClick = () => {
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
    if (undoCardDataRef.current) {
      undoCardItem(undoCardDataRef.current);
    }
  };

  return useMutation({
    mutationFn: deleteCard,
    onMutate: async (data: DeleteCardPayloadType) => {
      undoCardDataRef.current = {
        deckId: data.deckId,
        content: data.cardInfo,
      };
      await queryClient.cancelQueries({
        queryKey: ["cards", data.deckId],
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

      const previousCardQueryData: CardListType | undefined =
        queryClient.getQueryData(["cards", data.deckId]);

      queryClient.setQueryData<CardListType | undefined>(
        ["cards", data.deckId],
        (oldQueryData) => {
          if (oldQueryData) {
            const updatedArray = oldQueryData.cards.filter(
              (card) => card.order !== data.cardInfo.order
            );
            return { ...oldQueryData, cards: updatedArray };
          }
        }
      );

      // update search result
      let previousSearchResult: SearchResponse | undefined;
      if (data.searchParams) {
        previousSearchResult = queryClient.getQueryData([
          "searchResult",
          data.searchParams.query,
          data?.searchParams.page,
        ]);

        queryClient.setQueryData<SearchResponse>(
          ["searchResult", data.searchParams.query, data?.searchParams.page],
          (oldQueryData) => {
            if (oldQueryData) {
              if (!oldQueryData) return;
              const deepCopiedDecks: SearchResponse = JSON.parse(
                JSON.stringify(oldQueryData)
              );
              let indexOfDeletedCard = -1;
              let deletedCard: DeckCardSearchResult | undefined;

              const modifiedData = deepCopiedDecks?.data?.results.filter(
                (obj, index) => {
                  const isTargetCard =
                    obj.type === "deck-card" &&
                    obj.cardId === data?.cardInfo?.cardId;

                  if (isTargetCard) {
                    indexOfDeletedCard = index;
                    deletedCard = obj;
                  }

                  return !isTargetCard;
                }
              );

              if (
                data.searchParams &&
                indexOfDeletedCard !== -1 &&
                deletedCard
              ) {
                undoCardDataRef.current = {
                  deckId: data.deckId,
                  content: data.cardInfo,
                  searchParams: {
                    ...data.searchParams,
                    undoCardDetails: deletedCard,
                    indexOfCardInSearchResult: indexOfDeletedCard,
                  },
                };
              }

              return {
                ...deepCopiedDecks,
                data: { ...deepCopiedDecks.data, results: modifiedData },
              };
            }
          }
        );
      }

      return { previousCardQueryData, previousSearchResult };
    },
    onSuccess: () => {
      showToast({
        message: "Card deleted successfully!",
        severity: "success",
        autoHideDuration: 7000,
        position: "bottom-right",
        buttonText: "Undo",
        buttonHandler: handleUndoCardButtonClick,
      });
      if (isPlayingAudioAllowed) {
        handlePlayAudio("deletedSuccessfully", "/cards");
      }
    },
    onError: (error) => {
      showToast({
        message: error?.message || "Error deleting card",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
    },
    // As we can get error data in onSettled we can directly handle error in the onSettled function by using if.
    onSettled: (serverData, error, mutationData, context) => {
      if (error) {
        queryClient.setQueryData(
          ["cards", mutationData.deckId],
          context?.previousCardQueryData
        );

        if (mutationData?.searchParams && context?.previousSearchResult) {
          queryClient.setQueryData(
            [
              "searchResult",
              mutationData.searchParams?.query,
              mutationData?.searchParams?.page,
            ],
            context?.previousSearchResult
          );
        }
      }

      //As searchResult data might be large in size, we won't invalidate it every time a user deletes a card to prevent frequent transfer of big data. We will only do optimistic updates instead.

      queryClient.invalidateQueries({
        queryKey: ["cards", mutationData.deckId],
      });
    },
  });
};

export default useDeleteCard;

import { request } from "../../utils/fetch-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  DeckItemType,
  DeckType,
  DeleteDeckPayload,
  DeleteDeckResponseType,
  SearchResponse,
  UndoDeckType,
} from "../../types/types";
import { CustomError } from "../../utils/customError";
import { DndFilterContext } from "../../context/DndItemContext";
import { useContext } from "react";
import useUndoDeck from "./useUndoDeck";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { OfflineContext } from "../../context/OfflineContext";
import { useAudio } from "../../context/AudioContext";

const deleteDeck = async ({
  deckId,
}: DeleteDeckPayload): Promise<DeleteDeckResponseType | CustomError> => {
  try {
    const data = await request.delete(`/api/v1/decks/${deckId}`);

    return data?.data;
  } catch (error) {
    if (error instanceof CustomError) {
      throw new CustomError(error?.message, error?.statusCode);
    } else {
      throw new CustomError("Something went wrong!", 503);
    }
  }
};

const useDeleteDeck = () => {
  const { setDeckIdToFilterOnDragOverDeleteArea } =
    useContext(DndFilterContext);
  const { mutate: undoDeckItem } = useUndoDeck();
  const { showToast } = useContext(ShowToastContext);
  const { isOnline } = useContext(OfflineContext);
  const { handlePlayAudio } = useAudio();
  const queryClient = useQueryClient();
  let deletedDeckItem: UndoDeckType | null = null;
  return useMutation({
    mutationFn: deleteDeck,
    onMutate: async (payload: DeleteDeckPayload) => {
      // onMutate runs before sending the request to the server. Here we assume that everything is going to be fine.
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      if (payload.searchParams) {
        await queryClient.cancelQueries({
          queryKey: [
            "searchResult",
            payload.searchParams.query,
            payload.searchParams.page,
          ],
        });
      }

      const previousQueryData: DeckType = queryClient.getQueryData(["decks"])!;
      queryClient.setQueryData(
        ["decks"],
        (oldQueryData: DeckType | undefined) => {
          if (oldQueryData) {
            const newData = oldQueryData?.decks.filter((deck: DeckItemType) => {
              if (deck.deckId === payload.deckId) {
                deletedDeckItem = {
                  ...deck,
                };
              }
              return deck.deckId != payload.deckId;
            });
            return { ...oldQueryData, decks: newData };
          }
        },
      );

      //update search result
      let previousSearchResult: SearchResponse | undefined;
      if (payload.searchParams) {
        previousSearchResult = queryClient.getQueryData<SearchResponse>([
          "searchResult",
          payload.searchParams.query,
          payload.searchParams.page,
        ]);

        if (previousSearchResult) {
          queryClient.setQueryData<SearchResponse>(
            [
              "searchResult",
              payload.searchParams.query,
              payload.searchParams.page,
            ],
            (oldQueryData) => {
              if (oldQueryData) {
                const newResults = oldQueryData.data?.results?.filter(
                  (deck, index) => {
                    if (
                      deck.type === "deck" &&
                      deck.deckId === payload.deckId
                    ) {
                      if (deletedDeckItem) {
                        deletedDeckItem = {
                          ...deletedDeckItem,
                          indexOfDeletedDeckSearchResult: index,
                          searchParams: payload.searchParams,
                        };
                      } else {
                        // Suppose that while deleting the deck from the search results, the ["decks"] cache has expired.
                        // In that case, deletedDeckItem will be null, so the if logic won't run.
                        // We'll handle that scenario here in the else block.

                        deletedDeckItem = {
                          ...deck,
                          indexOfDeletedDeckSearchResult: index,
                          searchParams: payload.searchParams,
                        };
                      }
                    }
                    return !(
                      deck.type === "deck" && deck.deckId === payload.deckId
                    );
                  },
                );

                return {
                  ...oldQueryData,
                  data: { ...oldQueryData.data, results: newResults },
                };
              }
            },
          );
        }
      }

      // Return previous data so that if something goes wrong we can use this in onError method
      // you can pass it in object or you can pass it directly like I did above in create deck
      return {
        previousQueryData,
        previousSearchResult,
        deletedDeckItem,
      };
    },

    onSuccess: (_data, _payload, context) => {
      if (context?.deletedDeckItem) {
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
        const nonNullDeckItem = context?.deletedDeckItem;
        showToast({
          message: "Deck deleted successfully!",
          severity: "success",
          autoHideDuration: 7000,
          position: "bottom-right",
          buttonText: "Undo",
          buttonHandler: () => undoDeckItem(nonNullDeckItem),
        });

        setTimeout(() => {
          handlePlayAudio("deletedSuccessfully", "/");
        }, 100);
      }
    },

    onError: (_error, payload, context) => {
      // I have returned the previous query data in onMutate function I can receive that data in context. I can use that data to
      // reverse what I have done in onMutate because onMutate runs before request goes to server there I have assumed that
      // Everthing will be fine on the server and I did optimistic updates in onMutate function. If some error occures I will
      // reverse that here using previousQuery data

      queryClient.setQueryData(["decks"], context?.previousQueryData);
      if (payload?.searchParams) {
        queryClient.setQueryData(
          [
            "searchResult",
            payload.searchParams.query,
            payload.searchParams.page,
          ],
          context?.previousSearchResult,
        );
      }
    },

    // onSettled is called in the end it doesnt matter if the mutation is successful or failed it will be called everytime. After doing above operations we will refetch the data. so that our data and the data in the db will be in sync.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      setDeckIdToFilterOnDragOverDeleteArea(null);
    },
  });
};

export default useDeleteDeck;

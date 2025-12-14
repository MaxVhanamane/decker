import { memo, useCallback, useContext, useState } from "react";
import { DeckSearchResult, DeckType } from "../../types/types";
import DeckItem from "../deck/DeckItem";
import { generateKeyBetween } from "fractional-indexing-jittered";
import { OfflineContext } from "../../context/OfflineContext";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import useGetDecks from "../../hooks/react-query/useGetDecks";
import usePinDeck from "../../hooks/react-query/usePinDeck";
import { useQueryClient } from "@tanstack/react-query";
import EditModalForDeck from "../deck/EditModalForDeck";
import { useModalBackNavigationHandler } from "../../hooks/utility/useModalBackNavigationHandler";
import { highlightText } from "../../functions/highlightText";
import { ThemeContext } from "../../context/ThemeContext";

type DeckItemsProps = {
  foundDecks: DeckSearchResult[];
  closeSearchBar: (deckId: string) => void;
  searchQuery: string;
  searchParams: {
    page: number;
    query: string;
  };
};

function DeckItems({
  foundDecks,
  searchParams,
  closeSearchBar,
  searchQuery,
}: DeckItemsProps) {
  const { theme } = useContext(ThemeContext);
  const { isOnline } = useContext(OfflineContext);
  const { showToast } = useContext(ShowToastContext);
  const { refetch } = useGetDecks({ enabled: false });
  const [editData, setEditData] = useState({ deckId: "", title: "" });
  const [openEditDeckModal, setOpenEditDeckModal] = useState(false);

  useModalBackNavigationHandler({
    isOpen: openEditDeckModal,
    modalKey: "editDeckInSearchResults",
    closeModal: () => setOpenEditDeckModal(false),
  });
  const { mutate: pinDeck } = usePinDeck();
  const queryClient = useQueryClient();
  const handlePin = useCallback(
    async (deckId: string, pinned: boolean) => {
      const queryKey = ["decks"];
      let decksData = queryClient.getQueryData<DeckType>(queryKey);

      // Fetch if cache is empty or GC'd
      if (!decksData) {
        const freshDecks = (await refetch()).data;
        decksData = freshDecks;
      }

      const relevantDecks =
        decksData?.decks.filter((deck) => deck.pinned === !pinned) ?? [];

      // Compute new order
      const firstDeckOrder =
        relevantDecks.length > 0 ? relevantDecks[0].order : null;
      const newOrder = generateKeyBetween(firstDeckOrder, null);

      pinDeck({ deckId, pinned: !pinned, searchParams, newOrder });
    },
    [pinDeck, searchParams, refetch, queryClient]
  );

  const handleEditDeck = useCallback(
    (deckId: string, title: string) => {
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
      setEditData({ ...editData, deckId, title });
      setOpenEditDeckModal(true);
    },
    [isOnline, showToast]
  );

  return (
    <>
      {foundDecks?.filter((deck) => deck.pinned === true).length > 0 && (
        <div className="lg:mt-4 lg:mb-10 animate-quickOpacity lg:mx-24">
          <p className="text-left text-sm text-gray-700 dark:text-gray-200 m-4">
            Pinned Decks
          </p>
          <div className="w-full flex items-center justify-center ">
            <div className="flex flex-row flex-wrap gap-2  justify-center items-center py-2 lg:w-[60rem] transition-all duration-1000">
              {foundDecks
                ?.filter((deck) => deck.pinned === true)
                .map((deck) => {
                  return (
                    <DeckItem
                      key={deck.deckId}
                      deck={deck}
                      handleEditDeck={handleEditDeck}
                      handlePin={handlePin}
                      highlightedTitle={highlightText(
                        deck.title,
                        searchQuery,
                        theme
                      )}
                      closeSearchBar={closeSearchBar}
                      searchParams={searchParams}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {foundDecks?.filter((deck) => deck.pinned === false).length > 0 && (
        <div
          className={`${
            foundDecks?.filter((deck) => deck.pinned === true).length > 0
              ? "mt-10"
              : "lg:mt-16 "
          }  lg:mb-10 animate-quickOpacity lg:mx-24`}
        >
          <p className="text-left text-sm text-gray-700 dark:text-gray-200 m-4">
            Other Decks
          </p>
          <div className="w-full flex items-center justify-center">
            <div className="flex flex-row flex-wrap gap-2  justify-center items-center py-2 lg:w-[60rem] transition-all duration-1000">
              {foundDecks
                ?.filter((deck) => deck.pinned === false)
                .map((deck) => {
                  return (
                    <DeckItem
                      key={deck.deckId}
                      deck={deck}
                      handleEditDeck={handleEditDeck}
                      handlePin={handlePin}
                      highlightedTitle={highlightText(
                        deck.title,
                        searchQuery,
                        theme
                      )}
                      closeSearchBar={closeSearchBar}
                      searchParams={searchParams}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      )}
      {openEditDeckModal ? (
        <EditModalForDeck
          setOpenEditDeckModal={setOpenEditDeckModal}
          editData={editData}
          setEditData={setEditData}
          searchParams={searchParams}
        />
      ) : null}
    </>
  );
}

export default memo(DeckItems);

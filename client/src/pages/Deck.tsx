import {
  FormEvent,
  useState,
  useRef,
  useContext,
  memo,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import useGetDecks from "../hooks/react-query/useGetDecks";
import useCreateDeck from "../hooks/react-query/useCreateDeck";
import usePinDeck from "../hooks/react-query/usePinDeck";
import EditModalForDeck from "../components/deck/EditModalForDeck";
import { Helmet } from "react-helmet";
import { OfflineContext } from "../context/OfflineContext";
import ErrorDisplay from "../components/ErrorDisplay";
import { CustomError } from "../utils/customError";
import { useAudio } from "../context/AudioContext";
import Bulb from "../components/Bulb";
import DeckItemsContainer from "../components/deck/DeckItemsContainer";
import DeckCreationForm from "../components/deck/DeckCreationForm";
import TrashCanDropZone from "../components/TrashCanDropZone";
import { ShowToastContext } from "../context/ToastNotificationContext";
import { DndSettersContext, DndStateContext } from "../context/DndItemContext";
import type { DeckItemType } from "../types/types";
import { v4 as uuidv4 } from "uuid";
import { useModalBackNavigationHandler } from "../hooks/utility/useModalBackNavigationHandler";
import NoContent from "../components/NoContent";
import useToastOnError from "../hooks/utility/useToastOnError";
import { DeckContext } from "../context/DeckContext";
import DeckSkeleton from "../components/deck/skeleton/DeckSkeleton";
import { getDeckSkeletonCounts } from "../utils/deckUtils";
import LoadingCentered from "../components/Loading/LoadingCentered";
import { generateKeyBetween } from "fractional-indexing-jittered";
import { AnimatePresence } from "motion/react";

function Deck() {
  const { showToast } = useContext(ShowToastContext);
  const { allDecksState } = useContext(DndStateContext);
  const { setAllDecksState } = useContext(DndSettersContext);
  const { deckContainerRef } = useContext(DeckContext);
  const { isOnline } = useContext(OfflineContext);
  const { handlePlayAudio } = useAudio();
  const { data: allDecks, error, isError, isLoading } = useGetDecks();
  const {
    mutate: createDeck,
    isError: isCreateDeckError,
    error: createDeckError,
    reset: resetCreateDeckResponse,
  } = useCreateDeck();

  const { mutate: pinDeck } = usePinDeck();

  const [isDecksStateReady, setIsDecksStateReady] = useState(false);
  const [openEditDeckModal, setOpenEditDeckModal] = useState<boolean>(false);
  const [editData, setEditData] = useState({ deckId: "", title: "" });

  const inputRefElement = useRef<HTMLInputElement>(null);
  const pinnedDecksRef = useRef<DeckItemType[]>([]);
  const otherDecksRef = useRef<DeckItemType[]>([]);
  // Don't show an error screen if it is due to aborting the request.
  const isCancelledError = error?.message === "CancelledError";

  const DeckSkeletonCounts = getDeckSkeletonCounts();

  useModalBackNavigationHandler({
    isOpen: openEditDeckModal,
    modalKey: "editDeck",
    closeModal: () => setOpenEditDeckModal(false),
  });

  useToastOnError({
    isError: isCreateDeckError,
    error: createDeckError,
    resetFunction: resetCreateDeckResponse,
  });

  useEffect(() => {
    if (allDecks) {
      setIsDecksStateReady(true);
      setAllDecksState(allDecks);
    }
  }, [allDecks]);

  const pinnedDecks = useMemo(() => {
    const newPinnedDecks =
      allDecksState?.decks?.filter((deck) => deck.pinned) ?? [];

    // Compare with the previous value stored in the ref
    if (
      JSON.stringify(newPinnedDecks) !== JSON.stringify(pinnedDecksRef.current)
    ) {
      pinnedDecksRef.current = newPinnedDecks; // Update the ref with the new value
      return newPinnedDecks; // Return the new reference if it has changed
    }

    return pinnedDecksRef.current; // Keep the previous reference if no change
  }, [allDecksState]);

  const otherDecks = useMemo(() => {
    const newOtherDecks =
      allDecksState?.decks?.filter((deck) => !deck.pinned) ?? [];
    // Compare with the previous value stored in the ref
    if (
      JSON.stringify(newOtherDecks) !== JSON.stringify(otherDecksRef.current)
    ) {
      otherDecksRef.current = newOtherDecks; // Update the ref with the new value
      return newOtherDecks; // Return the new reference if it has changed
    }

    return otherDecksRef.current; // Keep the previous reference if no change
  }, [allDecksState]);

  useEffect(() => {
    if (pinnedDecks.length > 0 || otherDecks.length > 0) {
      localStorage.setItem(
        "DeckSkeletonCounts",
        JSON.stringify({
          pinned: pinnedDecks.length,
          others: otherDecks.length,
        }),
      );
    }
  }, [pinnedDecks, otherDecks]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      //If I don't use trim(), user can create the deck using white spaces. the trim() method is used to remove any leading and trailing white spaces from the string str.
      e.preventDefault();

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

      if (inputRefElement.current!.value.trim().length > 0) {
        const deckId = uuidv4();

        createDeck(
          {
            title: inputRefElement.current!.value,
            deckId,
          },
          {
            onSuccess: () => {
              setTimeout(() => {
                handlePlayAudio("createdSuccessfully", "/");
              }, 100);
            },
          },
        );

        inputRefElement.current!.value = "";
      } else {
        inputRefElement.current!.value = "";

        showToast({
          message: "The deck title should be at least one character long.",
          severity: "warning",
          autoHideDuration: 4000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
          animatedText: true,
          progressBar: "hide",
        });
      }
    },
    [isOnline, inputRefElement, createDeck, handlePlayAudio],
  );

  const handlePin = useCallback(
    async (deckId: string, pinned: boolean) => {
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
      let newOrder: string;
      if (!pinned) {
        if (pinnedDecks.length === 0) {
          newOrder = generateKeyBetween(null, null);
        } else {
          newOrder = generateKeyBetween(pinnedDecks[0].order, null);
        }
      } else {
        if (otherDecks.length === 0) {
          newOrder = generateKeyBetween(null, null);
        } else {
          newOrder = generateKeyBetween(otherDecks[0].order, null);
        }
      }

      pinDeck({ deckId, pinned: !pinned, newOrder });
    },
    [isOnline, pinDeck, pinnedDecks, otherDecks],
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
    [isOnline, editData],
  );

  if (isError && !isCancelledError) {
    return (
      <ErrorDisplay
        message={error?.message}
        status={(error as CustomError)?.statusCode}
      >
        <button
          onClick={() => window.location.reload()}
          className=" mt-4 inline-block py-2.5 font-medium text-sm leading-tight rounded active:shadow-lg text-gray-50 w-[7.3rem] bg-sky-600 hover:bg-sky-700 transition-colors duration-150 ease-in-out "
          type="button"
          aria-label="Refresh"
        >
          Refresh
        </button>
      </ErrorDisplay>
    );
  }

  if ((isLoading || !isDecksStateReady) && !DeckSkeletonCounts) {
    return <LoadingCentered />;
  }

  return (
    <>
      <Helmet>
        <title>Decks</title>
        {/* here h-[calc(100vh-64px)] 64px is the navbar height */}
      </Helmet>
      <div
        ref={deckContainerRef}
        className="flex flex-col gap-2 pt-8 pb-12  overflow-y-auto overflow-x-hidden scrollbar-gutter h-[calc(100vh-64px)] dark:dark-scrollbar light-scrollbar w-full items-center"
      >
        <Bulb />
        <DeckCreationForm handleSubmit={handleSubmit} ref={inputRefElement} />

        {(isLoading || !isDecksStateReady) &&
          DeckSkeletonCounts &&
          DeckSkeletonCounts?.pinned > 0 && (
            <DeckSkeleton
              skeletonCount={DeckSkeletonCounts.pinned}
              title="Pinned"
            />
          )}

        {(isLoading || !isDecksStateReady) &&
          DeckSkeletonCounts &&
          DeckSkeletonCounts?.others > 0 && (
            <DeckSkeleton
              skeletonCount={DeckSkeletonCounts.others}
              title="Others"
            />
          )}

        {allDecksState &&
        !("message" in allDecksState) &&
        pinnedDecks.length > 0 ? (
          <DeckItemsContainer
            allDecks={pinnedDecks}
            handlePin={handlePin}
            handleEditDeck={handleEditDeck}
            heading="Pinned"
          />
        ) : null}

        {allDecksState &&
        !("message" in allDecksState) &&
        otherDecks.length > 0 ? (
          <DeckItemsContainer
            allDecks={otherDecks}
            handlePin={handlePin}
            handleEditDeck={handleEditDeck}
            heading={pinnedDecks.length > 0 ? "Others" : "Decks"}
          />
        ) : null}
        <AnimatePresence>
          {openEditDeckModal ? (
            <EditModalForDeck
              setOpenEditDeckModal={setOpenEditDeckModal}
              editData={editData}
              setEditData={setEditData}
            />
          ) : null}
        </AnimatePresence>
        {allDecks?.decks.length === 0 && (
          <NoContent
            heading="Looks like you haven't added any decks yet."
            subheading="Create a new deck to get started."
            imageSource="/illustrations/no_decks_found.svg"
            imageClassNames="w-56 h-44 lg:w-64 lg:h-52"
            imageAltText="No decks found!"
          />
        )}
        <TrashCanDropZone
          droppableId="DeckDeleteArea"
          altText="Trash can for deleting deck"
        />
      </div>
    </>
  );
}

export default memo(Deck);

// useEffect(() => {
//   // To avoid a weird cut in the modal bottom, we will set overflow to hidden when edit modal is open. This is because on mobile phones, when the address bar hides and shows when you scroll, it changes the height of the screen, causing the layout to sometimes shift weirdly.
//   if (openEditDeckModal) {
//     // This prevents layout shifts caused by the scrollbar. When I set overflow: hidden on the body, it removes the scrollbar when the modal is open. When the modal is closed, the scrollbar reappears as I set overflow back to auto, which causes a layout shift. To prevent this, I add padding-right.
//     const scrollbarWidth =
//       window.innerWidth - document.documentElement.clientWidth;
//     document.body.style.paddingRight = `${scrollbarWidth - 1}px`;
//     document.body.style.overflow = "hidden";
//   }
//   return () => {

//     document.body.style.overflow = "auto";
//     document.body.style.paddingRight = "";
//   };
// }, [openEditDeckModal]);

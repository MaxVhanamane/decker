import {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback,
  memo,
  useMemo,
} from "react";
import useGetCards from "../hooks/react-query/useGetCards";
import useCreateCard from "../hooks/react-query/useCreateCard";
import useEditCard from "../hooks/react-query/useEditCard";
import { useStableNavigate } from "../context/StableNavigateContext";
import { useStableParams } from "../context/stableParamsContext";
import useDeleteCard from "../hooks/react-query/useDeleteCard";
import useToastOnError from "../hooks/utility/useToastOnError";
import { Helmet } from "react-helmet";
import type { CardContentType, ContentTypeForEdit } from "../types/types";
import { OfflineContext } from "../context/OfflineContext";
import ErrorDisplay from "../components/ErrorDisplay";
import { v4 as uuidv4 } from "uuid";
import EditCard from "../components/card/EditCard";
import { searchContext } from "../context/SearchContext";
import CardToolbar from "../components/card/toolbar/CardToolbar";
import { CustomError } from "../utils/customError";
import { AudioContext } from "../context/AudioContext";
import CardInput from "../components/card/CardInput";
import TrashCanDropZone from "../components/TrashCanDropZone";
import { CardContext } from "../context/CardContext";
import { ShowToastContext } from "../context/ToastNotificationContext";
import CardContainer from "../components/card/CardContainer";
import { DndSettersContext, DndStateContext } from "../context/DndItemContext";
import Bulb from "../components/Bulb";
import { useModalBackNavigationHandler } from "../hooks/utility/useModalBackNavigationHandler";
import ConfirmationModal from "../components/ConfirmationModal";
import NoContent from "../components/NoContent";
import { Descendant } from "slate";
import FullScreenCardView from "../components/card/FullScreenCardView";
import { twMerge } from "tailwind-merge";
import debounce from "lodash/debounce";
import { hasValidNoteContent } from "../utils/editor/hasValidNoteContent";
import { usePrismTheme } from "../hooks/utility/usePrismTheme";
import { ThemeContext } from "../context/ThemeContext";
import { useIsDeviceType } from "../hooks/utility/useIsDeviceType";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import CardsSkeleton from "../components/card/skeleton.tsx/CardsSkeleton";
import ChaptersSidebar from "../components/chapters/ChaptersSidebar";
import { getDeckInfo } from "../functions/deckDataManager";

// const Tips = lazy(() => import("../components/card/Tips"));

type ContentTypeForPayload = {
  note: Descendant[];
  cardId: string;
};

type ContentForFullScreen = CardContentType;

type PayloadType = {
  deckId: string;
  content: ContentTypeForPayload;
  maxOrder: number;
  chapterId?: string;
};
type CardsProps = {
  mode: "deck" | "chapter";
};
const Cards = ({ mode }: CardsProps) => {
  const { deckId, chapterId } = useStableParams();
  const { animateSearchBar } = useContext(searchContext);
  const { showToast } = useContext(ShowToastContext);
  const { isOnline } = useContext(OfflineContext);
  const { isPlayingAudioAllowed, handlePlayAudio } = useContext(AudioContext);
  const { allCardsState } = useContext(DndStateContext);
  const { setAllCardsState } = useContext(DndSettersContext);
  const { theme } = useContext(ThemeContext);
  const { setShouldTrashCanRotate, setUndoCardId } = useContext(CardContext);
  const { mutate: deleteCard } = useDeleteCard();
  const { state } = useLocation();
  const {
    data,
    isError,
    error,
    isLoading,
    isFetching: isFetchingCards,
  } = useGetCards(deckId!, mode, chapterId);
  const maxOrder = data?.maxOrder ? data?.maxOrder : 0;
  const isCancelledError = error?.message === "CancelledError";

  const {
    mutate: addCard,
    reset: resetCreateCardResponse,
    isError: isCreateCardError,
    error: createCardError,
    isPending: isCreatingCard,
  } = useCreateCard();
  const {
    mutate: editCard,
    reset: resetEditCardResponse,
    isError: isEditCardError,
    error: editCardError,
  } = useEditCard();
  const [isCardsStateReady, setIsCardsStateReady] = useState(false);
  // const [note, setNote] = useState<Descendant[]>(initialValue);
  const [showTips, setShowTips] = useState(false);
  const [showEditModalForCard, setShowEditModalForCard] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [height, setHeight] = useState(() =>
    window.innerWidth < 640 ? 200 : 250
  );
  const [expandEditor, setExpandEditor] = useState(false);
  const [closeFullScreenWithAnimation, setCloseFullScreenWithAnimation] =
    useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const isSmallScreen = useIsDeviceType("phone");
  const isLargePhone = useIsDeviceType("tablet");
  const [modalState, setModalState] = useState({
    confirmCloseCardModal: {
      show: false,
      startClosingModalAnimation: false,
    },
    confirmDeleteCardModal: {
      show: false,
      startClosingModalAnimation: false,
    },
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [, setCloseTipsModal] = useState(false);
  const [showHyperlinkModal, setShowHyperlinkModal] = useState(false);
  const hasCards =
    allCardsState &&
    "cards" in allCardsState &&
    allCardsState?.cards?.length > 0;
  const [isNewChapter, setIsNewChapter] = useState(
    state?.isNewChapter ?? false
  );

  const [closeEditModalWithAnimation, setCloseEditModalWithAnimation] =
    useState(false);
  const [fullScreenCardData, setFullScreenCardData] =
    useState<ContentForFullScreen | null>(null);
  const [editContent, setEditContent] = useState<ContentTypeForEdit | null>(
    null
  );

  const richTextWrapperRef = useRef<HTMLDivElement>(null);
  const cardToDeleteRef = useRef<CardContentType | null>(null);
  const deckInfo = getDeckInfo();

  const navigate = useStableNavigate();
  usePrismTheme(theme);

  useToastOnError({
    isError: isCreateCardError,
    error: createCardError,
    resetFunction: resetCreateCardResponse,
  });

  useToastOnError({
    isError: isEditCardError,
    error: editCardError,
    resetFunction: resetEditCardResponse,
  });

  useEffect(() => {
    if (hasCards && isNewChapter) {
      setIsNewChapter(false);
    }
  }, [hasCards, isNewChapter]);

  useEffect(() => {
    if (data) {
      setIsCardsStateReady(true);
      setAllCardsState(data);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      setShouldTrashCanRotate((prev) => {
        if (prev) return false;
        return prev;
      });

      setUndoCardId((prev) => {
        if (prev) {
          return null;
        }
        return prev;
      });
    };
  }, []);

  useEffect(() => {
    if (
      showFullScreen ||
      modalState.confirmDeleteCardModal.show ||
      showEditModalForCard
    ) {
      // Close the keyboard on phones when the user opens modals or enters fullscreen card view.
      if (document?.activeElement === richTextWrapperRef?.current) {
        richTextWrapperRef?.current?.blur();
      }
    }
  }, [
    showFullScreen,
    modalState.confirmDeleteCardModal.show,
    showEditModalForCard,
  ]);

  useModalBackNavigationHandler({
    isOpen: showEditModalForCard,
    modalKey: "editModalForCard",
    closeModal: () => setCloseEditModalWithAnimation(true),
  });

  useModalBackNavigationHandler({
    isOpen: modalState.confirmDeleteCardModal.show,
    modalKey: "confirmDeleteModalForCard",
    closeModal: () =>
      setModalState((prev) => ({
        ...prev,
        confirmDeleteCardModal: {
          show: true,
          startClosingModalAnimation: true,
        },
      })),
  });
  useModalBackNavigationHandler({
    isOpen: showFullScreen,
    modalKey: "showFullScreen",
    closeModal: () => setCloseFullScreenWithAnimation(true),
  });

  useModalBackNavigationHandler({
    isOpen: showTips,
    modalKey: "showTips",
    closeModal: () => setCloseTipsModal(true),
  });

  useModalBackNavigationHandler({
    isOpen: modalState.confirmCloseCardModal.show,
    modalKey: "confirmCloseCardModal",
    closeModal: () =>
      setModalState((prev) => ({
        ...prev,
        confirmCloseCardModal: {
          show: true,
          startClosingModalAnimation: true,
        },
      })),
  });

  // If the user is on a large screen and expands the editor to its full height,
  // then opens DevTools, the height remains based on the large screen.
  // This can cause the textarea to extend beyond the visible area, requiring scrolling.
  // This useEffect prevents that by adjusting the height accordingly.
  useEffect(() => {
    const debouncedResize = debounce(() => {
      const maxHeight = window.innerHeight - 64 - 16 - 16 - 40;
      const maxHeightSmallScreen = maxHeight - 56;

      setHeight((prevHeight) => {
        if (isSmallScreen && prevHeight > maxHeightSmallScreen) {
          return maxHeightSmallScreen;
        } else if (!isSmallScreen && prevHeight > maxHeight) {
          return maxHeight;
        }
        return prevHeight;
      });
    }, 300);

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      debouncedResize.cancel?.(); // Cancel pending debounced calls
    };
  }, [isSmallScreen]);

  const discardNoteAndCloseTextEditor = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      confirmCloseCardModal: { startClosingModalAnimation: false, show: false },
    }));

    setExpandEditor(false);
    if (isSmallScreen) {
      setHeight(200);
    } else {
      setHeight(250);
    }
    if (data && "cards" in data && data?.cards?.length === 0) {
      setIsTransitioning(true);
    }
  }, [data]);

  const keepNoteAndContinueEditing = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      confirmCloseCardModal: { startClosingModalAnimation: false, show: false },
    }));
  }, []);

  const handleOnConfirmDeleteCard = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      confirmDeleteCardModal: {
        startClosingModalAnimation: false,
        show: false,
      },
    }));
    setShowFullScreen(false);
    const cardInfo = cardToDeleteRef.current!;
    deleteCard({
      deckId: deckId!,
      cardInfo,
      chapterId,
    });
  }, [deleteCard, deckId, chapterId]);

  const handleOnCancelDeleteCard = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      confirmDeleteCardModal: {
        startClosingModalAnimation: false,
        show: false,
      },
    }));
  }, []);

  const expandEditorToMaxHeight = useCallback(() => {
    const editor = richTextWrapperRef.current;
    // maxHeight=window.innerHeight-navbarHeight-marginTop-marginBtm-toolbarHeight
    const maxHeightForTextArea = isSmallScreen
      ? window.innerHeight - 64 - 16 - 16 - 40 - 56
      : window.innerHeight - 64 - 16 - 16 - 40;
    if (editor && maxHeightForTextArea > editor.clientHeight) {
      setHeight((previousHeight) => {
        return maxHeightForTextArea > previousHeight
          ? maxHeightForTextArea
          : previousHeight;
      });
    }
  }, [isSmallScreen]);

  const handleCloseTextEditor = useCallback(
    (note: Descendant[]) => {
      if (hasValidNoteContent(note)) {
        setModalState((prev) => ({
          ...prev,
          confirmCloseCardModal: {
            show: true,
            startClosingModalAnimation: false,
          },
        }));
      } else {
        setExpandEditor(false);
        if (isSmallScreen) {
          setHeight(200);
        } else {
          setHeight(250);
        }

        if (data && "cards" in data && data?.cards?.length === 0) {
          setIsTransitioning(true);
        }
      }
    },
    [data, isSmallScreen]
  );
  // onClick handlers
  const handleCreateCard = useCallback(
    (
      resetEditor: () => void,
      restoreUnsavedContent: (newNote: Descendant[]) => void,
      note: Descendant[]
    ) => {
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

      if (isCreatingCard) {
        showToast({
          message:
            "Your previous card is being saved to the server. Please wait a moment...",
          severity: "info",
          autoHideDuration: 5000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
        });

        return;
      }

      if (hasValidNoteContent(note)) {
        const content = {
          note,
          cardId: uuidv4(),
        };
        const currentNote = note;
        const heightVal = height;
        const payload: PayloadType = {
          deckId: deckId!,
          content,
          maxOrder,
          chapterId,
        };
        addCard(payload, {
          //While saving the card, if an error occurs, we will retrieve the cleared card information and show it again so that the user doesn't lose the created card details.
          onError: () => {
            // we don't have to call setNote value here as restoreUnsavedContent function calls onChange that sets the setNote to the correct value
            setHeight(heightVal);
            restoreUnsavedContent(currentNote);
          },
        });
        resetEditor();

        setHeight(250);
        if (isPlayingAudioAllowed) {
          setTimeout(() => {
            handlePlayAudio("createdSuccessfully", "/cards");
          }, 100);
        }
      } else {
        showToast({
          message: "Title or note should contain one or more characters!",
          severity: "warning",
          autoHideDuration: 5000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
        });
      }
    },
    [
      deckId,
      height,
      chapterId,
      isCreatingCard,
      isFetchingCards,
      isPlayingAudioAllowed,
      isOnline,
      maxOrder,
    ]
  );
  const handleShowFullScreen = useCallback((card: ContentForFullScreen) => {
    setShowFullScreen(true);
    setFullScreenCardData({ ...card });
  }, []);

  const handleDelete = useCallback(() => {
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
    if (fullScreenCardData) {
      cardToDeleteRef.current = fullScreenCardData;
      setModalState((prev) => ({
        ...prev,
        confirmDeleteCardModal: {
          startClosingModalAnimation: false,
          show: true,
        },
      }));
    }
  }, [isOnline, fullScreenCardData]);

  const handleEditCardButtonClick = useCallback(
    (cardItem: ContentTypeForEdit) => {
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
      setEditContent(cardItem);
      setShowEditModalForCard(true);
    },
    [isOnline, showToast]
  );

  const handleSaveEdit = useCallback(() => {
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
    if (editContent) {
      const contentWithCardIndex = { ...editContent };

      const { cardId, note } = {
        ...editContent,
      };
      let data = {
        deckId: deckId!,
        newContent: { note },
        cardId,
        chapterId,
      };

      let fullScreenCardDataCache = fullScreenCardData;

      if (editContent && hasValidNoteContent(editContent.note)) {
        // If the user saves the edited card and encounters an error during the saving process, this causes the user to lose all the data they created. This is because once the user clicks on the 'Save Card' button, I clear the edited content from the state and close the edit modal. To prevent data loss on error, we will open the modal again and show the lost data.

        editCard(data, {
          onError: () => {
            setEditContent(contentWithCardIndex),
              setShowEditModalForCard(true),
              setCloseEditModalWithAnimation(false);
            // If some error occures while saving the edited data we will also reset the fullscreen card data to the old data.
            if (showFullScreen && fullScreenCardDataCache) {
              setFullScreenCardData({ ...fullScreenCardDataCache });
            }
          },
        });
        setCloseEditModalWithAnimation(true);

        // If the user opens the full screen card view and then clicks on the edit card button, we will display the updated data on full screen once the user saves the edited card.

        if (showFullScreen) {
          // Last time, when this function was created, it captured the value of the editContent state, and now we have that value available in the editContent here.
          setFullScreenCardData({ ...editContent });
        }
      } else {
        showToast({
          message: "Title or note should contain one or more characters!",
          severity: "warning",
          autoHideDuration: 5000,
          position: "top-center",
          animationStyle: "scale-up",
          theme: "auto",
        });
      }
    }
  }, [
    showFullScreen,
    showToast,
    chapterId,
    editCard,
    editContent,
    isOnline,
    fullScreenCardData,
  ]);

  const handleTransitionEnd = useCallback(() => {
    if (data && "cards" in data && data?.cards?.length === 0) {
      setIsTransitioning(false);
    }
  }, [data]);

  const computedTransform = useMemo(() => {
    if (expandEditor) {
      return isLargePhone
        ? height === 200
          ? "translateY(100px)"
          : `translateY(${height - 90}px)`
        : height === 250
        ? "translateY(120px)"
        : `translateY(${height - 120}px)`;
    } else {
      return `translateY(${isLargePhone ? "-66px" : "-80px"})`;
    }
  }, [expandEditor, height, isLargePhone]);

  const cardToolbar = useMemo(
    () => (
      <CardToolbar
        setShowTips={setShowTips}
        expandEditorToMaxHeight={expandEditorToMaxHeight}
        handleCloseTextEditor={handleCloseTextEditor}
        isCreatingCard={isCreatingCard}
        handleCreateCard={handleCreateCard}
        isFetchingCards={isFetchingCards}
        tabbable={expandEditor}
        setShowHyperlinkModal={setShowHyperlinkModal}
        mode="create"
      />
    ),
    [
      setShowTips,
      expandEditorToMaxHeight,
      handleCloseTextEditor,
      isCreatingCard,
      isFetchingCards,
      expandEditor,
      setShowHyperlinkModal,
    ]
  );

  if (isError && !isCancelledError) {
    return (
      <ErrorDisplay
        message={error?.message}
        status={(error as CustomError)?.statusCode}
      >
        <button
          onClick={() => navigate("/")}
          className=" mt-4  inline-block  py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-[7.3rem]  bg-sky-600 hover:bg-sky-700 transition-colors duration-200  "
          type="button"
          aria-label="Home"
        >
          Home
        </button>
      </ErrorDisplay>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {animateSearchBar
            ? "Search result"
            : mode === "deck"
            ? "Top-level deck cards"
            : "Chapter-cards"}
        </title>
      </Helmet>

      {/* {showTips && (
        <Suspense fallback={<Loading />}>
          <Tips
            setShowTips={setShowTips}
            closeTipsModal={closeTipsModal}
            setCloseTipsModal={setCloseTipsModal}
          />
        </Suspense>
      )} */}

      {createPortal(
        <ChaptersSidebar />,
        document.getElementById("chapters-portal")!
      )}
      <div
        className="relative flex flex-col gap-2 w-full overflow-y-auto overflow-x-hidden dark:dark-scrollbar light-scrollbar scrollbar-gutter h-[calc(100vh-64px)]"
        id="cardsMainContainer"
      >
        <CardInput
          expandEditor={expandEditor}
          setExpandEditor={setExpandEditor}
          expandEditorToMaxHeight={expandEditorToMaxHeight}
          height={height}
          richTextWrapperRef={richTextWrapperRef}
          setShowHyperlinkModal={setShowHyperlinkModal}
          showHyperlinkModal={showHyperlinkModal}
          setHeight={setHeight}
          handleTransitionEnd={handleTransitionEnd}
        >
          {cardToolbar}
        </CardInput>

        <div
          className={twMerge(
            "flex items-center flex-col justify-center transition-transform duration-1000 lg:delay-[0s] will-change-transform",
            expandEditor ? "delay-0" : "delay-1000"
          )}
          style={{
            transform: computedTransform,
          }}
        >
          <h1 className="text-gray-500 mb-10 dark:text-gray-400 text-sm">
            {deckInfo.deckTitle?.length > 30
              ? deckInfo.deckTitle.slice(0, 30) + "…"
              : deckInfo.deckTitle}

            {deckInfo.chapterTitle && (
              <>
                {" "}
                &gt;{" "}
                {deckInfo.chapterTitle.length > 30
                  ? deckInfo.chapterTitle.slice(0, 30) + "…"
                  : deckInfo.chapterTitle}
              </>
            )}
          </h1>

          {!isNewChapter ? (
            !(isLoading || !isCardsStateReady) ? (
              <CardContainer
                handleEditCardButtonClick={handleEditCardButtonClick}
                handleShowFullScreen={handleShowFullScreen}
                cards={allCardsState?.cards || []}
              />
            ) : (
              <CardsSkeleton skeletonCount={5} />
            )
          ) : null}
        </div>
        {!isNewChapter &&
          !hasCards &&
          !expandEditor &&
          !isTransitioning &&
          !(isLoading || !isCardsStateReady) && (
            <NoContent
              imageSource="/illustrations/no_cards_found.svg"
              heading="Looks like you haven't added any cards yet."
              buttonLabel="Craft an Elegant Note"
              onButtonClick={() => {
                setExpandEditor(true);
                if (isPlayingAudioAllowed) {
                  setTimeout(() => {
                    handlePlayAudio("open", "/cards");
                  }, 100);
                }
              }}
              imageAltText="No cards found!"
            />
          )}
        {isNewChapter && (
          <NoContent
            imageSource="/illustrations/no_cards_found.svg"
            heading="Looks like you haven't added any cards yet."
            buttonLabel="Craft an Elegant Note"
            onButtonClick={() => {
              setExpandEditor(true);
              if (isPlayingAudioAllowed) {
                setTimeout(() => {
                  handlePlayAudio("open", "/cards");
                }, 100);
              }
            }}
            imageAltText="No cards found!"
          />
        )}
        {/* Here, I am placing the Bulb component after the CardContainer because transform or will-change creates a new stacking context, causing the Bulb to get hidden behind it. This makes it unclickable. However, placing the Bulb component after the CardContainer solves the problem. */}
        <Bulb shouldDimBulb={isSmallScreen && expandEditor} />
        <TrashCanDropZone
          droppableId="CardAndChapterDeleteArea"
          altText="Trash can for deleting card"
        />
      </div>

      {modalState.confirmCloseCardModal.show && (
        <ConfirmationModal
          message="Are you sure you want to close? The card you are creating will be lost."
          onCancel={keepNoteAndContinueEditing}
          onConfirm={discardNoteAndCloseTextEditor}
          showConfirmationModal={modalState.confirmCloseCardModal.show}
          startClosingModalAnimation={
            modalState.confirmCloseCardModal.startClosingModalAnimation
          }
        />
      )}
      {modalState.confirmDeleteCardModal.show && (
        <ConfirmationModal
          message="Are you sure you want to delete this card?"
          onCancel={handleOnCancelDeleteCard}
          onConfirm={handleOnConfirmDeleteCard}
          showConfirmationModal={modalState.confirmDeleteCardModal.show}
          startClosingModalAnimation={
            modalState.confirmDeleteCardModal.startClosingModalAnimation
          }
        />
      )}

      {showFullScreen && (
        <FullScreenCardView
          fullScreenCardData={fullScreenCardData}
          setShowFullScreen={setShowFullScreen}
          handleEditCardButtonClick={handleEditCardButtonClick}
          handleDelete={handleDelete}
          closeFullScreenWithAnimation={closeFullScreenWithAnimation}
          setCloseFullScreenWithAnimation={setCloseFullScreenWithAnimation}
          setShowScrollButtons={setShowScrollButtons}
          showScrollButtons={showScrollButtons}
        />
      )}
      {showEditModalForCard ? (
        <EditCard
          setShowEditModalForCard={setShowEditModalForCard}
          editContent={editContent}
          setEditContent={setEditContent}
          handleSaveEdit={handleSaveEdit}
          showEditModalForCard={showEditModalForCard}
          setCloseEditModalWithAnimation={setCloseEditModalWithAnimation}
          closeEditModalWithAnimation={closeEditModalWithAnimation}
        />
      ) : null}
    </>
  );
};

export default memo(Cards);

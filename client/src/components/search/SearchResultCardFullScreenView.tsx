import {
  useState,
  useContext,
  useEffect,
  useCallback,
  memo,
  Dispatch,
  SetStateAction,
} from "react";
import useEditCard from "../../hooks/react-query/useEditCard";
import { Helmet } from "react-helmet";
import { OfflineContext } from "../../context/OfflineContext";
import EditCard from "../card/EditCard";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useModalBackNavigationHandler } from "../../hooks/utility/useModalBackNavigationHandler";
import ConfirmationModal from "../ConfirmationModal";
import useToastOnError from "../../hooks/utility/useToastOnError";
import { Descendant } from "slate";
import FullScreenCardView from "../card/FullScreenCardView";
import type { ContentTypeForEdit } from "../../types/types";
import useDeleteCard from "../../hooks/react-query/useDeleteCard";

type PropType = {
  initialData: ContentForFullScreen;
  setOpenCardInFullScreen: Dispatch<SetStateAction<boolean>>;
  searchParams: {
    page: number;
    query: string;
  };
};

type ContentType = {
  note: Descendant[];
  cardId: string;
  createdAt: string;
  order: number;
};

type ContentForFullScreen = ContentType & {
  deckId: string;
};

const SearchResultCardFullScreenView = ({
  initialData,
  setOpenCardInFullScreen,
  searchParams,
}: PropType) => {
  const { showToast } = useContext(ShowToastContext);
  const { mutate: deleteCard } = useDeleteCard();
  const { isOnline } = useContext(OfflineContext);
  const [showEditModalForCard, setShowEditModalForCard] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(true);
  const [closeFullScreenWithAnimation, setCloseFullScreenWithAnimation] =
    useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [closeEditModalWithAnimation, setCloseEditModalWithAnimation] =
    useState(false);
  const [fullScreenCardData, setFullScreenCardData] =
    useState<Omit<ContentForFullScreen, "deckId">>(initialData);
  const [previousCardInfoForError, setPreviousCardInfoForError] =
    useState<ContentForFullScreen | null>(null);

  const { deckId } = initialData;
  const [editContent, setEditContent] = useState<ContentTypeForEdit | null>(
    null
  );
  const {
    mutate: editCard,
    reset: resetEditCardResponse,
    isError: isEditCardError,
    error: editCardError,
  } = useEditCard();

  // Refs

  const [modalState, setModalState] = useState({
    confirmDeleteCardModal: {
      show: false,
      startClosingModalAnimation: false,
    },
  });

  useModalBackNavigationHandler({
    isOpen: showFullScreen,
    modalKey: "showFullScreenSearch",
    closeModal: () => setCloseFullScreenWithAnimation(true),
  });
  useModalBackNavigationHandler({
    isOpen: modalState.confirmDeleteCardModal.show,
    modalKey: "confirmDeleteModalForCard",
    closeModal: () =>
      setModalState({
        confirmDeleteCardModal: {
          show: true,
          startClosingModalAnimation: true,
        },
      }),
  });

  useModalBackNavigationHandler({
    isOpen: showEditModalForCard,
    modalKey: "editDeckInSearchResults",
    closeModal: () => setCloseEditModalWithAnimation(true),
  });

  useEffect(() => {
    if (!showFullScreen) setOpenCardInFullScreen(false);
  }, [showFullScreen]);

  useToastOnError({
    isError: isEditCardError,
    error: editCardError,
    resetFunction: resetEditCardResponse,
    customFunction: () => {
      if (previousCardInfoForError) {
        setFullScreenCardData({ ...previousCardInfoForError });
      }
    },
  });

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

    setModalState({
      confirmDeleteCardModal: { show: true, startClosingModalAnimation: false },
    });
  }, [isOnline]);

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
    [isOnline]
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
    if (!editContent) {
      showToast({
        message: "Title or note should contain one or more characters!",
        severity: "warning",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      return;
    }

    const contentWithCardIndex = { ...editContent };
    const { cardId, note } = editContent;
    const data = {
      deckId: deckId!,
      newContent: { note },
      cardId: cardId!,
    };

    const fullScreenCardDataCache = fullScreenCardData;

    if (editContent.note.length > 0) {
      editCard(
        {
          ...data,
          searchParams: { ...searchParams, cardId: editContent.cardId },
        },
        {
          onError: () => {
            setEditContent(contentWithCardIndex),
              setShowEditModalForCard(true),
              setCloseEditModalWithAnimation(false);
            // If some error occures while saving the edited data we will also reset the fullscreen card data to the old data.
            if (showFullScreen) {
              setFullScreenCardData({
                ...fullScreenCardDataCache,
              } as ContentForFullScreen);
            }
          },
        }
      );
      setCloseEditModalWithAnimation(true);
      setPreviousCardInfoForError({
        ...fullScreenCardData,
      } as ContentForFullScreen);
      setFullScreenCardData({ ...editContent });
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
  }, [
    isOnline,
    showToast,
    showFullScreen,
    deckId,
    editContent,
    fullScreenCardData,
  ]);

  const handleOnConfirmDeleteCard = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      confirmDeleteCardModal: {
        startClosingModalAnimation: false,
        show: false,
      },
    }));
    setShowFullScreen(false);
    deleteCard({
      deckId: deckId!,
      cardInfo: {
        cardId: fullScreenCardData?.cardId,
        note: fullScreenCardData?.note,
        createdAt: fullScreenCardData?.createdAt,
        order: fullScreenCardData?.order,
      },
      searchParams,
    });
  }, [deleteCard, deckId, fullScreenCardData, searchParams]);

  const handleOnCancelDeleteCard = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      confirmDeleteCardModal: {
        startClosingModalAnimation: false,
        show: false,
      },
    }));
  }, []);

  return (
    <>
      <Helmet>
        <title>Search result</title>
        <meta
          name="description"
          content="View and manage the detailed information on our interactive cards. Each card contains information related to the particular card that you have created, all organized within their respective decks."
        />
      </Helmet>

      {showEditModalForCard ? (
        <EditCard
          setShowEditModalForCard={setShowEditModalForCard}
          showEditModalForCard={showEditModalForCard}
          editContent={editContent}
          setEditContent={setEditContent}
          handleSaveEdit={handleSaveEdit}
          closeEditModalWithAnimation={closeEditModalWithAnimation}
          setCloseEditModalWithAnimation={setCloseEditModalWithAnimation}
        />
      ) : null}

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
          fullScreenCardData={fullScreenCardData!}
          setShowFullScreen={setShowFullScreen}
          handleEditCardButtonClick={handleEditCardButtonClick}
          handleDelete={handleDelete}
          closeFullScreenWithAnimation={closeFullScreenWithAnimation}
          setCloseFullScreenWithAnimation={setCloseFullScreenWithAnimation}
          setShowScrollButtons={setShowScrollButtons}
          showScrollButtons={showScrollButtons}
        />
      )}
    </>
  );
};

export default memo(SearchResultCardFullScreenView);

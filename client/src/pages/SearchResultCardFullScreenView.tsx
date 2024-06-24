import {
  ChangeEvent,
  useState,
  useRef,
  useContext,
  MouseEvent,
  FC,
  useEffect,
  useCallback,
  memo,
} from "react";
import { useParams } from "react-router-dom";
import useDeleteCard from "../hooks/useDeleteCard";
import useEditCard from "../hooks/useEditCard";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertContext } from "../context/AlertContext";
import { AlertData } from "../types/types";

import ConfirmDeleteModalForCard from "../components/card/ConfirmDeleteModalForCard";
import { OfflineContext } from "../context/OfflineContext";
import FullScreenCardView from "../components/card/FullScreenCardView";

import EditCard from "../components/card/EditCard";
import { searchContext } from "../context/SearchContext";
import { addCodeBlock } from "../functions/addCodeBlock";
import { addBoldText } from "../functions/addBoldText";
import { addUnderlineText } from "../functions/addUnderlineText";
import { addLink } from "../functions/addLink";
import { CardContext } from "../context/CardContext";

// types
type ContentType = {
  title: string;
  note: string;
  _id: string;
  cardId: string;
  from?: string;
};

type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
};

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
};
let wasDeleteModalOpen2: boolean;

// Component
const SearchResultCardFullScreenView: FC = () => {
  // States
  const { setAlert } = useContext(AlertContext);
  const { setCardDeleted, cardDeleted } = useContext(searchContext);
  const {
    indexOfCardForDeletion,
    setIndexOfCardForDeletion,
    deleteConfirmationModalForCard,
  } = useContext(CardContext);
  const { isOnline } = useContext(OfflineContext);
  const [note, setNote] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(true);
  const [startAnimation, setStartAnimation] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [closeEditModal, setCloseEditModal] = useState(false);
  const location = useLocation();
  const [fullScreenCardData, setFullScreenCardData] =
    useState<ContentForFullScreen | null>(() => {
      if (location?.state && location?.state?.card) {
        delete location.state.card.deck_id;
        delete location.state.card.deckTitle;
        return { ...location.state.card, from: location?.state?.from };
      } else return null;
    });
  const [previousCardInfoForError, setPreviousCardInfoForError] =
    useState<ContentForFullScreen | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const { deck_id, search_index = null } = useParams();

  const [editContent, setEditContent] = useState<ContentTypeForEdit>({
    title: "",
    note: "",
    _id: "",
    cardIndex: null,
    cardId: "",
  });
  const {
    mutate: editCard,
    reset: resetEditCardResponse,
    isError: isEditCardError,
    error: editCardError,
  } = useEditCard();
  const {
    mutate: deleteCardItem,
    reset: resetDeleteCardResponse,
    isError: isDeleteCardError,
    error: deleteCardError,
  } = useDeleteCard();

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldPush = useRef<boolean>(false);
  const [wasDeleteModalOpen, setWasDeleteModalOpen] = useState(false);
  wasDeleteModalOpen2 = wasDeleteModalOpen;

  // Other
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditCardError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: editCardError?.message,
        autoHideDuration: 5000,
      }));
      resetEditCardResponse();

      if (previousCardInfoForError) {
        setFullScreenCardData({ ...previousCardInfoForError });
      }
    }

    if (isDeleteCardError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: deleteCardError?.message,
        autoHideDuration: 5000,
      }));
      resetDeleteCardResponse();
    }
  }, [
    isEditCardError,
    isDeleteCardError,
    previousCardInfoForError,
    resetEditCardResponse,
    resetDeleteCardResponse,
  ]);

  useEffect(() => {
    //If the user tries to access this link by directly pasting it, we will redirect them to the home page since we are getting data through a link for this page. If the user directly pastes the link, we won't have any data available, so the user will see a blank page. To avoid that, we will redirect them to the home page.

    if (!fullScreenCardData) {
      navigate("/", { replace: true });
    }
  }, [fullScreenCardData]);

  useEffect(() => {
    // When a user opens a card and deletes it, this useEffect will remove the links that are pushed to the browser stack.
    if (location?.state?.deleted) {
      setCardDeleted(true);
      // Navigation is asynchronous, so when I call navigate(-1) twice, it will first navigate back by 1 step. Subsequently, on the next navigate call, it will navigate back by one more step.
      navigate(-1);
      navigate(-1);
      return;
    }
    if (location.state?.from && cardDeleted) {
      if (location.state?.from === "/") {
        navigate("/", { state: { deleted: true }, replace: true });
      } else {
        navigate(location.state?.from, {
          state: { deleted: true },
          replace: true,
        });
      }
    }
  }, [location, cardDeleted]);

  // If user clicks on browser's back button (on mobile when he swipes back) and if some modal is open then we will close that modal instead of
  // redirecting him to home page. if there is no modal open then we will navigate him to home page.
  const handleBrowsersBackButton = useCallback(
    function (event: PopStateEvent) {
      event.preventDefault();
      if (
        !deleteConfirmationModalForCard?.current?.classList.contains("hidden")
      ) {
        setIsConfirmDeleteModalOpen(false);
        deleteConfirmationModalForCard?.current?.classList.add("hidden");
        return;
      }

      if (openModal) {
        setCloseEditModal(true);
      } else {
        if (wasDeleteModalOpen2) {
          setWasDeleteModalOpen(false);
          return;
        }
        setStartAnimation(false);
        setShowScrollButtons(false);
      }
    },
    [openModal]
  );

  useEffect(() => {
    if (openModal || showFullScreen || isConfirmDeleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openModal, showFullScreen, isConfirmDeleteModalOpen]);

  useEffect(() => {
    if (cardDeleted) {
      return;
    }
    const shouldPushState =
      openModal || isConfirmDeleteModalOpen || showFullScreen;
    if (shouldPushState && !shouldPush.current) {
      const url = new URL(document.URL);
      const absolutePath = url.pathname;
      // navigate(absolutePath, { state: { isBackButtonNotClicked: true } });
      //Using navigate() can cause the whole tree to re-render. To avoid that, I am using the History API, as it achieves what I want to achieve without re-rendering the whole tree.
      window.history.pushState(
        { isBackButtonNotClicked: true },
        "",
        absolutePath
      );
    }

    const variableArray = [openModal, isConfirmDeleteModalOpen, showFullScreen];
    const trueCount = variableArray.filter((variable) => variable).length;

    if (trueCount >= 2) {
      shouldPush.current = true;
    } else {
      shouldPush.current = false;
    }

    window.addEventListener("popstate", handleBrowsersBackButton);
    return () => {
      window.removeEventListener("popstate", handleBrowsersBackButton);
    };
  }, [openModal, isConfirmDeleteModalOpen, showFullScreen]);

  const handleDelete = useCallback(
    (index: number) => {
      if (!isOnline) {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: "No internet connection",
          autoHideDuration: 5000,
        }));
        return;
      }
      setIndexOfCardForDeletion(index);
      // This will take confirmation of user by showing him a modal.
      if (
        deleteConfirmationModalForCard?.current?.classList.contains("hidden")
      ) {
        setIsConfirmDeleteModalOpen(true);
        deleteConfirmationModalForCard?.current?.classList.remove("hidden");
      }
    },
    [isOnline]
  );

  const handleEditCardButtonClick = useCallback(
    (cardItem: ContentTypeForEdit) => {
      if (!isOnline) {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "error",
          show: true,
          message: "No internet connection",
          autoHideDuration: 5000,
        }));
        return;
      }
      setEditContent(cardItem);
      setOpenModal(true);
    },
    [isOnline]
  );

  const handleSaveEdit = () => {
    if (!isOnline) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      navigate(-1);
      return;
    }

    const contentWithCardIndex = { ...editContent };
    const { ...contentWithoutCardIndex } = editContent;
    const data = {
      deck_id: deck_id!,
      newContent: contentWithoutCardIndex,
      index: editContent.cardIndex!,
    };
    const fullScreenCardDataCache = fullScreenCardData;

    if (editContent.title.length > 0 || editContent.note.length > 0) {
      editCard(data, {
        onError: () => {
          setEditContent(contentWithCardIndex),
            setOpenModal(true),
            setCloseEditModal(false);
          // If some error occures while saving the edited data we will also reset the fullscreen card data to the old data.
          if (showFullScreen) {
            setFullScreenCardData({
              ...fullScreenCardDataCache,
            } as ContentForFullScreen);
          }
        },
      });
      setCloseEditModal(true);
      setPreviousCardInfoForError({
        ...fullScreenCardData,
      } as ContentForFullScreen);
      setFullScreenCardData({ ...editContent });
    } else {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "warning",
        show: true,
        message: "Title or note should contain one or more characters!",
      }));
    }
    navigate(-1);
  };

  // Memoized handleChange function
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditContent((prevContent) => ({
        ...prevContent,
        [name]: value,
      }));
    },
    []
  );

  const addCodeBlockWrapper = useCallback(
    (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      addCodeBlock({
        e: event,
        note,
        setNote,
        editContent,
        setEditContent,
        textareaRef,
        editTextareaRef,
      });
    },
    [
      addCodeBlock,
      note,
      setNote,
      editContent,
      setEditContent,
      textareaRef,
      editTextareaRef,
    ]
  );

  const addBoldTextWrapper = useCallback(
    (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      addBoldText({
        e,
        textareaRef,
        note,
        setNote,
        editTextareaRef,
        editContent,
        setEditContent,
      });
    },
    [
      note,
      setNote,
      textareaRef,
      editTextareaRef,
      editContent,
      setEditContent,
      addBoldText,
    ]
  );

  const addUnderlineTextWrapper = useCallback(
    (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      addUnderlineText({
        e,
        textareaRef,
        editTextareaRef,
        note,
        setNote,
        editContent,
        setEditContent,
      });
    },
    [
      note,
      setNote,
      editContent,
      setEditContent,
      textareaRef,
      editTextareaRef,
      addUnderlineText,
    ]
  );

  const addLinkWrapper = useCallback(
    (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      addLink({
        e: event,
        textareaRef,
        note,
        setNote,
        editTextareaRef,
        editContent,
        setEditContent,
      });
    },
    [
      textareaRef,
      note,
      setNote,
      editTextareaRef,
      editContent,
      setEditContent,
      addLink,
    ]
  );

  if (cardDeleted || !fullScreenCardData) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Search result</title>
        <meta
          name="description"
          content="View and manage the detailed information on our interactive cards. Each card contains information related to the particular card that you have created, all organized within their respective decks."
        />
      </Helmet>

      {openModal ? (
        <EditCard
          setOpenModal={setOpenModal}
          addLink={addLinkWrapper}
          addCodeBlock={addCodeBlockWrapper}
          addBoldText={addBoldTextWrapper}
          addUnderlineText={addUnderlineTextWrapper}
          editContent={editContent}
          handleChange={handleChange}
          handleSaveEdit={handleSaveEdit}
          ref={editTextareaRef}
          search_index={search_index}
          openModal={openModal}
          setCloseEditModal={setCloseEditModal}
          closeEditModal={closeEditModal}
        />
      ) : null}

      <ConfirmDeleteModalForCard
        indexOfCardForDeletion={indexOfCardForDeletion!}
        deleteCardItem={deleteCardItem}
        setIsConfirmDeleteModalOpen={setIsConfirmDeleteModalOpen}
        setWasDeleteModalOpen={setWasDeleteModalOpen}
        showFullScreen={showFullScreen}
      />

      {showFullScreen && (
        <FullScreenCardView
          fullScreenCardData={fullScreenCardData!}
          search_index={search_index}
          location={location}
          setShowFullScreen={setShowFullScreen}
          handleEditCardButtonClick={handleEditCardButtonClick}
          handleDelete={handleDelete}
          startAnimation={startAnimation}
          setStartAnimation={setStartAnimation}
          setShowScrollButtons={setShowScrollButtons}
          showScrollButtons={showScrollButtons}
        />
      )}
    </>
  );
};

export default memo(SearchResultCardFullScreenView);

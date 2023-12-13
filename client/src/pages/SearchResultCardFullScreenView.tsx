import React, {
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
import { UserContext } from "../context/UserContext";
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
  const { cardInfo, setCardInfo, setCardDeleted, cardDeleted } =
    useContext(searchContext);
  const {
    indexOfCardForDeletion,
    setIndexOfCardForDeletion,
    deleteConfirmationModalForCard,
  } = useContext(UserContext);
  const { isOnline } = useContext(OfflineContext);
  const [note, setNote] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [startAnimation, setStartAnimation] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [closeEditModal, setCloseEditModal] = useState(false);
  const [fullScreenCardData, setFullScreenCardData] =
    useState<ContentForFullScreen>(cardInfo);
  const [previousCardInfoForError, setPreviousCardInfoForError] =
    useState<ContentForFullScreen | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const { deck_id, search_index = null } = useParams();
  const location = useLocation();

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
  const { mutate: deleteCardItem } = useDeleteCard();

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldPu = useRef<boolean>(false);
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
        if (previousCardInfoForError?.from) {
          setCardInfo({
            ...previousCardInfoForError,
            from: previousCardInfoForError.from!,
          });
        }
      }
    }
  }, [isEditCardError]);

  useEffect(() => {
    if (location?.state?.deleted) {
      setCardDeleted(true);
      navigate(-1);
      navigate(-1);
      navigate(-1);
      if (location.state?.from === "/") {
        navigate("/", { state: { deleted: true } });
      } else {
        navigate(location.state?.from, { state: { deleted: true } });
      }
      return;
    }
  }, [location]);

  useEffect(() => {
    if (location?.state?.isBackButtonNotClicked && !cardInfo._id) {
      navigate("/");
    }
  }, []);

  // This useEffect is for the search bar. If a user searches for something and finds a corresponding card in the search results, clicking on that card will redirect them to this page. Once redirected, we can easily handle all operations related to the card.
  useEffect(() => {
    //
    if (!location?.state && !showFullScreen) {
      navigate("/");
    }
    // Here, we will check if the 'search_index' parameter is present in the URL. If it is, it means that we have arrived at this page from a search result.

    if (search_index) {
      // we need this info when we show the card in full screen
      let cardInformation: ContentType = {
        title: "",
        note: "",
        _id: "",
        cardId: "",
      };

      if (
        location?.state?.card !== undefined &&
        location?.state?.card !== null
      ) {
        // The 'data' state contains the deck along with its cards. We can use the 'search_index' to retrieve the specific card that we want to display in fullscreen mode
        // here we will set the values for cardInfo object that we created above.
        cardInformation.title = location?.state?.card?.title;
        cardInformation.note = location?.state?.card?.note;
        cardInformation._id = location?.state?.card?.deck_id;
        cardInformation.cardId = location?.state?.card?.cardId;

        // here we will create all the data that is needed to show it in full screen
        let cardDetails: ContentForFullScreen = {
          ...cardInformation,
          cardIndex: location?.state?.card?.cardIndex,
        };

        const cardDetailsWithRoute: ContentForFullScreen & { from: string } = {
          ...cardDetails,
          from: location?.state?.from,
        };
        setCardInfo(cardDetailsWithRoute);
        setShowFullScreen(true);
      } else {
        setFullScreenCardData(cardInfo);
        setShowFullScreen(true);
      }
    }
  }, [location, search_index]);

  useEffect(() => {
    setFullScreenCardData(cardInfo);
  }, [cardInfo]);

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

      if (search_index) {
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
      }
    },
    [openModal]
  );

  useEffect(() => {
    if (cardDeleted) {
      return;
    }
    const shouldPushState =
      openModal || isConfirmDeleteModalOpen || showFullScreen;

    if (shouldPushState && !shouldPu.current) {
      const url = new URL(document.URL);
      const absolutePath = url.pathname;
      navigate(absolutePath, { state: { isBackButtonNotClicked: true } });
    }
    const variableArray = [openModal, isConfirmDeleteModalOpen, showFullScreen];
    const trueCount = variableArray.filter((variable) => variable).length;

    if (trueCount >= 2) {
      shouldPu.current = true;
    } else {
      shouldPu.current = false;
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

  const handleEdit = useCallback(
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

  const handleSave = () => {
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
    const { from, ...editContentData } = editContent;
    let data = {
      deck_id: deck_id!,
      newContent: editContentData,
      index: editContent.cardIndex!,
    };

    if (editContent.title.length > 0 || editContent.note.length > 0) {
      editCard(data);
      setCloseEditModal(true);
      setPreviousCardInfoForError({ ...fullScreenCardData });
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

  if (cardDeleted) {
    return (
      <div className="z-[90] flex items-center justify-center fixed top-[3.45rem] h-full left-1/2 -translate-x-1/2 text-white dark:bg-slate-900 w-full">
        <p className="-translate-y-[3.45rem]">Deleting...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cards</title>
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
          handleSave={handleSave}
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
        setShowFullScreen={setShowFullScreen}
        setIsConfirmDeleteModalOpen={setIsConfirmDeleteModalOpen}
        setWasDeleteModalOpen={setWasDeleteModalOpen}
        showFullScreen={showFullScreen}
      />

      {showFullScreen && (
        <FullScreenCardView
          fullScreenCardData={fullScreenCardData}
          search_index={search_index}
          location={location}
          setShowFullScreen={setShowFullScreen}
          handleEdit={handleEdit}
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

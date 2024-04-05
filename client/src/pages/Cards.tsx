import React, {
  ChangeEvent,
  FormEvent,
  useState,
  useRef,
  useContext,
  MouseEvent,
  FC,
  useEffect,
  useCallback,
  KeyboardEvent,
  memo,
  RefObject,
  SetStateAction,
  Dispatch,
} from "react";
import { useParams } from "react-router-dom";
import useGetCards from "../hooks/useGetCards";
import useCreateCard from "../hooks/useCreateCard";
import useDeleteCard from "../hooks/useDeleteCard";
import useEditCard from "../hooks/useEditCard";
import { UserContext } from "./../context/UserContext";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertContext } from "../context/AlertContext";
import {
  AlertData,
  ContentType,
  ContentTypeForEdit,
  UndoCardPayloadData,
} from "../types/types";
import { Droppable } from "react-beautiful-dnd";
import Loading from "../components/Loading";
import PopUpMessage from "../components/PopUpMessage";
import ConfirmDeleteModalForCard from "../components/card/ConfirmDeleteModalForCard";
import CardItems from "../components/card/CardItems";
import ConfirmCloseCard from "../components/card/ConfirmCloseCard";
import { OfflineContext } from "../context/OfflineContext";
import ErrorDisplay from "../components/ErrorDisplay";

import shortid from "shortid";
import { BsChevronExpand } from "react-icons/bs";
import Tips from "../components/card/Tips";
import FullScreenCardView from "../components/card/FullScreenCardView";

import EditCard from "../components/card/EditCard";
import { searchContext } from "../context/SearchContext";
import { addCodeBlock } from "../functions/addCodeBlock";
import { addLink } from "../functions/addLink";
import { addUnderlineText } from "../functions/addUnderlineText";
import { addBoldText } from "../functions/addBoldText";
import CardToolbar from "../components/card/CardToolbar";
import { CustomError } from "../utils/customError";
import { AudioContext } from "../context/AudioContext";
import useUndoCard from "../hooks/useUndoCard";
// types
// let oldContent:string //this  works

type ContentTypeForPayload = {
  title: string;
  note: string;
  cardId: string;
};

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
};

type PayloadType = {
  deck_id: string;
  content: ContentTypeForPayload;
};

let wasDeleteModalOpen2: boolean;

interface CardsProps {
  isMoveCardError: boolean;
  moveCardError: Error | null;
  resetMoveCardResponse: () => void;
  undoButtonRefForCard: RefObject<HTMLDivElement>;
  handlePopupForUndoButtonForCard: () => void;
  undoCardDetails: UndoCardPayloadData | null;
  handleUndoCard: (card: UndoCardPayloadData | null) => void;
  setUndoCardDetails: Dispatch<SetStateAction<UndoCardPayloadData | null>>;
  timeoutForUndoCard: NodeJS.Timeout;
}
// Component
const Cards: FC<CardsProps> = ({
  isMoveCardError,
  moveCardError,
  resetMoveCardResponse,
  handlePopupForUndoButtonForCard,
  undoButtonRefForCard,
  undoCardDetails,
  handleUndoCard,
  setUndoCardDetails,
  timeoutForUndoCard,
}) => {
  // States
  const { setAlert } = useContext(AlertContext);
  const {
    showSearchBar,
    setOpenSearchBar,
    openEditDeckModalForSearchResult,
    setAnimateCloseEditDeckModalInSearchResult,
    cardDeleted,
    setCardDeleted,
    setShowSearchBar,
  } = useContext(searchContext);
  const {
    indexOfCardForDeletion,
    setIndexOfCardForDeletion,
    deleteConfirmationModalForCard,
    theme,
    divRefForUserSettings,
    handleShowUserInfomation,
    showLogoutModal,
    setShowLogoutModal,
  } = useContext(UserContext);
  const {
    mutate: undoCardItem,
    error: undoCardError,
    isError: isUndoCardError,
    reset: resetUndoCardResponse,
  } = useUndoCard();
  const [wasSearchBarInitiallyTrue, setWasSearchBarInitiallyTrue] =
    useState(showSearchBar);
  const { isOnline } = useContext(OfflineContext);
  const [note, setNote] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [showTips, setShowTips] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [height, setHeight] = useState(80);
  const [expandTextarea, setExpandTextArea] = useState(false);
  const [checkClose, setCheckClose] = useState(false);
  const [startAnimation, setStartAnimation] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [showConfirmCloseCardModal, setShowConfirmCloseCardModal] =
    useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [closeTipsModal, setCloseTipsModal] = useState(false);
  const [closeEditModal, setCloseEditModal] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [fullScreenCardData, setFullScreenCardData] =
    useState<ContentForFullScreen>({
      title: "",
      note: "",
      _id: "",
      cardIndex: null,
      cardId: "",
    });
  const [wasDeleteModalOpen, setWasDeleteModalOpen] = useState(false);
  wasDeleteModalOpen2 = wasDeleteModalOpen;
  const { deck_id } = useParams();
  const location = useLocation();
  const { isPlayingAudioAllowed, handlePlayAudio } = useContext(AudioContext);

  const { data, isError, error, isLoading, isPaused } = useGetCards(
    deck_id!,
    location?.state?.deck
  );

  const [editContent, setEditContent] = useState<ContentTypeForEdit>({
    title: "",
    note: "",
    _id: "",
    cardIndex: null,
    cardId: "",
  });
  const {
    mutate: addCard,
    data: createCardResponse,
    reset: resetCreateCardResponse,
    isError: isCreateCardError,
    error: createCardError,
  } = useCreateCard();

  const {
    mutate: editCard,
    data: editCardResponse,
    reset: resetEditCardResponse,
    isError: isEditCardError,
    error: editCardError,
  } = useEditCard();

  const {
    mutate: deleteCardItem,
    data: deleteCardResponse,
    reset: resetDeleteCardResponse,
    isError: isDeleteCardError,
    error: deleteCardError,
    isSuccess: isCardDeleted,
  } = useDeleteCard();

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const showPopUp = useRef<HTMLDivElement | null>(null);
  const inputElementRef = useRef<HTMLInputElement>(null);
  const shouldPushRef = useRef<boolean>(false);

  // Other
  const navigate = useNavigate();
  // just for understanding
  //let oldContent:string  // If you declare a variable like this to store old content it might show undefined because once state changes the function rerenders and that removes the value you set. If you do not want to use state to store then you will have to place the global variable outside the functional component. I was just trying to use global variable to store oldcontent.

  //useEffects

  useEffect(() => {
    if (isCreateCardError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: createCardError?.message,
        autoHideDuration: 5000,
      }));
      resetCreateCardResponse();
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
    if (isMoveCardError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: moveCardError?.message!,
        autoHideDuration: 5000,
      }));
      resetMoveCardResponse();
    }
    if (isEditCardError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: editCardError?.message,
        autoHideDuration: 5000,
      }));
      resetEditCardResponse();
    }
    if (isUndoCardError) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message:
          "We're sorry, but we couldn't undo your card due to a technical issue. Your card may not be restored. We apologize for any inconvenience.",
        autoHideDuration: 7000,
      }));
      resetUndoCardResponse();
    }
  }, [
    isCreateCardError,
    isDeleteCardError,
    isMoveCardError,
    isEditCardError,
    isUndoCardError,
  ]);

  useEffect(() => {
    const isRoundedTopClassPresent =
      inputElementRef?.current?.classList.contains("rounded-t-md");

    let timeoutId: NodeJS.Timeout;
    if (isRoundedTopClassPresent && expandTextarea) {
      timeoutId = setTimeout(() => {
        inputElementRef?.current?.classList.remove("rounded-t-md");
      }, 1200);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [expandTextarea]);

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout,
      timeoutId2: NodeJS.Timeout,
      timeoutId3: NodeJS.Timeout;

    if (checkClose) {
      inputElementRef?.current?.classList.remove("rounded-b-md");
      inputElementRef?.current?.classList.remove("rounded-t-md");

      timeoutId1 = setTimeout(() => {
        inputElementRef?.current?.classList.add("rounded-t-md");
        inputElementRef?.current?.classList.remove("duration-700");
        inputElementRef?.current?.classList.add("duration-[1.2s]");
        setCheckClose(false);
      }, 1300);

      timeoutId2 = setTimeout(() => {
        inputElementRef?.current?.classList.add("rounded-b-md");
        inputElementRef?.current?.classList.add("duration-700");
      }, 600);

      timeoutId3 = setTimeout(() => {
        textareaRef?.current?.classList.add("opacity-0");
      }, 950);
    } else {
      inputElementRef?.current?.classList.add("rounded-b-md");
      inputElementRef?.current?.classList.add("rounded-t-md");
    }

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [checkClose]);

  useEffect(() => {
    if (cardDeleted) {
      setCardDeleted(false);
    }
  }, [cardDeleted]);

  // If user clicks on browser's back button (on mobile when he swipes back) and if some modal is open then we will close that modal instead of
  // redirecting him to home page. if there is no modal open then we will navigate him to home page.
  const handleBrowsersBackButton = useCallback(
    function (event: PopStateEvent) {
      event.preventDefault();
      if (showLogoutModal) {
        setShowLogoutModal(false);
        return;
      }

      if (
        !deleteConfirmationModalForCard?.current?.classList.contains("hidden")
      ) {
        setIsConfirmDeleteModalOpen(false);
        deleteConfirmationModalForCard?.current?.classList.add("hidden");
        return;
      }

      if (openEditDeckModalForSearchResult) {
        setAnimateCloseEditDeckModalInSearchResult(true);
        return;
      }

      if (showSearchBar && !showFullScreen) {
        if (divRefForUserSettings.current?.classList.contains("scale-100")) {
          handleShowUserInfomation();
        }
        setOpenSearchBar(false);
        return;
      }

      if (showTips) {
        setCloseTipsModal(true);
        return;
      }

      if (openModal || showFullScreen) {
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
      if (showFullScreen) {
        // Close the keyboard on phones when the user opens the card.
        textareaRef?.current?.blur();
        inputElementRef?.current?.blur();
      }
    },
    [
      openModal,
      showFullScreen,
      showTips,
      showSearchBar,
      openEditDeckModalForSearchResult,
      isConfirmDeleteModalOpen,
      showLogoutModal,
    ]
  );

  // Here we will check if user has used browser's back button if he uses browsers back button to go back then
  // we will first check if card is open in full screen if it is open then we will close it instead of going back to the previous page directly.
  // This is usefull when user is accessing the site on mobile because most users swipe to go back.

  useEffect(() => {
    const shouldPushState =
      openModal ||
      showFullScreen ||
      showTips ||
      showSearchBar ||
      openEditDeckModalForSearchResult ||
      isConfirmDeleteModalOpen;

    if (shouldPushState && !shouldPushRef.current) {
      if (!wasSearchBarInitiallyTrue) {
        // To push new url into the browser's stack you can use window object or react router dom's useNavigate() hook.
        // window.history.pushState(
        //   { isBackButtonNotClicked: true },
        //   "",
        //   document.URL
        // );
        const url = new URL(document.URL);
        const absolutePath = url.pathname;
        navigate(absolutePath, { state: { isBackButtonNotClicked: true } });
      } else {
        setWasSearchBarInitiallyTrue(false);
      }
    }

    const variableArray = [
      openModal,
      showFullScreen,
      showTips,
      showSearchBar,
      openEditDeckModalForSearchResult,
      isConfirmDeleteModalOpen,
    ];
    const trueCount = variableArray.filter((variable) => variable).length;

    if (trueCount >= 2) {
      shouldPushRef.current = true;
    } else {
      shouldPushRef.current = false;
    }
    window.addEventListener("popstate", handleBrowsersBackButton);
    return () => {
      window.removeEventListener("popstate", handleBrowsersBackButton);
    };
  }, [
    openModal,
    showFullScreen,
    showTips,
    showSearchBar,
    openEditDeckModalForSearchResult,
    isConfirmDeleteModalOpen,
    showLogoutModal,
  ]);

  useEffect(() => {
    if (
      showFullScreen ||
      openModal ||
      showConfirmCloseCardModal ||
      isConfirmDeleteModalOpen ||
      showTips
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    showFullScreen,
    openModal,
    showConfirmCloseCardModal,
    isConfirmDeleteModalOpen,
    showTips,
  ]);

  useEffect(() => {
    //     scrollHeight is a property of an HTML element that represents the height of an element's content, including any overflowed content that is hidden, as a result of applying CSS overflow property. It includes padding but not the border, scrollbar or margin.

    // clientHeight is a property of an HTML element that represents the height of an element's content area, including padding but excluding the border, scrollbar or margin. (which means height that is our state and clientHeight are same. as we have added py-2 there is lil difference )

    if (textareaRef?.current) {
      const textarea = textareaRef.current;
      const maxHeightForTextArea = (window.innerHeight * 70) / 100; //giving 60 percent of screen height to the textarea.
      if (textarea.scrollHeight === 24) {
        return setHeight(80);
      }
      // We will only increase the height of the textarea when the content height is greater than the textarea's height.
      if (
        textarea.scrollHeight > textarea.clientHeight &&
        maxHeightForTextArea > textarea.scrollHeight
      ) {
        // adding an extra 40+ to avoid weird bug. if I don't add this, then if you hit enter then while adding height it moves the content inside textarea which looks weird.
        setHeight((previousHeight) => {
          if (maxHeightForTextArea - previousHeight > 120) {
            return maxHeightForTextArea > previousHeight
              ? previousHeight + 120
              : previousHeight;
          } else {
            return parseFloat(
              (previousHeight + maxHeightForTextArea - previousHeight).toFixed(
                2
              )
            );
          }
        });
      }
    }
  }, [note]);

  const increaseTextAreaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    const maxHeightForTextArea = (window.innerHeight * 70) / 100;
    if (maxHeightForTextArea > textarea!.clientHeight) {
      setHeight((previousHeight) => {
        if (maxHeightForTextArea - previousHeight > 120) {
          return maxHeightForTextArea > previousHeight
            ? previousHeight + 120
            : previousHeight;
        } else {
          return parseFloat(
            (previousHeight + maxHeightForTextArea - previousHeight).toFixed(2)
          );
        }
      });
    }
  }, []);

  const decreaseTextAreaHeight = useCallback(() => {
    if (height <= 80) {
      setHeight(80);
    } else {
      setHeight((previousHeight) => {
        if (previousHeight - 120 > 80) {
          return previousHeight - 120;
        } else {
          return 80;
        }
      });
    }
  }, [height]);

  const adjustTextareaHeightOnPasteAndExpand = useCallback(() => {
    const textarea = textareaRef.current;

    const maxHeightForTextArea = (window.innerHeight * 70) / 100;
    if (maxHeightForTextArea > textarea!.clientHeight) {
      setHeight((previousHeight) => {
        return maxHeightForTextArea > previousHeight
          ? maxHeightForTextArea
          : previousHeight;
      });
    }
  }, []);

  const handleUndoButtonClick = () => {
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
    // I have set the value of undoDeck state in useDeleteDeck()
    undoCardItem(undoCardDetails!);
    // Once we undo the deck, we will set the state that was holding the deleted item to null so that when we delete another item, it can hold that fresh data.
    handleUndoCard(null);
    // calling handlePopupForUndoButton() function so that it can close the dialog box when we click on undo button.
    handlePopupForUndoButtonForCard();
  };

  const handleClose = useCallback(() => {
    if (title.trim().length > 0 || note.trim().length > 0) {
      setShowConfirmCloseCardModal(true);
    } else {
      setExpandTextArea(false);
      setCheckClose(true);
      setHeight(80);
      setNote("");
      setTitle("");
      if (data && "cards" in data && data?.cards?.length === 0) {
        setIsTransitioning(true);
      }
    }
  }, [title, note, data]);
  // onClick handlers
  const handleCreateCard = async (e: FormEvent) => {
    e.preventDefault();
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
    //If I don't use trim(), user can create the card  using white spaces. the trim() method is used to remove any leading and trailing white spaces from the string str
    if (title.trim().length > 0 || note.trim().length > 0) {
      const content = { title, note, cardId: shortid.generate() };
      const payload: PayloadType = { deck_id: deck_id!, content };
      // Store the current input values to reset them later
      const currentNote = note;
      const currentTitle = title;
      const heightVal = height;
      addCard(payload, {
        //While saving the card, if an error occurs, we will retrieve the cleared card information and show it again so that the user doesn't lose the created card details.
        onError: () => {
          setNote(currentNote);
          setTitle(currentTitle);
          setHeight(heightVal);
        },
      });
      setNote("");
      setTitle("");
      setHeight(80);
      if (isPlayingAudioAllowed) {
        setTimeout(() => {
          handlePlayAudio("createdSuccessfully");
        }, 100);
      }
    } else {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "warning",
        show: true,
        message: "Title or note should contain one or more characters!",
      }));
    }
  };

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
    [isOnline, setIndexOfCardForDeletion, deleteConfirmationModalForCard]
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
    [isOnline, setEditContent, setOpenModal]
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
      return;
    }

    const contentWithCardIndex = { ...editContent };
    const { cardIndex: index, ...contentWithoutCardIndex } = editContent;
    let data = {
      deck_id: deck_id!,
      newContent: contentWithoutCardIndex,
      index: index!,
    };

    let fullScreenCardDataCache = fullScreenCardData;

    if (editContent.title.length > 0 || editContent.note.length > 0) {
      // If the user saves the edited card and encounters an error during the saving process, this causes the user to lose all the data they created. This is because once the user clicks on the 'Save Card' button, I clear the edited content from the state and close the edit modal. To prevent data loss on error, we will open the modal again and show the lost data.
      editCard(data, {
        onError: () => {
          setEditContent(contentWithCardIndex),
            setOpenModal(true),
            setCloseEditModal(false);
          // If some error occures while saving the edited data we will also reset the fullscreen card data to the old data.
          if (showFullScreen) {
            setFullScreenCardData({ ...fullScreenCardDataCache });
          }
        },
      });
      setCloseEditModal(true);

      // It's okay not to reset the setEditContent because the next time I open a new card in edit mode, I will have the new data.
      // setEditContent({
      //   title: "",
      //   note: "",
      //   _id: "",
      //   cardIndex: null,
      //   cardId: "",
      // });

      // If the user opens the full screen card view and then clicks on the edit card button, we will display the updated data on full screen once the user saves the edited card.

      if (showFullScreen) {
        // Last time, when this function was created, it captured the value of the editContent state, and now we have that value available in the editContent here.
        setFullScreenCardData({ ...editContent });
      }
    } else {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "warning",
        show: true,
        message: "Title or note should contain one or more characters!",
      }));
    }
    if (location?.state?.isBackButtonNotClicked) {
      navigate(-1);
    }
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
    [setEditContent]
  );

  const handlePopUp = () => {
    if (showPopUp.current?.classList.contains("scale-0")) {
      showPopUp.current.classList.remove("scale-0");
      showPopUp?.current?.classList.add("!block");
      showPopUp.current.classList.add("!w-[85%]");
      showPopUp.current.classList.add("md:!w-fit");
      showPopUp.current.classList.add("!h-fit");
      showPopUp.current.classList.add("scale-100");

      setTimeout(() => {
        showPopUp?.current?.classList.remove("scale-100");
        showPopUp?.current?.classList.add("scale-0");
        showPopUp?.current?.classList.add("hidden");
      }, 3000);
    }
  };
  const handleShowFullScreen = useCallback(
    (card: ContentForFullScreen) => {
      setShowFullScreen(true);
      setFullScreenCardData({ ...card });
    },
    [setShowFullScreen, setFullScreenCardData]
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

  if (isLoading) {
    return <Loading />;
  }

  if (isError || isPaused) {
    return (
      <ErrorDisplay
        theme={theme}
        message={error?.message}
        status={(error as CustomError)?.statusCode}
        isPaused={isPaused}
      >
        <button
          onClick={() => navigate("/")}
          className=" mt-4  inline-block  py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-[7.3rem]  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out  "
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
          {showSearchBar
            ? "Search result"
            : data && "title" in data
            ? `${data?.title}-cards`
            : "Error"}
        </title>
        <meta
          name="description"
          content="View and manage the detailed information on our interactive cards. Each card contains information related to the particular card that you have created, all organized within their respective decks."
        />
      </Helmet>

      <PopUpMessage
        message="Drag and drop the card onto the trash icon to delete it."
        ref={showPopUp}
      />
      {showTips && (
        <Tips
          setShowTips={setShowTips}
          closeTipsModal={closeTipsModal}
          setCloseTipsModal={setCloseTipsModal}
        />
      )}

      <div
        ref={undoButtonRefForCard}
        className=" transition duration-500 ease-in-out scale-0  w-0 h-0 border-teal-500 bg-teal-200 shadow-teal-500 text-gray-800  rounded-lg z-50 dark:text-gray-50 p-4 dark:bg-slate-900 border shadow dark:border-sky-500 dark:shadow-sky-500  fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2"
      >
        <span className="mr-4">Card deleted successfully!</span>
        <span
          className="cursor-pointer font-bold text-blue-700 dark:text-yellow-400"
          onClick={() => {
            handleUndoButtonClick();
          }}
        >
          Undo
        </span>
      </div>

      <Droppable droppableId="cardDeleteArea">
        {(provided, snapshot) => {
          return (
            <div
              className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700   lg:right-2 bottom-2 right-2 z-50 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center ${
                snapshot.isDraggingOver
                  ? "ring-1 ring-red-500 shadow-md shadow-red-500 z-[5001]"
                  : "ring-1 dark:ring-sky-500/40 ring-teal-500/40"
              }`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div
                className={` cursor-pointer transition-transform duration-300   ${
                  snapshot.isDraggingOver ? "-rotate-12 " : "transform-none"
                }  `}
                onClick={handlePopUp}
              >
                {snapshot.isDraggingOver ? (
                  <img
                    src="/trashcan-open.svg"
                    alt="Delete card trash can"
                    className="w-[30px] h-[30px] lg:w-[35px] lg:h-[35px]"
                  />
                ) : (
                  <img
                    src="/trashcan-close.svg"
                    alt="Delete card trash can"
                    className="w-[30px] h-[30px]  lg:w-[35px] lg:h-[35px]"
                  />
                )}
              </div>
            </div>
          );
        }}
      </Droppable>

      <div className="flex flex-col gap-2 w-full  relative overflow-auto h-screen  ">
        <div
          className={`${
            expandTextarea ? "mt-4" : "mt-2"
          } w-full px-4  mx-auto transition-all duration-1000  `}
        >
          <form
            onSubmit={handleCreateCard}
            className="flex flex-col  gap-4 justify-center items-center  "
          >
            {/* <label htmlFor="title" className=" font-bold text-teal-600 dark:text-sky-400">
            Card details
          </label> */}
            <div className="flex flex-col ">
              <div
                onTransitionEnd={() => {
                  if (data && "cards" in data && data?.cards?.length === 0) {
                    setIsTransitioning(false);
                  }
                }}
                className={`transition duration-1000 delay-1000 ${
                  expandTextarea
                    ? "h-8 p-1 border-t-2 opacity-100"
                    : "h-8 p-0 translate-y-full border-t-2"
                } flex item-center justify-end pr-4 border-r-2 border-l-2 border-teal-500 dark:border-sky-400 rounded-t-md gap-2 lg:w-[40vw] md:w-[70vw] w-[95vw] dark:bg-slate-900`}
              >
                <CardToolbar
                  addLinkWrapper={addLinkWrapper}
                  addBoldTextWrapper={addBoldTextWrapper}
                  addCodeBlockWrapper={addCodeBlockWrapper}
                  addUnderlineTextWrapper={addUnderlineTextWrapper}
                  setShowTips={setShowTips}
                  increaseTextAreaHeight={increaseTextAreaHeight}
                  decreaseTextAreaHeight={decreaseTextAreaHeight}
                  adjustTextareaHeightOnPasteAndExpand={
                    adjustTextareaHeightOnPasteAndExpand
                  }
                  handleClose={handleClose}
                />
              </div>
              <div
                onClick={() => {
                  setExpandTextArea(true);
                  if (isPlayingAudioAllowed && !expandTextarea) {
                    setTimeout(() => {
                      handlePlayAudio("open");
                    }, 100);
                  }
                }}
                className="h-10 lg:max-w-[40vw] md:max-w-[70vw] max-w-[95vw] z-10 relative"
              >
                <input
                  ref={inputElementRef}
                  type="text"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setTitle(e.target.value);
                  }}
                  //When the user hits 'Enter' in the input field, we will first prevent the form from submitting, as hitting 'Enter' in an input
                  //field typically triggers form submission by default. Afterwards, we will shift the focus from the input field to the textarea.
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      textareaRef.current?.focus();
                    }
                  }}
                  value={title}
                  readOnly={!expandTextarea}
                  className={`${
                    expandTextarea
                      ? "border-b-0 rounded-none text-left border-t-2 rounded-t-md mt-0"
                      : "border-b-2 border-t-2 rounded-b-md rounded-t-md text-center cursor-pointer"
                  } transition-[border-radius]  h-10 px-3 py-2  pb-2 w-full  bg-[#fcfefc]  border-r-2 border-l-2  border-teal-500 dark:border-sky-400   font-semibold outline-none text-base text-gray-800   dark:bg-slate-900 dark:text-gray-50 z-10 `}
                  placeholder={`${
                    expandTextarea ? "Title" : "Craft an Elegant Note"
                  } `}
                />
                {!expandTextarea && (
                  <div className="absolute  top-1/2 -translate-y-1/2 right-8 cursor-pointer  ">
                    <BsChevronExpand className="dark:text-gray-100 text-teal-600 " />
                  </div>
                )}
              </div>
              <textarea
                className={` ${
                  expandTextarea
                    ? " py-2 border-b-2 rounded-t-0 opacity-100"
                    : "py-0 border-b-2"
                } lg:w-[40vw]  md:w-[70vw] bg-[#fcfefc] w-[95vw]  border-r-2 border-l-2  border-teal-500 dark:border-sky-400 rounded-b-md  outline-none  text-gray-800 px-3 text-base  dark:bg-slate-900 dark:text-gray-50 resize-none transition-[height,padding,border] duration-1000 overflow-hidden  -mt-1 overflow-y-auto `}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setNote(e.target.value);
                }}
                ref={textareaRef}
                style={{
                  height: expandTextarea ? height + "px" : "0",
                }}
                value={note}
                onPaste={adjustTextareaHeightOnPasteAndExpand}
                placeholder="Note"
              ></textarea>
            </div>
          </form>
          {data && "cards" in data && data?.cards?.length > 0 ? (
            <h1 className="font-bold text-xl text-gray-800 mt-8 mb-6 dark:text-gray-50 ">
              {data?.title}
            </h1>
          ) : null}
        </div>

        {data && "cards" in data && data?.cards?.length > 0 ? (
          <CardItems
            handleDelete={handleDelete}
            handleEditCardButtonClick={handleEditCardButtonClick}
            handleShowFullScreen={handleShowFullScreen}
            data={data}
          />
        ) : !expandTextarea && !isTransitioning ? (
          <div className=" absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 font-semibold dark:text-gray-50 text-gray-800 px-1 flex items-center justify-center flex-col w-full -mt-[1.725rem] animate-quickOpacity">
            <img
              src={`${
                theme === "dark"
                  ? "/illustrations/no_cards_found_dark.svg"
                  : "/illustrations/no_cards_found_light.svg"
              }`}
              alt="No cards found"
              className=" w-44 h-44  "
            />
            <p className="p-1 mt-1 text-base">
              Looks like you haven't added any cards yet.
            </p>
            <button
              onClick={() => {
                setExpandTextArea(true);
                if (isPlayingAudioAllowed) {
                  setTimeout(() => {
                    handlePlayAudio("open");
                  }, 100);
                }
              }}
              className=" mt-4  inline-block  py-2 lg:py-2.5 font-medium text-sm leading-tight  rounded-md  active:shadow-lg text-gray-50   w-fit px-2  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out  "
              type="button"
              aria-label="Craft an Elegant Note"
            >
              Craft an Elegant Note
            </button>
          </div>
        ) : null}
      </div>

      <ConfirmDeleteModalForCard
        indexOfCardForDeletion={indexOfCardForDeletion!}
        deleteCardItem={deleteCardItem}
        setShowFullScreen={setShowFullScreen}
        setIsConfirmDeleteModalOpen={setIsConfirmDeleteModalOpen}
        setWasDeleteModalOpen={setWasDeleteModalOpen}
        showFullScreen={showFullScreen}
        setUndoCardDetails={setUndoCardDetails}
        undoButtonRefForCard={undoButtonRefForCard}
        handlePopupForUndoButtonForCard={handlePopupForUndoButtonForCard}
        timeoutForUndoCard={timeoutForUndoCard}
      />
      {showConfirmCloseCardModal ? (
        <ConfirmCloseCard
          setShowConfirmCloseCardModal={setShowConfirmCloseCardModal}
          showConfirmCloseCardModal={showConfirmCloseCardModal}
          setExpandTextArea={setExpandTextArea}
          setCheckClose={setCheckClose}
          setHeight={setHeight}
          setNote={setNote}
          setTitle={setTitle}
        />
      ) : null}

      {showFullScreen && (
        <FullScreenCardView
          fullScreenCardData={fullScreenCardData}
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
          openModal={openModal}
          setCloseEditModal={setCloseEditModal}
          closeEditModal={closeEditModal}
        />
      ) : null}
    </>
  );
};

export default memo(Cards);

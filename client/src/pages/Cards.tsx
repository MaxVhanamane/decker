import {
  ChangeEvent,
  FormEvent,
  useState,
  useRef,
  useContext,
  MouseEvent,
  FC,
  useEffect,
  useCallback,
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
import { ThemeContext, UserContext } from "./../context/UserContext";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertContext } from "../context/AlertContext";
import {
  AlertData,
  ContentType,
  ContentTypeForEdit,
  UndoCardPayloadData,
} from "../types/types";
import Loading from "../components/Loading";
import ConfirmDeleteModalForCard from "../components/card/ConfirmDeleteModalForCard";
import CardItems from "../components/card/CardItems";
import ConfirmCloseCard from "../components/card/ConfirmCloseCard";
import { OfflineContext } from "../context/OfflineContext";
import ErrorDisplay from "../components/ErrorDisplay";
import shortid from "shortid";
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
import CardInput from "../components/card/CardInput";
import TrashCanDropZone from "../components/TrashCanDropZone";
import { CardContext } from "../context/CardContext";
import { PopupContext } from "../context/PopupContext";
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
  undoCardDetails: UndoCardPayloadData | null;
  resetUndoCardDetailsValue: (card: UndoCardPayloadData | null) => void;
  setUndoCardDetails: Dispatch<SetStateAction<UndoCardPayloadData | null>>;
}

const Cards: FC<CardsProps> = ({
  isMoveCardError,
  moveCardError,
  resetMoveCardResponse,
  undoButtonRefForCard,
  undoCardDetails,
  resetUndoCardDetailsValue,
  setUndoCardDetails,
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
  } = useContext(searchContext);
  const {
    divRefForUserSettings,
    handleShowUserInfomation,
    showLogoutModal,
    setShowLogoutModal,
  } = useContext(UserContext);
  const {
    indexOfCardForDeletion,
    setIndexOfCardForDeletion,
    deleteConfirmationModalForCard,
  } = useContext(CardContext);
  const popupRef = useContext(PopupContext);
  const { theme } = useContext(ThemeContext);
  const {
    mutate: undoCardItem,
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
  const {
    data,
    isError,
    error,
    isLoading,
    isPaused,
    isFetching: isFetchingCards,
  } = useGetCards(deck_id!);

  const [editContent, setEditContent] = useState<ContentTypeForEdit>({
    title: "",
    note: "",
    _id: "",
    cardIndex: null,
    cardId: "",
  });
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

  const {
    mutate: deleteCardItem,
    reset: resetDeleteCardResponse,
    isError: isDeleteCardError,
    error: deleteCardError,
  } = useDeleteCard();

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const inputElementRef = useRef<HTMLInputElement>(null);
  const shouldPushRef = useRef<boolean>(false);
  const undoCardDetailsRef = useRef(undoCardDetails);
  undoCardDetailsRef.current = undoCardDetails;
  // Other
  const navigate = useNavigate();
  // just for understanding
  //let oldContent:string  // If you declare a variable like this to store old content it might show undefined because once state changes the function rerenders and that removes the value you set. If you do not want to use state to store then you will have to place the global variable outside the functional component. I was just trying to use global variable to store oldcontent.
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
        message: moveCardError
          ? moveCardError?.message
          : "Something went wrong!",
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
    if (expandTextarea) {
      const timeoutId = setTimeout(() => {
        inputElementRef?.current?.classList.remove("rounded-t-md");
      }, 1200);
      return () => clearTimeout(timeoutId);
    }
  }, [expandTextarea]);

  useEffect(() => {
    if (checkClose) {
      inputElementRef?.current?.classList.remove(
        "rounded-b-md",
        "rounded-t-md"
      );
      inputElementRef?.current?.classList.add("duration-[1.2s]");

      const timeoutId1 = setTimeout(() => {
        inputElementRef?.current?.classList.add("rounded-t-md");
        setCheckClose(false);
      }, 1300);

      const timeoutId2 = setTimeout(() => {
        inputElementRef?.current?.classList.add("rounded-b-md");
      }, 600);

      const timeoutId3 = setTimeout(() => {
        textareaRef?.current?.classList.add("opacity-0");
      }, 950);

      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        clearTimeout(timeoutId3);
      };
    } else {
      inputElementRef?.current?.classList.add("rounded-b-md", "rounded-t-md");
    }
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

  useEffect(() => {
    if (showFullScreen || isConfirmDeleteModalOpen || openModal) {
      // Close the keyboard on phones when the user opens modals or enters fullscreen card view.
      if (document?.activeElement === textareaRef?.current) {
        textareaRef?.current?.blur();
      } else if (document?.activeElement === inputElementRef?.current) {
        inputElementRef?.current?.blur();
      }
    }
  }, [showFullScreen, isConfirmDeleteModalOpen, openModal]);

  // Here we will check if user has used browser's back button if he uses browsers back button to go back then
  // we will first check if card is open in full screen if it is open then we will close it instead of going back to the previous page directly.
  // This is usefull when user is accessing the site on mobile because most users swipe to go back.
  // Update the ref whenever undoCardDetails changes

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
        const url = new URL(document.URL);
        const absolutePath = url.pathname;
        //Using navigate() can cause the whole tree to re-render. To avoid that, I am using the History API, as it achieves what I want to achieve without re-rendering the whole tree.
        window.history.pushState(
          { isBackButtonNotClicked: true },
          "",
          absolutePath
        );
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

  const handleUndoButtonClick = useCallback(() => {
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

    undoCardItem(undoCardDetailsRef.current!, {
      onSettled: () => {
        resetUndoCardDetailsValue(null);
      },
    });
  }, [undoCardItem, isOnline, undoCardDetailsRef]);

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
  const handleCreateCard = useCallback(
    async (e: FormEvent) => {
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

      if (isFetchingCards || isCreatingCard) {
        if (popupRef) {
          popupRef?.current?.show(
            "Your previous card is being saved to the server. Please wait a moment..."
          );
        }
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
            handlePlayAudio("createdSuccessfully", "/cards");
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
    },
    [
      isOnline,
      title,
      note,
      isPlayingAudioAllowed,
      height,
      addCard,
      deck_id,
      isCreatingCard,
      isFetchingCards,
    ]
  );

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

    if (window?.history?.state?.isBackButtonNotClicked) {
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

      {showTips && (
        <Tips
          setShowTips={setShowTips}
          closeTipsModal={closeTipsModal}
          setCloseTipsModal={setCloseTipsModal}
        />
      )}

      <TrashCanDropZone
        droppableId="cardDeleteArea"
        altText="Trash can for deleting card"
      />

      <div className="flex flex-col gap-2 w-full  relative overflow-auto h-screen  ">
        <CardInput
          expandTextarea={expandTextarea}
          handleCreateCard={handleCreateCard}
          data={data}
          setIsTransitioning={setIsTransitioning}
          setExpandTextArea={setExpandTextArea}
          setTitle={setTitle}
          title={title}
          note={note}
          setNote={setNote}
          adjustTextareaHeightOnPasteAndExpand={
            adjustTextareaHeightOnPasteAndExpand
          }
          height={height}
          textareaRef={textareaRef}
          inputElementRef={inputElementRef}
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
            isCreatingCard={isCreatingCard}
            isFetchingCards={isFetchingCards}
          />
        </CardInput>

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
                    handlePlayAudio("open", "/cards");
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
        setIsConfirmDeleteModalOpen={setIsConfirmDeleteModalOpen}
        setWasDeleteModalOpen={setWasDeleteModalOpen}
        showFullScreen={showFullScreen}
        setUndoCardDetails={setUndoCardDetails}
        undoButtonRefForCard={undoButtonRefForCard}
        handleUndoButtonClick={handleUndoButtonClick}
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

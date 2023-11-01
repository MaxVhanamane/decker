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
import { AlertData, AxiosErrorType } from "../types/types";
import { Droppable } from "react-beautiful-dnd";
import { TbBulbFilled } from "react-icons/tb";
import { BiCodeCurly } from "react-icons/bi";
import { AiOutlineBold, AiOutlineLink } from "react-icons/ai";
import { FiMinusSquare, FiPlusSquare } from "react-icons/fi";
import { GoEyeClosed } from "react-icons/go";

import Loading from "../components/Loading";
import PopUpMessage from "../components/PopUpMessage";
import ConfirmDeleteModalForCard from "../components/card/ConfirmDeleteModalForCard";
import CardItems from "../components/card/CardItems";
import SessionExpired from "../components/Session";
import ConfirmCloseCard from "../components/card/ConfirmCloseCard";
import { OfflineContext } from "../context/OfflineContext";
import ErrorDisplay from "../components/ErrorDisplay";

import shortid from "shortid";
import { BsChevronExpand, BsTypeUnderline } from "react-icons/bs";
import { FaExpand } from "react-icons/fa";
import Tips from "../components/card/Tips";
import FullScreenCardView from "../components/card/FullScreenCardView";

import EditCard from "../components/card/EditCard";
import { searchContext } from "../context/SearchContext";
// types
// let oldContent:string //this  works
type ContentType = {
  title: string;
  note: string;
  _id: string;
  cardId: string;
};

type ContentTypeForPayload = {
  title: string;
  note: string;
  cardId: string;
};

type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
};

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
};

type PayloadType = {
  deck_id: string;
  content: ContentTypeForPayload;
};

let wasDeleteModalOpen2: boolean;

// Component
const Cards: FC = () => {
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
    indexOfCardForDeletion,
    setIndexOfCardForDeletion,
    deleteConfirmationModalForCard,
    theme,
    divRefForUserSettings,
    handleShowUserInfomation,
    showLogoutModal,
    setShowLogoutModal,
  } = useContext(UserContext);
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

  const { data, isError, error, isLoading } = useGetCards(
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
  const { mutate: addCard } = useCreateCard();
  const { mutate: editCard } = useEditCard();
  const { mutate: deleteCardItem } = useDeleteCard();

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const showPopUp = useRef<HTMLDivElement | null>(null);
  const inputElementRef = useRef<HTMLInputElement>(null);
  const shouldPu = useRef<boolean>(false);

  // Other
  const navigate = useNavigate();
  // just for understanding
  //let oldContent:string  // If you declare a variable like this to store old content it might show undefined because once state changes the function rerenders and that removes the value you set. If you do not want to use state to store then you will have to place the global variable outside the functional component. I was just trying to use global variable to store oldcontent.

  //useEffects

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
  }, [expandTextarea, inputElementRef]);

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
  }, [checkClose, inputElementRef, textareaRef]);

  useEffect(() => {
    if (cardDeleted) {
      setCardDeleted(false);
    }
  }, []);

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

    if (shouldPushState && !shouldPu.current) {
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
      shouldPu.current = true;
    } else {
      shouldPu.current = false;
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

  // onClick handlers
  const handleSubmit = async (e: FormEvent) => {
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
      addCard(payload);
      setNote("");
      setTitle("");
      setHeight(80);
    } else {
      setNote("");
      setTitle("");
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
    [isOnline, setEditContent, setOpenModal]
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
      return;
    }
    let data = {
      deck_id: deck_id!,
      newContent: editContent,
      index: editContent.cardIndex!,
    };

    if (editContent.title.length > 0 || editContent.note.length > 0) {
      editCard(data);
      setCloseEditModal(true);
      setFullScreenCardData({ ...editContent });
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
      showPopUp.current.classList.add("!w-fit");
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

  const addCodeBlock = useCallback(
    (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      let newNote: string;
      let currentSelectionStart: number;
      let currentSelectionEnd: number;
      // check which button is clicked using name property so that we can add  our code string(\`\`\`Code goes here\`\`\` ) to correct textarea
      if (e.currentTarget.name === "addCodeSnippetToAddCard") {
        // textareaRef?.current?.selectionStart will give us the cursor position. we will add our code string to that cursor position.
        // it will assign 0 to selectionStart if textareaRef?.current?.selectionStart is undefined
        const selectionStart = textareaRef?.current?.selectionStart || 0;
        // textareaRef?.current?.selectionEnd we need this to get remaining string if we add the code string(\`\`\`Code goes here\`\`\` ) in the middle of the note
        // like this `${note.substring(0, selectionStart)} \`\`\`Code goes here\`\`\` ${note.substring(selectionEnd)}`;
        const selectionEnd = textareaRef?.current?.selectionEnd || 0;
        // if user has not selected any text then selectionEnd-selectionStart will be 0. Then we will add \`\`\`Code goes here\`\`\`.
        // if selectionEnd-selectionStart is greater than 0 it means user has selected some text in that case we will convert the selected text to code string like this \`\`\`selectedText\`\`\`.
        if (selectionEnd - selectionStart === 0) {
          // now here newNote variable contains original string with our code string.
          newNote = `${note.substring(
            0,
            selectionStart
          )} \`\`\`Code goes here\`\`\` ${note.substring(selectionEnd)}`;
          // Now we need currentSelectionStart and currentSelectionEnd variables to store the position of \`\`\`Code goes here\`\`\`
          // so that once user clicks on {}(i.e addCode button) the text that it adds will be automatically selected. if we automatically select the newly added text then we don't have to remove "Code goes here" string manually I can start typing directly.
          // added 4 and 14  so that i can select only "Code goes here" not the whole string with backticks \`\`\`Code goes here\`\`\`
          // I have used these variables in setTimeout for auto selection.
          currentSelectionStart =
            (textareaRef?.current?.selectionStart || 0) + 4;
          currentSelectionEnd = currentSelectionStart + 14;
          // adding updated string to state so that I can see the changes on screen.
          setNote(newNote);
          // You need setTimeout because React will perform a batch update and re-render the component after setNote is called, which may result in the textarea's DOM not yet being updated when you call textareaRef.current.focus() and textareaRef.current.setSelectionRange(). Using setTimeout with a value of 0 allows React to finish its updates before the code in the setTimeout function is executed. This ensures that the textarea's DOM has been updated and that you are able to properly set the focus and selection range.
          setTimeout(() => {
            textareaRef?.current?.focus();
            textareaRef?.current?.setSelectionRange(
              currentSelectionStart,
              currentSelectionEnd
            );
          }, 0);
        }
        // If user has selected some text then we don't need to auto select the newly added text. we will just add code string to the selected text.
        else {
          // Check if the selected text is already in code string . If it has ``` on both sides (e.g ```your code```), it is already code string and will be converted to normal text. If it has no ``` on both sides, it is normal text and will be converted to code string.
          // get the selected text
          let selectedContent = note.substring(selectionStart, selectionEnd);
          //expectedSubstring is used to compare text in if statement.
          const expectedSubstring = `\`\`\`${selectedContent}\`\`\``;
          // selectionStart will give us selected text's index. if we do -3 then we get text with ```. and we will use startingIndex+expectedSubstring.length to get the complete selected text with ```.
          const startingIndex = selectionStart - 3;
          const extractedSubstring = note.substring(
            startingIndex,
            startingIndex + expectedSubstring.length
          );
          // if extractedSubstring === expectedSubstring is true it means the text is already bold and will be converted to normal text.
          if (extractedSubstring === expectedSubstring) {
            // suppose I have a string that looks like this data="My name ```console.log("hello")``` Max"
            //  before var will give us "My name" and after var will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
            const before = note.slice(0, startingIndex);
            const after = note.slice(startingIndex + expectedSubstring.length);

            newNote = before + selectedContent + after;
            setNote(newNote);
          }
          // if extractedSubstring === expectedSubstring is false means text is not in code string then we will make it code string by adding ```
          else {
            newNote = `${note.substring(
              0,
              selectionStart
            )}\`\`\`${selectedContent}\`\`\`${note.substring(selectionEnd)}`;
            setNote(newNote);
          }
        }
      } else if (e.currentTarget.name === "addCodeSnippetToEditCard") {
        const selectionStart = editTextareaRef?.current?.selectionStart || 0;
        const selectionEnd = editTextareaRef?.current?.selectionEnd || 0;
        // if user has not selected any text then selectionEnd-selectionStart will be 0. Then we will add \`\`\`Code goes here\`\`\`.
        // if selectionEnd-selectionStart is greater than 0 it means user has selected some text in that case we will convert the selected text to code string like this \`\`\`selectedText\`\`\`.
        if (selectionEnd - selectionStart === 0) {
          newNote = `${editContent.note.substring(
            0,
            selectionStart
          )} \`\`\`Code goes here\`\`\` ${editContent.note.substring(
            selectionEnd
          )}`;

          currentSelectionStart =
            (editTextareaRef?.current?.selectionStart || 0) + 4;
          currentSelectionEnd = currentSelectionStart + 14;
          setEditContent({ ...editContent, note: newNote });
          setTimeout(() => {
            // When I add code string in editTextArea it was scrolling to the top automatically.
            // To avoid that we will get the scrollPosition using editTextareaRef?.current?.scrollTop
            // Then later we will use that so that when I add code string it stays where it was before.
            const scrollTop = editTextareaRef?.current?.scrollTop || 0;
            if (editTextareaRef?.current) {
              editTextareaRef.current.focus();
              editTextareaRef.current.setSelectionRange(
                currentSelectionStart,
                currentSelectionEnd
              );
              editTextareaRef.current.scrollTop = scrollTop;
            }
          }, 0);
        }

        // If user has selected some text then we don't need to auto select the newly added text. we will just add code string to the selected text.
        else {
          let selectedContent = editContent.note.substring(
            selectionStart,
            selectionEnd
          );
          //expectedSubstring is used to compare text in if statement.
          const expectedSubstring = `\`\`\`${selectedContent}\`\`\``;
          // selectionStart will give us selected text's index. if we do -3 then we get text with ```. and we will use startingIndex+expectedSubstring.length to get the complete selected text with ```.
          const startingIndex = selectionStart - 3;
          const extractedSubstring = editContent.note.substring(
            startingIndex,
            startingIndex + expectedSubstring.length
          );
          // if extractedSubstring === expectedSubstring is true it means the text is already bold and will be converted to normal text.
          if (extractedSubstring === expectedSubstring) {
            // suppose I have a string that looks like this data="My name ```console.log("hello")``` Max"
            //  before var will give us "My name" and after var will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
            const before = editContent.note.slice(0, startingIndex);
            const after = editContent.note.slice(
              startingIndex + expectedSubstring.length
            );

            newNote = before + selectedContent + after;
            setEditContent({ ...editContent, note: newNote });
          }
          // if extractedSubstring === expectedSubstring is false means text is not in code string then we will make it code string by adding ```
          else {
            newNote = `${editContent.note.substring(
              0,
              selectionStart
            )}\`\`\`${selectedContent}\`\`\`${editContent.note.substring(
              selectionEnd
            )}`;
            setEditContent({ ...editContent, note: newNote });
          }
        }
      }
    },
    [note, setNote, editContent, setEditContent]
  );

  const addBoldText = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      let newNote: string;
      let currentSelectionStart: number;
      let currentSelectionEnd: number;
      // check which button is clicked using name property so that we can add our bold string (**Bold text.**) to correct textarea
      if (e.currentTarget.name === "addBoldTextToAddCard") {
        // textareaRef?.current?.selectionStart will give us the cursor position. we will add our bold string to that cursor position.
        // it will assign 0 to selectionStart if textareaRef?.current?.selectionStart is undefined
        const selectionStart = textareaRef?.current?.selectionStart || 0;
        // textareaRef?.current?.selectionEnd we need this to get remaining string if we add the bold string (**Bold text.**) in the middle of the note
        // like this `${note.substring(0, selectionStart)} **Bold text.** ${note.substring(selectionEnd)}`;
        const selectionEnd = textareaRef?.current?.selectionEnd || 0;
        // if user has not selected any text then selectionEnd-selectionStart will be 0. Then we will add **Bold text.**.
        // if selectionEnd-selectionStart is greater than 0 it means user has selected some text then we will make the selected text bold.
        if (selectionEnd - selectionStart === 0) {
          newNote = `${note.substring(
            0,
            selectionStart
          )} **Bold text** ${note.substring(selectionEnd)}`;
          // Now we need currentSelectionStart and currentSelectionEnd variables to store the position of **Bold text.**
          // so that once user clicks on B (Bold text button) the text that it adds will be automatically selected. if we automatically select the newly added text then we don't have to remove "put your text inside ** to make it bold. eg. **your content**" string manually I can start typing directly.
          // added 3 and 9  so that i can select only "put your text inside ** to make it bold. eg. **your content**" not the whole string with asterisks like this **Bold text.**
          // I have used these variables in setTimeout for auto selection.
          currentSelectionStart =
            (textareaRef?.current?.selectionStart || 0) + 3;
          currentSelectionEnd = currentSelectionStart + 9;
          setNote(newNote);
          setTimeout(() => {
            textareaRef?.current?.focus();
            textareaRef?.current?.setSelectionRange(
              currentSelectionStart,
              currentSelectionEnd
            );
          }, 0);
        }
        // If user has selected some text then we don't need to auto select the newly added text. we will just bold the selected text.
        // or if it is already bold then we will make it normal text.
        else {
          // Check if the selected text is already bold. If it has "**" on both sides (e.g. **text**), it is already bold and will be converted to normal text. If it has no "**" on both sides, it is normal text and will be converted to bold.
          // get the selected text
          let selectedContent = note.substring(selectionStart, selectionEnd);
          //expectedSubstring is used to compare text in if statement.
          const expectedSubstring = `**${selectedContent}**`;
          // selectionStart will give us selected text's index. if we do -2 then we get text with **. and we will use startingIndex+expectedSubstring.length to get the complete selected text with **.
          const startingIndex = selectionStart - 2;
          const extractedSubstring = note.substring(
            startingIndex,
            startingIndex + expectedSubstring.length
          );
          // if extractedSubstring === expectedSubstring is true it means the text is already bold and will be converted to normal text.
          if (extractedSubstring === expectedSubstring) {
            // suppose I have a string that looks like this data="My name **is** Max"
            //  before var will give us "My name" and after var will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
            const before = note.slice(0, startingIndex);
            const after = note.slice(startingIndex + expectedSubstring.length);

            newNote = before + selectedContent + after;
            setNote(newNote);
          }
          // if extractedSubstring === expectedSubstring is false means text is not bold then we will make it bold by adding **
          else {
            newNote = `${note.substring(
              0,
              selectionStart
            )}**${selectedContent}**${note.substring(selectionEnd)}`;
            setNote(newNote);
          }
        }
      } else if (e.currentTarget.name === "addBoldTextToEditCard") {
        const selectionStart = editTextareaRef?.current?.selectionStart || 0;
        const selectionEnd = editTextareaRef?.current?.selectionEnd || 0;
        // If the user hasn't selected any text, selectionEnd - selectionStart will equal 0. In that case, **Bold text.** will be added at the cursor's position. selectionStart will give us cursor position(it is like index).
        // if selectionEnd-selectionStart is greater than 0 it means user has selected some text then we will make the selected text bold.
        if (selectionEnd - selectionStart === 0) {
          newNote = `${editContent.note.substring(
            0,
            selectionStart
          )} **Bold text** ${editContent.note.substring(selectionEnd)}`;
          currentSelectionStart =
            (editTextareaRef?.current?.selectionStart || 0) + 3;
          currentSelectionEnd = currentSelectionStart + 9;
          setEditContent({ ...editContent, note: newNote });

          setTimeout(() => {
            // When I add Bold string in editTextArea it was scrolling to the top automatically.
            // To avoid that we will get the scrollPosition using editTextareaRef?.current?.scrollTop
            // Then later we will use that so that when I add code string it stays where it was before.
            const scrollTop = editTextareaRef?.current?.scrollTop || 0;
            if (editTextareaRef?.current) {
              editTextareaRef?.current?.focus();
              editTextareaRef?.current?.setSelectionRange(
                currentSelectionStart,
                currentSelectionEnd
              );
              editTextareaRef.current.scrollTop = scrollTop;
            }
          }, 0);
        }
        // If user has selected some text then we don't need to auto select the newly added text. we will just bold the selected text.
        // or if it is already bold then we will make it normal text.
        else {
          // Check if the selected text is already bold. If it has "**" on both sides (e.g. **text**), it is already bold and will be converted to normal text. If it has no "**" on both sides, it is normal text and will be converted to bold.
          // get the selected text
          let selectedContent = editContent.note.substring(
            selectionStart,
            selectionEnd
          );
          //expectedSubstring is used to compare text in if statement.
          const expectedSubstring = `**${selectedContent}**`;
          // selectionStart will give us selected text's index. if we do -2 then we get text with **. and we will use startingIndex+expectedSubstring.length to get the complete selected text with **.
          const startingIndex = selectionStart - 2;
          const extractedSubstring = editContent.note.substring(
            startingIndex,
            startingIndex + expectedSubstring.length
          );
          // if extractedSubstring === expectedSubstring is true it means the text is already bold and will be converted to normal text.
          if (extractedSubstring === expectedSubstring) {
            // suppose I have a string that looks like this data="My name **is** Max"
            //  before var will give us "My name" and after var will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
            const before = editContent.note.slice(0, startingIndex);
            const after = editContent.note.slice(
              startingIndex + expectedSubstring.length
            );

            newNote = before + selectedContent + after;
            setEditContent({ ...editContent, note: newNote });
          }
          // if extractedSubstring === expectedSubstring is false means text is not bold then we will make it bold by adding **
          else {
            newNote = `${editContent.note.substring(
              0,
              selectionStart
            )}**${selectedContent}**${editContent.note.substring(
              selectionEnd
            )}`;
            setEditContent({ ...editContent, note: newNote });
          }
        }
      }
    },
    [note, setNote, editContent, setEditContent]
  );

  const addUnderlineText = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      let newNote: string;
      let currentSelectionStart: number;
      let currentSelectionEnd: number;
      // check which button is clicked using name property so that we can add our underline string (_Underlined text_) to the correct textarea
      if (e.currentTarget.name === "addUnderlineTextToAddCard") {
        // textareaRef?.current?.selectionStart will give us the cursor position. we will add our underline string to that cursor position.
        // it will assign 0 to selectionStart if textareaRef?.current?.selectionStart is undefined
        const selectionStart = textareaRef?.current?.selectionStart || 0;
        // textareaRef?.current?.selectionEnd we need this to get remaining string if we add the underline string (_Underlined text_) in the middle of the note
        // like this `${note.substring(0, selectionStart)} _Underlined text_ ${note.substring(selectionEnd)}`;
        const selectionEnd = textareaRef?.current?.selectionEnd || 0;
        // if user has not selected any text then selectionEnd-selectionStart will be 0. Then we will add _Underlined text_
        // if selectionEnd-selectionStart is greater than 0 it means user has selected some text then we will underline the selected text.
        if (selectionEnd - selectionStart === 0) {
          newNote = `${note.substring(
            0,
            selectionStart
          )} _Underlined text_ ${note.substring(selectionEnd)}`;
          // Now we need currentSelectionStart and currentSelectionEnd variables to store the position of _Underlined text_
          // so that once user clicks on U (Underline text button) the text that it adds will be automatically selected. if we automatically select the newly added text then we don't have to remove "_Underlined text_" string manually I can start typing directly.
          // added 2 and 15  so that I can select only "Underlined text" not the whole string with underscores like this _Underlined text_
          // I have used these variables in setTimeout for auto selection.
          currentSelectionStart =
            (textareaRef?.current?.selectionStart || 0) + 2;
          currentSelectionEnd = currentSelectionStart + 15;
          setNote(newNote);
          setTimeout(() => {
            textareaRef?.current?.focus();
            textareaRef?.current?.setSelectionRange(
              currentSelectionStart,
              currentSelectionEnd
            );
          }, 0);
        }
        // If user has selected some text then we don't need to auto select the newly added text. we will just underline the selected text.
        // or if it is already underlined then we will make it normal text.
        else {
          // Check if the selected text is already underlined. If it has "_" on both sides (e.g. _text_), it is already underlined and will be converted to normal text. If it has no "_" on both sides, it is normal text and will be converted to underlined text.
          // get the selected text
          let selectedContent = note.substring(selectionStart, selectionEnd);
          //expectedSubstring is used to compare text in if statement.
          const expectedSubstring = `_${selectedContent}_`;
          // selectionStart will give us selected text's index. if we do -1 then we get text with _. and we will use startingIndex+expectedSubstring.length to get the complete selected text with _.
          const startingIndex = selectionStart - 1;
          const extractedSubstring = note.substring(
            startingIndex,
            startingIndex + expectedSubstring.length
          );
          // if extractedSubstring === expectedSubstring is true it means the text is already underlined and will be converted to normal text.
          if (extractedSubstring === expectedSubstring) {
            // suppose I have a string that looks like this data="My name _is_ Max"
            //  before variable will give us "My name" and after variable will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
            const before = note.slice(0, startingIndex);
            const after = note.slice(startingIndex + expectedSubstring.length);

            newNote = before + selectedContent + after;
            setNote(newNote);
          }
          // if extractedSubstring === expectedSubstring is false means text is not underlined then we will underline it by adding _
          else {
            newNote = `${note.substring(
              0,
              selectionStart
            )}_${selectedContent}_${note.substring(selectionEnd)}`;
            setNote(newNote);
          }
        }
      } else if (e.currentTarget.name === "addUnderlineTextToEditCard") {
        const selectionStart = editTextareaRef?.current?.selectionStart || 0;
        const selectionEnd = editTextareaRef?.current?.selectionEnd || 0;
        // If the user hasn't selected any text, selectionEnd - selectionStart will equal 0. In that case, _Underlined text_ will be added at the cursor's position. selectionStart will give us cursor position(it is like index).
        // if selectionEnd-selectionStart is greater than 0 it means user has selected some text then we will underline the selected text.
        if (selectionEnd - selectionStart === 0) {
          newNote = `${editContent.note.substring(
            0,
            selectionStart
          )} _Underlined text_ ${editContent.note.substring(selectionEnd)}`;
          currentSelectionStart =
            (editTextareaRef?.current?.selectionStart || 0) + 2;
          currentSelectionEnd = currentSelectionStart + 15;
          setEditContent({ ...editContent, note: newNote });

          setTimeout(() => {
            // When I add Underline string in editTextArea it was scrolling to the top automatically.
            // To avoid that we will get the scrollPosition using editTextareaRef?.current?.scrollTop
            // Then later we will use that so that when I add code string it stays where it was before.
            const scrollTop = editTextareaRef?.current?.scrollTop || 0;
            if (editTextareaRef?.current) {
              editTextareaRef?.current?.focus();
              editTextareaRef?.current?.setSelectionRange(
                currentSelectionStart,
                currentSelectionEnd
              );
              editTextareaRef.current.scrollTop = scrollTop;
            }
          }, 0);
        }
        // If user has selected some text then we don't need to auto select the newly added text. we will just underline the selected text.
        // or if it is already underlined then we will make it normal text.
        else {
          // Check if the selected text is already underlined. If it has "_" on both sides (e.g. _text_), it is already underlined text and will be converted to normal text. If it has no "_" on both sides, it is normal text and will be converted to underlined text.
          // get the selected text
          let selectedContent = editContent.note.substring(
            selectionStart,
            selectionEnd
          );
          //expectedSubstring is used to compare text in if statement.
          const expectedSubstring = `_${selectedContent}_`;
          // selectionStart will give us selected text's index. if we do -1 then we get text with underscore(_). and we will use startingIndex+expectedSubstring.length to get the complete selected text with underscore(_).
          const startingIndex = selectionStart - 1;
          const extractedSubstring = editContent.note.substring(
            startingIndex,
            startingIndex + expectedSubstring.length
          );
          // if extractedSubstring === expectedSubstring is true it means the text is already underlined and will be converted to normal text.
          if (extractedSubstring === expectedSubstring) {
            // suppose I have a string that looks like this data="My name _is_ Max"
            //  before variable will give us "My name" and after variable will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
            const before = editContent.note.slice(0, startingIndex);
            const after = editContent.note.slice(
              startingIndex + expectedSubstring.length
            );

            newNote = before + selectedContent + after;
            setEditContent({ ...editContent, note: newNote });
          }
          // if extractedSubstring === expectedSubstring is false means text is not underlined then we will underline it by adding _
          else {
            newNote = `${editContent.note.substring(
              0,
              selectionStart
            )}_${selectedContent}_${editContent.note.substring(selectionEnd)}`;
            setEditContent({ ...editContent, note: newNote });
          }
        }
      }
    },
    [note, setNote, editContent, setEditContent]
  );

  const addLink = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      let newNote: string;
      let currentSelectionStart: number;
      let currentSelectionEnd: number;

      if (e.currentTarget.name === "addLinkToAddCard") {
        const selectionStart = textareaRef?.current?.selectionStart || 0;

        const selectionEnd = textareaRef?.current?.selectionEnd || 0;

        if (selectionEnd - selectionStart === 0) {
          newNote = `${note.substring(
            0,
            selectionStart
          )} [link name](put your link URL in this bracket) ${note.substring(
            selectionEnd
          )}`;

          currentSelectionStart =
            (textareaRef?.current?.selectionStart || 0) + 13;
          currentSelectionEnd = currentSelectionStart + 33;
          setNote(newNote);
          setTimeout(() => {
            textareaRef?.current?.focus();
            textareaRef?.current?.setSelectionRange(
              currentSelectionStart,
              currentSelectionEnd
            );
          }, 0);
        }
      } else if (e.currentTarget.name === "addLinkToEditCard") {
        const selectionStart = editTextareaRef?.current?.selectionStart || 0;
        const selectionEnd = editTextareaRef?.current?.selectionEnd || 0;

        if (selectionEnd - selectionStart === 0) {
          newNote = `${editContent.note.substring(
            0,
            selectionStart
          )} [link name](put your link URL in this bracket)
          \ ${editContent.note.substring(selectionEnd)}`;
          currentSelectionStart =
            (editTextareaRef?.current?.selectionStart || 0) + 13;
          currentSelectionEnd = currentSelectionStart + 33;
          setEditContent({ ...editContent, note: newNote });

          setTimeout(() => {
            const scrollTop = editTextareaRef?.current?.scrollTop || 0;
            if (editTextareaRef?.current) {
              editTextareaRef?.current?.focus();
              editTextareaRef?.current?.setSelectionRange(
                currentSelectionStart,
                currentSelectionEnd
              );
              editTextareaRef.current.scrollTop = scrollTop;
            }
          }, 0);
        }
      }
    },
    [note, setNote, editContent, setEditContent]
  );

  if (isLoading) {
    return <Loading />;
  }
  if (
    data?.message ===
    "Your session has expired. Please log in again to continue."
  ) {
    return <SessionExpired />;
  }

  if (isError) {
    return (
      <ErrorDisplay
        theme={theme}
        isError={isError}
        error={error as AxiosErrorType}
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
        <title>Cards</title>
        <meta
          name="description"
          content="View and manage the detailed information on our interactive cards. Each card contains information related to the particular card that you have created, all organized within their respective decks."
        />
      </Helmet>

      <PopUpMessage
        message="Drag and drop the card here to delete it."
        showPopUp={showPopUp}
      />
      {showTips && (
        <Tips
          setShowTips={setShowTips}
          closeTipsModal={closeTipsModal}
          setCloseTipsModal={setCloseTipsModal}
        />
      )}

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
                title="Drag and drop the card here to delete it."
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
            onSubmit={handleSubmit}
            className="flex flex-col  gap-4 justify-center items-center  "
          >
            {/* <label htmlFor="title" className=" font-bold text-teal-600 dark:text-sky-400">
            Card details
          </label> */}
            <div className="flex flex-col ">
              <div
                onTransitionEnd={() => {
                  if (data && data?.cards.length === 0) {
                    setIsTransitioning(false);
                  }
                }}
                className={`transition duration-1000 delay-1000 ${
                  expandTextarea
                    ? "h-8 p-1 border-t-2 opacity-100"
                    : "h-8 p-0 translate-y-full border-t-2"
                } flex item-center justify-end pr-4 border-r-2 border-l-2 border-teal-500 dark:border-sky-400 rounded-t-md gap-2 lg:w-[40vw] md:w-[70vw] w-[95vw] `}
              >
                <div className={`flex gap-2`}>
                  <button
                    title="Add a link"
                    className="dark:text-gray-200 dark:hover:text-gray-400   text-gray-500 hover:text-gray-900 text-xl transition-all duration-300"
                    type="button"
                    name="addLinkToAddCard"
                    onClick={(e) => addLink(e)}
                  >
                    <AiOutlineLink />
                  </button>
                  <button
                    title="Add code sample"
                    className="dark:text-gray-200 dark:hover:text-gray-400   text-gray-500 hover:text-gray-900 text-xl transition-all duration-300"
                    type="button"
                    name="addCodeSnippetToAddCard"
                    onClick={(e) => addCodeBlock(e)}
                  >
                    <BiCodeCurly />
                  </button>
                  <button
                    name="addUnderlineTextToAddCard"
                    title="Underline text"
                    className="dark:text-gray-200 dark:hover:text-gray-400  text-gray-500 hover:text-gray-900 text-xl transition-all duration-300 "
                    type="button"
                    onClick={(e) => addUnderlineText(e)}
                  >
                    <BsTypeUnderline />
                  </button>
                  <button
                    name="addBoldTextToAddCard"
                    title="Bold text"
                    className="dark:text-gray-200 dark:hover:text-gray-400  text-gray-500 hover:text-gray-900 text-xl transition-all duration-300 "
                    type="button"
                    onClick={(e) => addBoldText(e)}
                  >
                    <AiOutlineBold />
                  </button>
                  <button
                    title="Tips"
                    className="text-yellow-400 hover:text-yellow-500  text-xl transition-all duration-300"
                    type="button"
                    name="tips"
                    onClick={() => setShowTips(true)}
                  >
                    <TbBulbFilled />
                  </button>

                  <button
                    title="Decrease TextArea Height"
                    className="text-orange-500 hover:text-orange-600 text-xl transition-all duration-300"
                    type="button"
                    onClick={decreaseTextAreaHeight}
                  >
                    <FiMinusSquare />
                  </button>
                  <button
                    title="Increase TextArea Height"
                    className="text-green-500 hover:text-green-600  text-xl transition-all duration-300"
                    type="button"
                    onClick={increaseTextAreaHeight}
                  >
                    <FiPlusSquare />
                  </button>
                  <button
                    title="Expand TextArea Fully"
                    className="text-green-500 hover:text-green-600  text-md transition-all duration-300 ml-6"
                    type="button"
                    onClick={adjustTextareaHeightOnPasteAndExpand}
                  >
                    <FaExpand />
                  </button>
                  <button
                    title="Close"
                    className="text-red-500 hover:text-red-600  text-[1.2rem] transition-all duration-300 ml-1"
                    type="button"
                    onClick={() => {
                      if (title.trim().length > 0 || note.trim().length > 0) {
                        setShowConfirmCloseCardModal(true);
                      } else {
                        setExpandTextArea(false),
                          setCheckClose(true),
                          setHeight(80);
                        setNote("");
                        setTitle("");
                        if (data && data?.cards.length === 0) {
                          setIsTransitioning(true);
                        }
                      }
                    }}
                  >
                    <GoEyeClosed />
                  </button>
                </div>
              </div>
              <div className="h-10 lg:max-w-[40vw] md:max-w-[70vw] max-w-[95vw] z-10 relative">
                <input
                  ref={inputElementRef}
                  onClick={() => setExpandTextArea(true)}
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
                  className={`${
                    expandTextarea
                      ? "border-b-0 rounded-none text-left border-t-2 rounded-t-md mt-0"
                      : "border-b-2 border-t-2 rounded-b-md rounded-t-md text-center cursor-pointer"
                  } transition-[border-radius]  h-10 px-3 py-2  pb-2 w-full  bg-[#fcfefc]  border-r-2 border-l-2  border-teal-500 dark:border-sky-400   font-semibold outline-none text-md text-gray-800   dark:bg-slate-950 dark:text-gray-50 z-10 `}
                  placeholder={`${
                    expandTextarea ? "Title" : "Craft an Elegant Note"
                  } `}
                />
                {!expandTextarea && (
                  <div className="absolute  top-1/2 -translate-y-1/2 right-8 cursor-pointer  ">
                    <BsChevronExpand
                      onClick={() => setExpandTextArea(true)}
                      className="dark:text-gray-100 text-teal-600 "
                    />
                  </div>
                )}
              </div>
              <textarea
                className={` ${
                  expandTextarea
                    ? " py-2 border-b-2 rounded-t-0 opacity-100"
                    : "py-0 border-b-2"
                } lg:w-[40vw]  md:w-[70vw] bg-[#fcfefc] w-[95vw]  border-r-2 border-l-2  border-teal-500 dark:border-sky-400 rounded-b-md  outline-none  text-gray-800 px-3 text-md  dark:bg-slate-950 dark:text-gray-50 resize-none transition-[height,padding,border] duration-1000 overflow-hidden  -mt-1 overflow-y-auto `}
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
            <div className="flex justify-end">
              <button
                className={` outline-none py-1  ${
                  expandTextarea ? "opacity-100" : "opacity-0"
                } transition-[opacity] duration-1000`}
                aria-label="Create Card"
                type="submit"
                disabled={expandTextarea ? false : true}
              >
                <span className="bg-teal-600 hover:bg-teal-700 text-gray-50 font-semibold text-center py-2 px-2 rounded-md dark:bg-sky-600 dark:hover:bg-sky-700 transition-colors duration-300">
                  Create Card
                </span>
              </button>
            </div>
          </form>
          {data && data?.cards.length > 0 ? (
            <h1 className="font-bold text-xl text-gray-800 mb-6 dark:text-gray-50 mt-6">
              {data?.title}
            </h1>
          ) : null}
        </div>

        {data && data?.cards.length > 0 ? (
          <CardItems
            handleDelete={handleDelete}
            handleEdit={handleEdit}
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
            <p className="p-1 mt-1 text-md">
              Looks like you haven't added any cards yet.
            </p>
            <button
              onClick={() => setExpandTextArea(true)}
              className=" mt-4  inline-block  py-2 lg:py-2.5 font-medium text-sm leading-tight  rounded-md  active:shadow-lg text-gray-50   w-fit px-2  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out  "
              type="button"
              aria-label="Craft an Elegant Note"
            >
              Craft an Elegant Note
            </button>
          </div>
        ) : null}
      </div>

      {openModal ? (
        <EditCard
          setOpenModal={setOpenModal}
          addLink={addLink}
          addCodeBlock={addCodeBlock}
          addBoldText={addBoldText}
          addUnderlineText={addUnderlineText}
          editContent={editContent}
          handleChange={handleChange}
          handleSave={handleSave}
          ref={editTextareaRef}
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

export default memo(Cards);

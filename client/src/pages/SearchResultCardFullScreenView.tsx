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

// types
type ContentType = {
  title: string;
  note: string;
  _id: string;
  cardId: string;
};

type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
  from?: "";
};

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
};
let wasDeleteModalOpen2: boolean;

// Component
const SearchResultCardFullScreenView: FC = () => {
  // States
  const { setAlert } = useContext(AlertContext);
  const {
    showSearchBar,
    setOpenSearchBar,
    cardInfo,
    setCardInfo,
    setCardDeleted,
    cardDeleted,
  } = useContext(searchContext);
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
  const { mutate: editCard } = useEditCard();
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

  if (cardDeleted) {
    return (
      <div className="z-[90] flex items-center justify-center fixed top-[3.45rem] h-full left-1/2 -translate-x-1/2 text-white dark:bg-gradient-to-r dark:from-slate-950   dark:via-slate-800 dark:bg-transparent w-full">
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
          addLink={addLink}
          addCodeBlock={addCodeBlock}
          addBoldText={addBoldText}
          addUnderlineText={addUnderlineText}
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

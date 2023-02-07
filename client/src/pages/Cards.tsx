import {
  ChangeEvent,
  FormEvent,
  useState,
  useRef,
  useContext,
  Dispatch,
  MouseEvent,
  FC,
  useEffect,
  useCallback,
} from "react";
import React from "react";
import { useParams } from "react-router-dom";
import useGetCards from "../hooks/useGetCards";
import useCreateCard from "../hooks/useCreateCard";
import useDeleteCard from "../hooks/useDeleteCard";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { BiCodeCurly, BiEdit } from "react-icons/bi";
import useEditCard from "../hooks/useEditCard";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { BsTrash } from "react-icons/bs";
import { AiOutlineBold } from "react-icons/ai";
import { FiMinusSquare, FiPlusSquare } from "react-icons/fi";
import Loading from "../components/Loading";
import PopUpMessage from "../components/PopUpMessage";
import { AlertContext } from "../context/AlertState";
import { AlertData } from "../types/types";
import { IoIosArrowRoundBack } from "react-icons/io";
import ThemeToggler from "../components/ThemeToggler";
import ConfirmDeleteModalForCard from "./../components/ConfirmDeleteModalForCard";
import { UserContext } from "./../context/UserContext";
import { Helmet } from "react-helmet";
import { useNavigate,useLocation  } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// types
// let oldContent:string //this  works
type ContentType = {
  title: string;
  note: string;
  _id: string;
};

type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
};

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
};

type PayloadType = {
  deck_id: string;
  content: ContentType;
};
type PropType = {
  indexOfCardForDeletion: number | null;
  setIndexOfCardForDeletion: Dispatch<React.SetStateAction<number | null>>;
};


// Component
const Cards: FC<PropType> = ({
  indexOfCardForDeletion,
  setIndexOfCardForDeletion,
}) => {
  const { setAlert } = useContext(AlertContext);
  const [note, setNote] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [height, setHeight] = useState(80);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { deleteConfirmationModalForCard } = useContext(UserContext);
  const changeColorWhileDragging = useRef<HTMLDivElement | null>(null);
  const showPopUp = useRef<HTMLDivElement | null>(null);
  const { deck_id } = useParams();
  const navigate = useNavigate ();
  const location = useLocation();
  const [fullScreenCardData, setFullScreenCardData] =
    useState<ContentForFullScreen>({
      title: "",
      note: "",
      _id: "",
      cardIndex: null,
    });

  
  // just for understanding
  //let oldContent:string  // If you declare a variable like this to store old content it might show undefined because once state changes the function rerenders and that removes the value you set. If you do not want to use state to store then you will have to place the global variable outside the functional component. I was just trying to use global variable to store oldcontent.
  const { data, isError, error, isLoading } = useGetCards(deck_id!);
  const [editContent, setEditContent] = useState<ContentTypeForEdit>({
    title: "",
    note: "",
    _id: "",
    cardIndex: null,
  });

  // If user clicks on browser's back button (on mobile when he swipes back) and if some modal is open then we will close that modal instead of
  // redirecting him to home page. if there is no modal open then we will navigate him to home page.
  const handleBrowsersBackButton = useCallback(
    function (event:PopStateEvent) {
      console.log("showFullScreen",showFullScreen)
      if (openModal || showFullScreen) {
        event.preventDefault()
        openModal?setOpenModal(false):setShowFullScreen(false)
        
      } else {
        event.preventDefault();
        navigate("/")
      }
    },
    [openModal,showFullScreen]
  );
    useEffect(() => {
      // This is how you detect if the browser's back button is clicked or not.
      window.history.pushState(null, '', document.URL);
      window.addEventListener("popstate", handleBrowsersBackButton);
      return () => {
        window.removeEventListener("popstate", handleBrowsersBackButton);
      };
    }, [openModal,showFullScreen]);
    




  useEffect(() => {
    //     scrollHeight is a property of an HTML element that represents the height of an element's content, including any overflowed content that is hidden, as a result of applying CSS overflow property. It includes padding but not the border, scrollbar or margin.

    // clientHeight is a property of an HTML element that represents the height of an element's content area, including padding but excluding the border, scrollbar or margin. (which means height that is our state and clientHeight are same. as we have added py-2 there is lil difference )
    if (textareaRef?.current) {
      const textarea = textareaRef.current;
      // We will only increase the height of the textarea when the content height is greater than the textarea's height.
      if (textarea.scrollHeight > textarea.clientHeight) {
        // adding an extra 40+ to avoid weird bug. if I don't add this, then if you hit enter then while adding height it moves the content inside textarea which looks weird.
        setHeight(textarea.scrollHeight + 40);
      }
    }
  }, [note]);

 
  const {
    mutate: addCard,
    error: mutationError,
    isError: isMutationError,
  } = useCreateCard();
  const {
    mutate: editCard,
    error: editMutationError,
    isError: isEditMutationError,
  } = useEditCard();

  const {
    mutate: deleteCardItem,
    error: DeletemutationError,
    isError: isDeleteMutationError,
  } = useDeleteCard();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (title.length > 0 || note.length > 0) {
      const content = { title, note, _id: deck_id! };
      const payload: PayloadType = { deck_id: deck_id!, content };
      addCard(payload);
      setNote("");
      setTitle("");
    } else {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "warning",
        show: true,
        message: "Title or note should contain one or more characters!",
      }));
    }
  };

  const handleDelete = async (index: number) => {
    setIndexOfCardForDeletion(index);
    if (deleteConfirmationModalForCard?.current?.classList.contains("hidden")) {
      deleteConfirmationModalForCard?.current?.classList.remove("hidden");
    }
  };

  const handleEdit = (cardItem: ContentTypeForEdit) => {
    setEditContent(cardItem);
    setOpenModal(true);
  };

  const handleSave = () => {
    let data = {
      deck_id: deck_id!,
      newContent: editContent,
      index: editContent.cardIndex!,
    };
    if (editContent.title.length > 0 || editContent.note.length > 0) {
      editCard(data);
      setOpenModal(false);
      setFullScreenCardData({ ...editContent });
    } else {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "warning",
        show: true,
        message: "Title or note should contain one or more characters!",
      }));
    }
  };


  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.target.name === "title") {
      setEditContent({ ...editContent, title: e.target.value });
    } else if (e.target.name === "note") {
      setEditContent({ ...editContent, note: e.target.value });
    }
  };
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

  const handleShowFullScreen = (card: ContentForFullScreen) => {
    setShowFullScreen(true);
    setFullScreenCardData({ ...card });
  };

  // The parseNote function separates code from the string and adds SyntaxHighlighter for improved syntax appearance.
  const parseNote = (noteVal: string) => {
    // in a string (noteVal) the code will be always written in (quotes) ``` code ```. so we will use regular expression to
    // extract it from string.
    const regexCode = /```([\s\S]+?)```/g;
    let currentIndex = 0;
    let result = [];
    let match;
    // the line regex.exec will match the part in string that we defined (/```([\s\S]+?)```/g).
    // regex.exe returns the first match to get all the matched string we will use while loop.
    // once it doesn't finds the match it will return null. as soon as it returns null the while loop stops.
    while ((match = regexCode.exec(noteVal)) !== null) {
      // here match[0] has exact string with quotes eg. ``` console.log("hello") ```
      // but match[1] has only the code without the quotes eg. console.log("hello"). so we will use match[1] to get code block and store it in codeBlock variable.
      const codeBlock = match[1];
      // match also has index property we will use that to find out on what index it found the code.
      // suppose my string looks like this noteVal="hi max ```console.log("hello")```
      // here the codeblock starts at index 7 but we need normal text as well we can use the index to get that too
      // here if we use noteVal.substring(currentIndex, startIndex) we will get "hi max" .noteVal.substring(0,7)
      const startIndex = match.index;
      // here we will get the endIndex so that we use it later to get remaining string.
      // here I have used match[0].length because the original string has quotes ``` your code ```. and match[0] gives us actual string
      const endIndex = startIndex + match[0].length;
      // here we will pass normal text and code

      result.push(noteVal.substring(currentIndex, startIndex));
  // best styles- atelierSulphurpoolDark nightOwl atelierPlateauLight atelierCaveLight
  // best prism styles- synthwave84,coldarkDark,oneLight

      result.push(
        <SyntaxHighlighter
          key={startIndex}
          language="javascript"
          wrapLongLines={true}
          style={
            localStorage.getItem("theme") === "dark"
              ? coldarkDark 
              : prism
          }
          customStyle={{backgroundColor:`${localStorage.getItem("theme") === "dark"?"rgb(1, 22, 39)": "auto"}`}}
        >
          {codeBlock}
        </SyntaxHighlighter>
      );
      // when loop moves to next iteration we will set endIndex as currentIndex
      currentIndex = endIndex;
    }
    // This last result.push will push the remaining string.

    result.push(noteVal.substring(currentIndex));

    // extracting bold text
    let finalResult: Array<string | React.ReactElement> = [];
    // I have added bold text in ** your bold text **. so we will use regular expression to extract it.
    const regexBold = /\*\*(.*?)\*\*/g;
    // The 'result' is an array that we created above. We will map over each string in it and check if there is any bold text present in it
    result.forEach((item) => {
      if (typeof item === "string") {
        let text = item;
        let index = 0;
        let match;
        while ((match = regexBold.exec(text)) !== null) {
          const boldText = match[1];
          const startIndex = match.index;
          const endIndex = startIndex + match[0].length;
          finalResult.push(text.substring(index, startIndex));
          finalResult.push(
            <strong
              className="font-bold dark:text-yellow-400  text-gray-900 "
              key={startIndex}
            >
              {boldText}
            </strong>
          );
          index = endIndex;
        }
        finalResult.push(text.substring(index));
      } else {
        finalResult.push(item);
      }
    });

    return finalResult;
  };

  const addCodeBlock = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    let newNote: string;
    let currentSelectionStart: number;
    let currentSelectionEnd: number;
    // check which button is clicked using name property so that we can add  our code string(\`\`\`Code goes here\`\`\` ) to correct textarea
    if(e.currentTarget.name==="addCodeSnippetToAddCard"){
      // textareaRef?.current?.selectionStart will give us the cursor position. we will add our code string to that cursor position.
      // it will assign 0 to selectionStart if textareaRef?.current?.selectionStart is undefined
      const selectionStart = textareaRef?.current?.selectionStart || 0;
      // textareaRef?.current?.selectionEnd we need this to get remaining string if we add the code string(\`\`\`Code goes here\`\`\` ) in the middle of the note
      // like this `${note.substring(0, selectionStart)} \`\`\`Code goes here\`\`\` ${note.substring(selectionEnd)}`;
      const selectionEnd = textareaRef?.current?.selectionEnd || 0;
         // if user has not selected any text then selectionEnd-selectionStart will be 0. Then we will add \`\`\`Code goes here\`\`\`.
    // if selectionEnd-selectionStart is greater than 0 it means user has selected some text in that case we will convert the selected text to code string like this \`\`\`selectedText\`\`\`.
      if(selectionEnd-selectionStart===0){
      // now here newNote variable contains original string with our code string.
      newNote = `${note.substring(0, selectionStart)} \`\`\`Code goes here\`\`\` ${note.substring(selectionEnd)}`;
      // Now we need currentSelectionStart and currentSelectionEnd variables to store the position of \`\`\`Code goes here\`\`\`
      // so that once user clicks on {}(i.e addCode button) the text that it adds will be automatically selected. if we automatically select the newly added text then we don't have to remove "Code goes here" string manually I can start typing directly. 
      // added 4 and 14  so that i can select only "Code goes here" not the whole string with backticks \`\`\`Code goes here\`\`\`
      // I have used these variables in setTimeout for auto selection.
      currentSelectionStart = (textareaRef?.current?.selectionStart || 0) + 4;
      currentSelectionEnd = currentSelectionStart + 14;
      // adding updated string to state so that I can see the changes on screen.
      setNote(newNote);
         // You need setTimeout because React will perform a batch update and re-render the component after setNote is called, which may result in the textarea's DOM not yet being updated when you call textareaRef.current.focus() and textareaRef.current.setSelectionRange(). Using setTimeout with a value of 0 allows React to finish its updates before the code in the setTimeout function is executed. This ensures that the textarea's DOM has been updated and that you are able to properly set the focus and selection range.
      setTimeout(() => {
        textareaRef?.current?.focus();
        textareaRef?.current?.setSelectionRange(currentSelectionStart, currentSelectionEnd);
      }, 0);
    }
    // If user has selected some text then we don't need to auto select the newly added text. we will just add code string to the selected text.
    else{

 // Check if the selected text is already in code string . If it has ``` on both sides (e.g ```your code```), it is already code string and will be converted to normal text. If it has no ``` on both sides, it is normal text and will be converted to code string.
    // get the selected text
    let selectedContent=note.substring(selectionStart,selectionEnd)
    //expectedSubstring is used to compare text in if statement.
    const expectedSubstring = `\`\`\`${selectedContent}\`\`\``;
    // selectionStart will give us selected text's index. if we do -3 then we get text with ```. and we will use startingIndex+expectedSubstring.length to get the complete selected text with ```.
    const startingIndex = selectionStart-3;
    const extractedSubstring = note.substring(startingIndex, startingIndex+expectedSubstring.length);
    // if extractedSubstring === expectedSubstring is true it means the text is already bold and will be converted to normal text.
    if (extractedSubstring === expectedSubstring) {
      // suppose I have a string that looks like this data="My name ```console.log("hello")``` Max"
      //  before var will give us "My name" and after var will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
      const before = note.slice(0, startingIndex);
const after = note.slice(startingIndex+expectedSubstring.length);

newNote = before +selectedContent+ after;
      setNote(newNote);
    } 
    // if extractedSubstring === expectedSubstring is false means text is not in code string then we will make it code string by adding ```
    else {
      newNote = `${note.substring(0, selectionStart)}\`\`\`${selectedContent}\`\`\`${note.substring(selectionEnd)}`;
        setNote(newNote);
    }




    }
  }
    else if (e.currentTarget.name==="addCodeSnippetToEditCard"){
      const selectionStart = editTextareaRef?.current?.selectionStart || 0;
    const selectionEnd = editTextareaRef?.current?.selectionEnd || 0;
        // if user has not selected any text then selectionEnd-selectionStart will be 0. Then we will add \`\`\`Code goes here\`\`\`.
    // if selectionEnd-selectionStart is greater than 0 it means user has selected some text in that case we will convert the selected text to code string like this \`\`\`selectedText\`\`\`.
    if(selectionEnd-selectionStart===0){
    newNote = `${editContent.note.substring(0, selectionStart)} \`\`\`Code goes here\`\`\` ${editContent.note.substring(selectionEnd)}`;
      
    currentSelectionStart = (editTextareaRef?.current?.selectionStart || 0) + 4;
    currentSelectionEnd = currentSelectionStart + 14;
    setEditContent({ ...editContent, note: newNote });
    setTimeout(() => {
      // When I add code string in editTextArea it was scrolling to the top automatically.
      // To avoid that we will get the scrollPosition using editTextareaRef?.current?.scrollTop 
      // Then later we will use that so that when I add code string it stays where it was before.
      const scrollTop = editTextareaRef?.current?.scrollTop || 0;
      if (editTextareaRef?.current) {
        editTextareaRef.current.focus();
        editTextareaRef.current.setSelectionRange(currentSelectionStart, currentSelectionEnd);
        editTextareaRef.current.scrollTop = scrollTop;
      }
    }, 0);
  }

   // If user has selected some text then we don't need to auto select the newly added text. we will just add code string to the selected text.
  else{

  let selectedContent=editContent.note.substring(selectionStart,selectionEnd)
  //expectedSubstring is used to compare text in if statement.
  const expectedSubstring = `\`\`\`${selectedContent}\`\`\``;
  // selectionStart will give us selected text's index. if we do -3 then we get text with ```. and we will use startingIndex+expectedSubstring.length to get the complete selected text with ```.
  const startingIndex = selectionStart-3;
  const extractedSubstring = editContent.note.substring(startingIndex, startingIndex+expectedSubstring.length);
  // if extractedSubstring === expectedSubstring is true it means the text is already bold and will be converted to normal text.
  if (extractedSubstring === expectedSubstring) {
    // suppose I have a string that looks like this data="My name ```console.log("hello")``` Max"
    //  before var will give us "My name" and after var will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
    const before = editContent.note.slice(0, startingIndex);
const after = editContent.note.slice(startingIndex+expectedSubstring.length);

newNote = before +selectedContent+ after;
      setEditContent({ ...editContent, note: newNote });

  } 
  // if extractedSubstring === expectedSubstring is false means text is not in code string then we will make it code string by adding ```
  else {
    newNote = `${editContent.note.substring(0, selectionStart)}\`\`\`${selectedContent}\`\`\`${editContent.note.substring(selectionEnd)}`;
       setEditContent({ ...editContent, note: newNote });

  }


  
  }
    }
  
  };

const addBoldText = (e: React.MouseEvent<HTMLButtonElement>) => {
  let newNote: string;
  let currentSelectionStart: number;
  let currentSelectionEnd: number;
    // check which button is clicked using name property so that we can add our bold string (**Bold text**) to correct textarea
  if (e.currentTarget.name === "addBoldTextToAddCard") {
          // textareaRef?.current?.selectionStart will give us the cursor position. we will add our bold string to that cursor position.
      // it will assign 0 to selectionStart if textareaRef?.current?.selectionStart is undefined
    const selectionStart = textareaRef?.current?.selectionStart || 0;
    // textareaRef?.current?.selectionEnd we need this to get remaining string if we add the bold string (**Bold text**) in the middle of the note
      // like this `${note.substring(0, selectionStart)} **Bold text** ${note.substring(selectionEnd)}`;
const selectionEnd = textareaRef?.current?.selectionEnd || 0;
// if user has not selected any text then selectionEnd-selectionStart will be 0. Then we will add **Bold text**.
// if selectionEnd-selectionStart is greater than 0 it means user has selected some text then we will make the selected text bold.
if(selectionEnd-selectionStart===0){
newNote = `${note.substring(0, selectionStart)} **Bold text** ${note.substring(selectionEnd)}`;
 // Now we need currentSelectionStart and currentSelectionEnd variables to store the position of **Bold text**
      // so that once user clicks on B(i.e add Bold Text button) the text that it adds will be automatically selected. if we automatically select the newly added text then we don't have to remove "Bold Text" string manually I can start typing directly. 
      // added 3 and 9  so that i can select only "Bold Text" not the whole string with backticks \`\`\`**Bold text**\`\`\`
      // I have used these variables in setTimeout for auto selection.
    currentSelectionStart = (textareaRef?.current?.selectionStart || 0) + 3;
    currentSelectionEnd = currentSelectionStart + 9;
    setNote(newNote);
    setTimeout(() => {
      textareaRef?.current?.focus();
      textareaRef?.current?.setSelectionRange(currentSelectionStart, currentSelectionEnd);
    }, 0);
  }
   // If user has selected some text then we don't need to auto select the newly added text. we will just bold the selected text.
   // or if it is already bold then we will make it normal text.
  else{
    // Check if the selected text is already bold. If it has "**" on both sides (e.g. **text**), it is already bold and will be converted to normal text. If it has no "**" on both sides, it is normal text and will be converted to bold.
    // get the selected text
    let selectedContent=note.substring(selectionStart,selectionEnd)
    //expectedSubstring is used to compare text in if statement.
    const expectedSubstring = `**${selectedContent}**`;
    // selectionStart will give us selected text's index. if we do -2 then we get text with **. and we will use startingIndex+expectedSubstring.length to get the complete selected text with **.
    const startingIndex = selectionStart-2;
    const extractedSubstring = note.substring(startingIndex, startingIndex+expectedSubstring.length);
    // if extractedSubstring === expectedSubstring is true it means the text is already bold and will be converted to normal text.
    if (extractedSubstring === expectedSubstring) {
      // suppose I have a string that looks like this data="My name **is** Max"
      //  before var will give us "My name" and after var will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
      const before = note.slice(0, startingIndex);
const after = note.slice(startingIndex+expectedSubstring.length);

newNote = before + selectedContent + after;
      setNote(newNote);
    } 
    // if extractedSubstring === expectedSubstring is false means text is not bold then we will make it bold by adding **
    else {
      newNote = `${note.substring(0, selectionStart)}**${selectedContent}**${note.substring(selectionEnd)}`;
        setNote(newNote);
    }
    
    
  }
  } 
  else if (e.currentTarget.name === "addBoldTextToEditCard") {
    const selectionStart = editTextareaRef?.current?.selectionStart || 0;
    const selectionEnd = editTextareaRef?.current?.selectionEnd || 0;
    // If the user hasn't selected any text, selectionEnd - selectionStart will equal 0. In that case, **Bold text** will be added at the cursor's position. selectionStart will give us cursor position(it is like index).
    // if selectionEnd-selectionStart is greater than 0 it means user has selected some text then we will make the selected text bold.
 if(selectionEnd-selectionStart===0){
  newNote = `${editContent.note.substring(0, selectionStart)} **Bold text** ${editContent.note.substring(selectionEnd)}`;
  currentSelectionStart = (editTextareaRef?.current?.selectionStart || 0) + 3;
  currentSelectionEnd = currentSelectionStart + 9;
  setEditContent({ ...editContent, note: newNote });
  
  setTimeout(() => {
    // When I add Bold string in editTextArea it was scrolling to the top automatically.
   // To avoid that we will get the scrollPosition using editTextareaRef?.current?.scrollTop 
   // Then later we will use that so that when I add code string it stays where it was before.
   const scrollTop = editTextareaRef?.current?.scrollTop || 0;
   if(editTextareaRef?.current){
     editTextareaRef?.current?.focus();
     editTextareaRef?.current?.setSelectionRange(currentSelectionStart, currentSelectionEnd);
     editTextareaRef.current.scrollTop = scrollTop;

   }
   
 }, 0);
 }
  // If user has selected some text then we don't need to auto select the newly added text. we will just bold the selected text.
   // or if it is already bold then we will make it normal text.
 else{

// Check if the selected text is already bold. If it has "**" on both sides (e.g. **text**), it is already bold and will be converted to normal text. If it has no "**" on both sides, it is normal text and will be converted to bold.
    // get the selected text
    let selectedContent=editContent.note.substring(selectionStart,selectionEnd)
    //expectedSubstring is used to compare text in if statement.
    const expectedSubstring = `**${selectedContent}**`;
    // selectionStart will give us selected text's index. if we do -2 then we get text with **. and we will use startingIndex+expectedSubstring.length to get the complete selected text with **.
    const startingIndex = selectionStart-2;
    const extractedSubstring = editContent.note.substring(startingIndex, startingIndex+expectedSubstring.length);
    // if extractedSubstring === expectedSubstring is true it means the text is already bold and will be converted to normal text.
    if (extractedSubstring === expectedSubstring) {
      // suppose I have a string that looks like this data="My name **is** Max"
      //  before var will give us "My name" and after var will give us "Max".then we will add normal text in between(we can get the normal text using selectedContent variable).
      const before = editContent.note.slice(0, startingIndex);
const after = editContent.note.slice(startingIndex+expectedSubstring.length);

newNote = before + selectedContent + after;
setEditContent({ ...editContent, note: newNote });
    } 
    // if extractedSubstring === expectedSubstring is false means text is not bold then we will make it bold by adding **
    else {
      newNote = `${editContent.note.substring(0, selectionStart)}**${selectedContent}**${editContent.note.substring(selectionEnd)}`;
      setEditContent({ ...editContent, note: newNote });
    }

 }
    


  }
};

  

  const increaseTextAreaHeight = () => {
    setHeight((pre) => pre + 120);
  };
  const decreaseTextAreaHeight = () => {
    if (height < 80) {
      setHeight(80);
    } else {
      setHeight((pre) => pre - 120);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className=" absolute top-0 left-0  w-full h-full flex items-center justify-center text-gray-800 dark:text-gray-50 ">
        <p className="font-semibold">
          <span className="font-bold">Error </span>: {(error as Error)?.message}
        </p>
      </div>
    );
  }
  // if(isMutationError){
  //   return <p>Error{(mutationError as Error)?.message}</p>
  // }
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

      <Droppable droppableId="cardDeleteArea">
        {(provided, snapshot) => {
          return (
            <div
              className={`fixed lg:bottom-2 bg-gray-200 dark:bg-gray-700   lg:right-2 bottom-2 right-2   z-50 rounded-full w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center ${
                snapshot.isDraggingOver
                  ? "ring-1 ring-red-500 shadow-md shadow-red-500"
                  : "ring-1 dark:ring-sky-500/40 ring-teal-500/40"
              }`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <span
                className={`lg:text-3xl text-2xl cursor-pointer text-teal-600 dark:text-sky-400  ${
                  snapshot.isDraggingOver
                    ? "rotate-[30deg] text-red-500 dark:text-red-500"
                    : "transform-none"
                }  `}
              >
                <BsTrash
                  onClick={handlePopUp}
                  title="Drag and drop the card here to delete it."
                />
              </span>
            </div>
          );
        }}
      </Droppable>

      <div className="flex flex-col gap-2 w-full  relative overflow-auto h-screen ">
        <div className="w-full px-4 mt-6 mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col  gap-4 justify-center items-center"
          >
            {/* <label htmlFor="title" className=" font-bold text-teal-600 dark:text-sky-400">
            Card details
          </label> */}
            <div className="flex flex-col ">
              <div className=" flex item-center justify-end p-1 pr-4 border-t-2 border-r-2 border-l-2  border-teal-500 dark:border-sky-400 rounded-t-md gap-2 ">
                <button
                  title="Add code sample"
                  className="dark:text-gray-200 dark:hover:text-gray-400  text-gray-500 hover:text-gray-900 text-xl transition-all duration-300"
                  type="button"
                  name="addCodeSnippetToAddCard"
                  onClick={(e)=>addCodeBlock(e)}
                >
                  <BiCodeCurly />
                </button>
                <button
                name="addBoldTextToAddCard"
                  title="Bold text"
                  className="dark:text-gray-200 dark:hover:text-gray-400  text-gray-500 hover:text-gray-900 text-xl transition-all duration-300 "
                  type="button"
                  onClick={(e)=>addBoldText(e)}
                >
                  <AiOutlineBold />
                </button>
                <button
                  title="Contract Text Area"
                  className="text-red-500 hover:text-red-600 text-xl transition-all duration-300"
                  type="button"
                  onClick={decreaseTextAreaHeight}
                >
                  <FiMinusSquare />
                </button>
                <button
                  title="Expand Text Area"
                  className="text-emerald-500 hover:text-emerald-600  text-xl transition-all duration-300"
                  type="button"
                  onClick={increaseTextAreaHeight}
                >
                  <FiPlusSquare />
                </button>
              </div>
              <input
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setTitle(e.target.value);
                }}
                value={title}
                className=" lg:w-[40vw] md:w-[70vw] bg-white w-[95vw] border-t-2 border-r-2 border-l-2  border-teal-500 dark:border-sky-400  font-semibold outline-none text-md text-gray-800 px-3 py-2 dark:bg-slate-900 dark:text-gray-50 pb-2"
                placeholder="Title"
              />
              <textarea
                className={` lg:w-[40vw]  md:w-[70vw] bg-white w-[95vw] border-b-2 border-r-2 border-l-2  border-teal-500 dark:border-sky-400 rounded-b-md  outline-none  text-gray-800 px-3 text-md py-2 dark:bg-slate-900 dark:text-gray-50 resize-none transition-[height] duration-500 overflow-hidden`}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setNote(e.target.value);
                }}
                ref={textareaRef}
                style={{ height: height + "px" }}
                value={note}
                placeholder="Note"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-teal-600 hover:bg-teal-700 text-gray-50 font-semibold text-center py-1 px-2 rounded-md dark:bg-sky-500 dark:hover:bg-sky-600 outline-none transition-all duration-300 "
                aria-label="Create Card"
                type="submit"
              >
                Create Card
              </button>
            </div>
          </form>
          <h1 className="font-bold text-xl text-gray-800 mb-6 dark:text-gray-50 mt-6">
            {data?.title}{" "}
          </h1>
        </div>
        {/* You can't use Draggable directly you have to use it inside Dropable component  */}
        <Droppable droppableId="cardDropableArea">
          {(provided, snapshot) => {
            return (
              <div
                className="flex flex-row flex-wrap gap-4 justify-center items-center  mx-2 lg:mx-52 mb-48  "
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {data?.cards?.map((card, index) => {
                  return (
                    <Draggable
                      draggableId={`${deck_id!}-${index}`}
                      index={index}
                      key={index}
                    >
                      {(provided, snapshot) => {
                        if (snapshot.isDragging) {
                          changeColorWhileDragging.current?.classList.add(
                            "!lg:w-[90vw]"
                          );
                        }
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            key={index}
                          >
                            <div
                              ref={changeColorWhileDragging}
                              onClick={() =>
                                handleShowFullScreen({
                                  ...card,
                                  _id: deck_id!,
                                  cardIndex: index,
                                })
                              }
                              className={`relative border   ${
                                snapshot.isDragging
                                  ? "shadow-2xl  shadow-violet-600 border-violet-600  animate-pulse dark:bg-slate-900 bg-white"
                                  : "border-gray-400 "
                              } ${
                                snapshot.draggingOver === "cardDeleteArea"
                                  ? "shadow-2xl !shadow-red-500 !border-red-500 !bg-transparent"
                                  : null
                              }   flex flex-col text-gray-800
                rounded-md px-2 py-4  h-[9rem] lg:h-44  text-justify lg:w-[50vw] w-[95vw] `}
                            >
                              <div className="absolute bottom-0 right-0">
                                {/* If I don't use event.stopPropagation() then when I click on delete button or edit button it will first use the onClick that is added on parent i.e div onClick={()=>handleShowFullScreen({...card,_id:deck_id!})} then it will use the onClick that is defined on buttons. which is a problem in this case to avoid that I have used event.stopPropagation() */}
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation(),
                                      handleDelete(index);
                                  }}
                                  type="button"
                                  className="text-red-500 text-lg outline-none  rounded-tr  px-1  text-center hover:scale-95"
                                  aria-label="Delete Card"
                                >
                                  <MdOutlineDeleteOutline />
                                </button>

                                <button
                                  onClick={(event) => {
                                    event.stopPropagation(),
                                      handleEdit({
                                        ...card,
                                        _id: deck_id!,
                                        cardIndex: index,
                                      });
                                  }}
                                  type="button"
                                  className="text-blue-500 text-lg outline-none  rounded-tr px-1  text-center hover:scale-95 dark:text-sky-400 "
                                  aria-label="Edit Card"
                                >
                                  <BiEdit />
                                </button>
                              </div>
                              <p className="font-bold text-md lg:text-lg text-gray-800 dark:text-gray-50 mb-1 p-1 line-clamp-1 break-words break-all -ml-1">
                                {card.title}
                              </p>
                              {/* line-clamp-3 helps to truncate characters after 3 lines */}
                              <p className="text-sm lg:text-base text-gray-800 dark:text-gray-100 px-1 line-clamp-3 break-words break-all -ml-1 ">
                                {card.note}
                              </p>
                            </div>
                          </div>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </div>

      {openModal ? (
        <div className="w-screen  z-[60]  backdrop-blur-lg lg:backdrop-blur-lg fixed inset-0  ">
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-teal-500 dark:bg-slate-700 flex flex-col items-center justify-center rounded-md shadow mx-1 w-[98%] lg:w-1/2 dark:shadow-sm dark:shadow-slate-500">
            {/* modal head  */}
            
            <div className="w-full border-b border-gray-50 dark:border-gray-50/50 ">
              
              <div className=" flex item-center justify-between p-1 pr-4 gap-2 ">
                <div>
              <h2 className="py-2 px-4 text-left text-white font-bold ">
                Edit Card
              </h2>
              </div>
              <div className="flex items-center justify-center gap-4  px-2 py-1 rounded-md ">
                <button
                  title="Add code sample"
                  className="text-gray-200  text-xl  hover:text-gray-300 transition-all duration-300"
                  type="button"
                  name="addCodeSnippetToEditCard"
                  onClick={(e)=>addCodeBlock(e)}
                >
                  <BiCodeCurly />
                </button>
                <button
                name="addBoldTextToEditCard"
                  title="Bold text"
                  className="text-gray-200  text-xl  hover:text-gray-300 transition-all duration-300 "
                  type="button"
                  onClick={(e)=>addBoldText(e)}
                >
                  <AiOutlineBold />
                </button>
                
                </div>
              </div>
            </div>
            {/* modal content  */}
            <div className=" px-2 lg:px-4 py-4 w-full border-b border-gray-50 dark:border-gray-50/50">
              <input
                value={editContent.title}
                onChange={handleChange}
                name="title"
                className="px-2 py-2 w-full outline-none rounded-t-md font-semibold text-gray-800 dark:bg-slate-800 dark:text-gray-50 "
                placeholder="Title"
              />
              <textarea
                value={editContent.note}
                onChange={handleChange}
                name="note"
                className="px-2 py-2 w-full outline-none text-gray-800 rounded-b-md  dark:bg-slate-800 dark:text-gray-50 h-[60vh] "
                placeholder="Note"
                ref={editTextareaRef}
              ></textarea>
            </div>

            {/* modal footer  */}
            <div className="flex items-center justify-end  space-x-2 mt-4 mb-4 mr-8 w-full ">
              <button
                onClick={handleSave}
                className="px-2 py-1 bg-blue-700 hover:bg-blue-800  rounded outline-none text-white mx-4 transition-all duration-300"
                aria-label="Save"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setOpenModal(false);
                }}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 outline-none rounded text-white transition-all duration-300"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDeleteModalForCard
        deck_id={deck_id!}
        indexOfCardForDeletion={indexOfCardForDeletion!}
        deleteCardItem={deleteCardItem}
      />

      {showFullScreen && (
        <div className="fixed inset-0 overflow-y-auto bg-white  dark:bg-slate-900  p-4 lg:px-96 flex  flex-col z-50 items-center   ">
          <div className="mt-2 lg:mt-4 relative">
            <div className="mt-12">
              {/* here I have used tailwind's -ml-1 class to reduce the gap between the words that causes when you try to add very long words. */}
              {/* whitespace-pre-line to keep the new lines and spaces as it is */}
              <p className="text-justify mb-5 mt-5 text-lg font-bold break-words break-normal -ml-1 whitespace-pre-line text-gray-800 dark:text-slate-100">
                {fullScreenCardData?.title}
              </p>
              <div className="text-justify  mb-10 break-words break-normal -ml-1 whitespace-pre-wrap text-gray-800 dark:text-slate-200">
                {parseNote(fullScreenCardData?.note)}
              </div>
            </div>
            <div className="fixed top-0 py-4 dark:bg-slate-900 border-b dark:border-gray-300/10 border-gray-800/10 bg-white px-4 left-0 w-full flex items-center justify-between lg:px-96">
              <div>
                <button
                  onClick={() => setShowFullScreen(false)}
                  className=" text-xl rounded px-1 text-center text-gray-50 cursor-pointer bg-red-500"
                  aria-label="Back"
                >
                  <IoIosArrowRoundBack />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 ">
                <div className="">
                  <ThemeToggler />
                </div>

                <button
                  onClick={() => {
                    handleDelete(fullScreenCardData?.cardIndex!);
                  }}
                  type="button"
                  className="text-red-500 text-xl outline-none  rounded-tr  px-1  text-center hover:scale-95"
                  aria-label="Delete Card"
                >
                  <MdOutlineDeleteOutline />
                </button>

                <button
                  onClick={() => {
                    handleEdit(fullScreenCardData);
                  }}
                  type="button"
                  className="text-blue-500 text-xl outline-none  rounded-tr px-1  text-center hover:scale-95 dark:text-sky-400"
                  aria-label="Edit Card"
                >
                  <BiEdit />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cards;

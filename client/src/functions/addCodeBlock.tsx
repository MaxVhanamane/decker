import { Dispatch, MouseEvent, RefObject, SetStateAction } from "react";
import { ContentTypeForEdit } from "../types/types";

type TextStylingFunctionParams = {
  e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>;
  note: string;
  setNote: Dispatch<SetStateAction<string>>;
  editContent: ContentTypeForEdit;
  setEditContent: Dispatch<SetStateAction<ContentTypeForEdit>>;
  textareaRef: RefObject<HTMLTextAreaElement>;
  editTextareaRef: RefObject<HTMLTextAreaElement>;
};

export const addCodeBlock = ({
  e,
  note,
  setNote,
  editContent,
  setEditContent,
  textareaRef,
  editTextareaRef,
}: TextStylingFunctionParams) => {
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
      currentSelectionStart = (textareaRef?.current?.selectionStart || 0) + 4;
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
};

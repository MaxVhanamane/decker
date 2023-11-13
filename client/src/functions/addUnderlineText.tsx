import { Dispatch, MouseEvent, RefObject, SetStateAction } from "react";
import { ContentTypeForEdit } from "../types/types";

type TextStylingFunctionParams = {
  e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>;
  textareaRef: RefObject<HTMLTextAreaElement>;
  editTextareaRef: RefObject<HTMLTextAreaElement>;
  note: string;
  setNote: Dispatch<SetStateAction<string>>;
  editContent: ContentTypeForEdit;
  setEditContent: Dispatch<SetStateAction<ContentTypeForEdit>>;
};

export const addUnderlineText = ({
  e,
  textareaRef,
  editTextareaRef,
  note,
  setNote,
  editContent,
  setEditContent,
}: TextStylingFunctionParams) => {
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
      currentSelectionStart = (textareaRef?.current?.selectionStart || 0) + 2;
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
};

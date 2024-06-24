import { Dispatch, MouseEvent, RefObject, SetStateAction } from "react";
import { ContentTypeForEdit } from "../types/types";

type TextStylingFunctionParams = {
  e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>;
  textareaRef: RefObject<HTMLTextAreaElement>;
  note: string;
  setNote: Dispatch<SetStateAction<string>>;
  editTextareaRef: RefObject<HTMLTextAreaElement>;
  editContent: ContentTypeForEdit;
  setEditContent: Dispatch<SetStateAction<ContentTypeForEdit>>;
};

export const addLink = ({
  e,
  textareaRef,
  note,
  setNote,
  editTextareaRef,
  editContent,
  setEditContent,
}: TextStylingFunctionParams) => {
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

      currentSelectionStart = (textareaRef?.current?.selectionStart || 0) + 13;
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
          ${editContent.note.substring(selectionEnd)}`;
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
};

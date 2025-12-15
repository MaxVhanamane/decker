import { Dispatch, memo } from "react";

import ContentRenderer from "../rich-text-renderer/RichTextRenderer";
import { Descendant } from "slate";

import DummyContentRenderer from "./DummyContentRenderer";
type PropType = {
  showTypewriterEffect: boolean;
  isLayoutAnimationComplete: boolean;
  note: Descendant[];
  skipTyping: boolean;
  setSkipTyping: Dispatch<React.SetStateAction<boolean>>;
};

const NoteSection = ({
  note,
  showTypewriterEffect,
  skipTyping,
  setSkipTyping,
  isLayoutAnimationComplete,
}: PropType) => {
  return (
    <div
      className={`text-left text-base pb-20 lg:pb-16 break-words font-light whitespace-pre-wrap text-gray-800 dark:text-gray-200 `}
    >
      {isLayoutAnimationComplete ? (
        <ContentRenderer
          content={note}
          enableTyping={showTypewriterEffect}
          skipTyping={skipTyping}
          setSkipTyping={setSkipTyping}
        />
      ) : (
        <DummyContentRenderer />
      )}
    </div>
  );
};

export default memo(NoteSection);

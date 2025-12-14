import { Dispatch, memo } from "react";

import ContentRenderer from "../rich-text-renderer/RichTextRenderer";
import { Descendant } from "slate";

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
      <ContentRenderer
        content={!isLayoutAnimationComplete ? note.slice(0, 15) : note}
        enableTyping={showTypewriterEffect}
        skipTyping={skipTyping}
        setSkipTyping={setSkipTyping}
      />
    </div>
  );
};

export default memo(NoteSection);

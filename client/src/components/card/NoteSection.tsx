import { memo } from "react";

import ContentRenderer from "../RichTextRenderer";
import { Descendant } from "slate";

type PropType = {
  showTypewriterEffect: boolean;
  note: Descendant[];
};

const NoteSection = ({ note, showTypewriterEffect }: PropType) => {
  return (
    <div
      className={`text-left text-base pb-20 lg:pb-16 break-words break-normal leading-7 whitespace-pre-wrap text-gray-800 dark:text-gray-200  ${
        note.length > 0 && "animate-opacityFadeIn lg:animate-quickOpacity"
      } `}
    >
      <ContentRenderer content={note} enableTyping={showTypewriterEffect} />
    </div>
  );
};

export default memo(NoteSection);

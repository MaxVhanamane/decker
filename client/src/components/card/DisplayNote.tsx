import { ReactNode, memo } from "react";
import { GiFeather } from "react-icons/gi";

type PropType = {
  parsedNote: ReactNode[];
  showTypewriterEffect: boolean;
  search_index: string | null | undefined;
  dispalyResponse: ReactNode[];
  typingInProgress: boolean;
};

const DisplayNote = ({
  parsedNote,
  showTypewriterEffect,
  search_index,
  dispalyResponse,
  typingInProgress,
}: PropType) => {
  return (
    <div
      className={`text-left text-base mb-20 lg:mb-16 break-words break-normal leading-7 whitespace-pre-wrap text-gray-800 dark:text-gray-200 ${
        parsedNote.length > 0 && "animate-opacityFadeIn lg:animate-quickOpacity"
      } `}
    >
      {showTypewriterEffect && !search_index ? dispalyResponse : parsedNote}

      {dispalyResponse.length > 0 && (
        <GiFeather
          className={`inline-block text-3xl ml-2 -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 ${
            !showTypewriterEffect && "hidden"
          } ${
            !typingInProgress &&
            "opacity-0 animate-[opacityFadeOut_0.3s_linear_1]"
          }`}
        />
      )}
    </div>
  );
};

export default memo(DisplayNote);

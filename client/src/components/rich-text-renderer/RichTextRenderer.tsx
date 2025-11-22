import { Descendant } from "slate";
import { Dispatch } from "react";
import { useTypingEffect } from "../../hooks/utility/useTypingEffect";
import { renderContent } from "./renderContent";

// Get total character count
export const getTotalChars = (content: Descendant[]): number => {
  return content.reduce((total, node) => {
    if ("text" in node) {
      return total + (node.text || "").length;
    } else if ("children" in node) {
      return total + getTotalChars(node.children);
    }
    return total;
  }, 0);
};

export const ContentRenderer = ({
  content,
  enableTyping,
  skipTyping,
  setSkipTyping,
  typingSpeed = 10,
}: {
  content: Descendant[];
  skipTyping?: boolean;
  enableTyping?: boolean;
  setSkipTyping: Dispatch<React.SetStateAction<boolean>>;
  typingSpeed?: number;
}) => {
  const totalChars = getTotalChars(content);
  const { visibleChars } = useTypingEffect(
    totalChars,
    typingSpeed,
    enableTyping,
    skipTyping,
    setSkipTyping
  );

  return (
    <div className="content-container [&>*]:py-[3px] py-4 [&>*:nth-child(2)]:mt-1">
      {renderContent(
        content,
        totalChars,
        enableTyping ? visibleChars : undefined
      )}
    </div>
  );
};

export default ContentRenderer;

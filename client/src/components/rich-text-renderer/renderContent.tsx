import { ReactNode } from "react";
import { Descendant } from "slate";
import { CustomElementType } from "../../types/textEditorTypes";
import { getTotalChars } from "./RichTextRenderer";
import { renderElement } from "./renderElement";

export const renderContent = (
  content: Descendant[],
  totalChars: number,
  visibleChars?: number
): ReactNode => {
  let charCount = 0;
  const lastVisibleElementIndex =
    visibleChars !== undefined
      ? calculateLastVisibleElement(content, visibleChars)
      : -1;

  return content
    .filter((node): node is CustomElementType => "type" in node)
    .map((element, index) => {
      if (visibleChars !== undefined) {
        const elementChars = getTotalChars(element.children);

        if (charCount >= visibleChars) {
          return <div key={index}></div>;
        }

        const remainingChars = visibleChars - charCount;
        const showCursor =
          index === lastVisibleElementIndex &&
          visibleChars < (totalChars ?? Infinity);

        charCount += elementChars;
        return renderElement(element, index, remainingChars, showCursor);
      }

      return renderElement(element, index);
    });
};

const calculateLastVisibleElement = (
  content: Descendant[],
  visibleChars: number
): number => {
  let charCount = 0;

  for (let i = 0; i < content.length; i++) {
    const element = content[i] as CustomElementType;
    const elementChars = getTotalChars(element.children);

    if (charCount + elementChars >= visibleChars) {
      return i;
    }

    charCount += elementChars;
  }

  return content.length - 1;
};

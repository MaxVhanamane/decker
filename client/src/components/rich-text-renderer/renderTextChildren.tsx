import { Descendant } from "slate";
import { renderLeaf } from "./renderLeaf";
import { CustomElementType } from "../../types/textEditorTypes";
import { renderInlineElement } from "./renderInlineElement";

export const renderTextChildren = (
  children: Descendant[],
  visibleChars?: number
) => {
  let charCount = 0;

  return children.map((child, idx) => {
    if ("text" in child) {
      const text = child.text || "\u00A0";

      if (visibleChars !== undefined) {
        if (charCount >= visibleChars) {
          return <span key={idx}></span>;
        }

        const remainingChars = visibleChars - charCount;
        const visibleText = text.substring(0, remainingChars);
        charCount += text.length;

        return (
          <span key={idx}>{renderLeaf({ ...child, text: visibleText })}</span>
        );
      }

      charCount += text.length;
      return <span key={idx}>{renderLeaf({ ...child, text })}</span>;
    } else if ("url" in child) {
      return renderInlineElement(
        child as CustomElementType,
        idx,
        visibleChars ? visibleChars - charCount : undefined
      );
    } else return null;
  });
};

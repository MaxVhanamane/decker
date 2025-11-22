import { CustomElementType } from "../../types/textEditorTypes";
import LinkElementView from "../editor/elements/readonly/LinkElementView";
import { renderTextChildren } from "./renderTextChildren";

export const renderInlineElement = (
  element: CustomElementType,
  idx: number,
  visibleChars?: number
) => {
  const children = renderTextChildren(element.children, visibleChars);

  switch (element.type) {
    case "link":
      return (
        <LinkElementView key={idx} url={element.url}>
          {children}
        </LinkElementView>
      );
    default:
      return null;
  }
};

import { ReactNode } from "react";
import {
  CodeBlockElementType,
  CodeLineElement,
  ColorBarElement,
  CustomElementType,
  DividerElement,
} from "../../types/textEditorTypes";
import { renderTextChildren } from "./renderTextChildren";
import TitleElementView from "../editor/elements/readonly/TitleElementView";
import { GiFeather } from "react-icons/gi";
import ParagraphElementView from "../editor/elements/readonly/ParagraphElementView";
import ListView from "../editor/elements/readonly/ListView";
import HeadingOneElementView from "../editor/elements/readonly/HeadingOneElementView";
import HeadingTwoElementView from "../editor/elements/readonly/HeadingTwoElementView";
import QuoteElementView from "../editor/elements/readonly/QuoteElementView";
import { CodeBlockElementView } from "../editor/elements/readonly/CodeBlockElementView";
import ColorBarView from "../editor/elements/readonly/ColorBarView";
import DividerView from "../editor/elements/readonly/DividerView";

export const renderElement = (
  element: CustomElementType,
  key: number,
  visibleChars?: number,
  showCursor: boolean = false
): ReactNode => {
  const children = renderTextChildren(element.children, visibleChars);
  switch (element.type) {
    case "title":
      return (
        <TitleElementView
          key={key}
          isTitleEmpty={element.children[0]?.text?.length === 0}
        >
          {children}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </TitleElementView>
      );
    case "paragraph":
      return (
        <ParagraphElementView key={key} element={element}>
          {children}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </ParagraphElementView>
      );

    case "h1":
      return (
        <HeadingOneElementView key={key} element={element}>
          {children}{" "}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </HeadingOneElementView>
      );
    case "h2":
      return (
        <HeadingTwoElementView key={key} element={element}>
          {children}{" "}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </HeadingTwoElementView>
      );
    case "blockquote":
      return (
        <QuoteElementView key={key} element={element}>
          {children}{" "}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </QuoteElementView>
      );

    case "color-bar": {
      const colorElement = element as ColorBarElement;
      return (
        <ColorBarView element={element} key={key} color={colorElement.color}>
          {children}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </ColorBarView>
      );
    }

    case "bulleted-list":
    case "circle-list":
    case "square-list":
    case "hollow-square-list":
    case "dash-list":
    case "star-list":
    case "arrow-list":
    case "numbered-list":
    case "alpha-upper-list":
    case "alpha-lower-list":
    case "roman-upper-list":
    case "roman-lower-list":
      return (
        <ListView
          key={key}
          type={element.type}
          children={element.children || []}
          visibleChars={visibleChars}
          showCursor={showCursor}
          indentLevel={element?.indentLevel}
        />
      );

    case "divider": {
      const dividerElement = element as DividerElement;
      return (
        <DividerView key={key} dividerStyle={dividerElement.dividerStyle}>
          {children}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </DividerView>
      );
    }
    case "code-block": {
      const codeBlockElement = element as CodeBlockElementType;
      return (
        <CodeBlockElementView
          key={key}
          language={codeBlockElement.language}
          code={codeBlockElement.children as CodeLineElement[]}
          visibleChars={visibleChars}
          showCursor={showCursor}
        />
      );
    }
    // default:
    //   return (
    //     <ParagraphElementView key={key} element={element}>
    //       {children}{" "}
    //       {showCursor && (
    //         <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
    //       )}
    //     </ParagraphElementView>
    //   );
  }
};

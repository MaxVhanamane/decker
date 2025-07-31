import { Descendant } from "slate";
import { useState, useEffect, JSX } from "react";
import ColorBarView from "./editor/elements/readonly/ColorBarView";
import DividerView from "./editor/elements/readonly/DividerView";
import { HighlightView } from "./editor/leaf/readonly/HighlightView";
import { GiFeather } from "react-icons/gi";

import type {
  CustomTextType,
  CustomElementType,
  ColorBarElement,
  DividerElement,
  CodeBlockElementType,
} from "../types/textEditorTypes";
import ParagraphElementView from "./editor/elements/readonly/ParagraphElementView";
import ListView from "./editor/elements/readonly/ListView";
import HeadingOneElementView from "./editor/elements/readonly/HeadingOneElementView";
import HeadingTwoElementView from "./editor/elements/readonly/HeadingTwoElementView";
import QuoteElementView from "./editor/elements/readonly/QuoteElementView";
import TitleElementView from "./editor/elements/readonly/TitleElementView";
import LinkElementView from "./editor/elements/readonly/LinkElementView";
import { CodeBlockElementView } from "./editor/elements/readonly/CodeBlockElementView";

// Your original leaf rendering - unchanged
export const renderLeaf = (leaf: CustomTextType): JSX.Element => {
  let content: JSX.Element = <>{leaf.text}</>;
  if (leaf.bold) {
    content = (
      <strong className="font-bold dark:text-gray-50 text-gray-900">
        {content}
      </strong>
    );
  }

  if (leaf.italic) {
    content = <em>{content}</em>;
  }

  if (leaf.underline) {
    content = (
      <u className="underline dark:decoration-slate-50 decoration-gray-600">
        {content}
      </u>
    );
  }

  if (leaf.highlightConfig) {
    content = (
      <HighlightView
        styledText={content}
        highlightConfig={leaf.highlightConfig}
      />
    );
  }

  return content;
};

// Modified to support typing effect
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

const renderInlineElement = (
  element: CustomElementType,
  idx: number,
  visibleChars?: number
): JSX.Element | null => {
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

const renderElement = (
  element: CustomElementType,
  key: number,
  visibleChars?: number,
  showCursor: boolean = false
): JSX.Element => {
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
        <ParagraphElementView key={key}>
          {children}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </ParagraphElementView>
      );

    case "h1":
      return (
        <HeadingOneElementView key={key}>
          {children}{" "}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </HeadingOneElementView>
      );
    case "h2":
      return (
        <HeadingTwoElementView key={key}>
          {children}{" "}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </HeadingTwoElementView>
      );
    case "blockquote":
      return (
        <QuoteElementView key={key}>
          {children}{" "}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </QuoteElementView>
      );

    case "color-bar": {
      const colorElement = element as ColorBarElement;
      return (
        <ColorBarView key={key} color={colorElement.color}>
          {children}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </ColorBarView>
      );
    }

    case "bulleted-list":
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
          code={codeBlockElement.children as CodeBlockElementType[]}
          visibleChars={visibleChars}
          showCursor={showCursor}
        />
      );
    }
    default:
      return (
        <ParagraphElementView key={key}>
          {children}{" "}
          {showCursor && (
            <GiFeather className="inline-block ml-2 text-2xl -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 cursor-icon" />
          )}
        </ParagraphElementView>
      );
  }
};
// Get total character count
const getTotalChars = (content: Descendant[]): number => {
  return content.reduce((total, node) => {
    if ("text" in node) {
      return total + (node.text || "").length;
    } else if ("children" in node) {
      return total + getTotalChars(node.children);
    }
    return total;
  }, 0);
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
export const renderContent = (
  content: Descendant[],
  totalChars: number,
  visibleChars?: number
): JSX.Element[] => {
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

//  typing effect hook
const useTypingEffect = (
  totalChars: number,
  speed: number = 10,
  enabled: boolean = false
) => {
  const [visibleChars, setVisibleChars] = useState(enabled ? 0 : totalChars);
  const [isComplete, setIsComplete] = useState(!enabled);

  //  Reset typing when enabled becomes true
  useEffect(() => {
    if (enabled) {
      setVisibleChars(0);
      setIsComplete(false);
    } else {
      setVisibleChars(totalChars);
      setIsComplete(true);
    }
  }, [enabled, totalChars]);

  useEffect(() => {
    if (!enabled || visibleChars >= totalChars) {
      setIsComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setVisibleChars((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [visibleChars, totalChars, speed, enabled]);

  return { visibleChars, isComplete };
};

// Enhanced ContentRenderer with simple typing effect
export const ContentRenderer = ({
  content,
  enableTyping,
  typingSpeed = 10,
}: {
  content: Descendant[];
  enableTyping?: boolean;
  typingSpeed?: number;
}) => {
  const totalChars = getTotalChars(content);
  const { visibleChars } = useTypingEffect(
    totalChars,
    typingSpeed,
    enableTyping
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

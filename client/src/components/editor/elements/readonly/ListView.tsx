import type {
  ListType,
  ListItemElement,
  IndentLevel,
} from "../../../../types/textEditorTypes";
import { GiFeather } from "react-icons/gi";
import { Element as SlateElement } from "slate";
import { twMerge } from "tailwind-merge";
import { renderTextChildren } from "../../../rich-text-renderer/renderTextChildren";
import { indentMargin } from "../../../../utils/constants";

const listMarkers: Record<ListType, (index: number) => string> = {
  // Unordered lists
  "bulleted-list": () => "•",
  "circle-list": () => "◦",
  "square-list": () => "▪",
  "hollow-square-list": () => "□",
  "dash-list": () => "–",
  "star-list": () => "✦",
  "arrow-list": () => "→",

  // Ordered lists
  "numbered-list": (index) => `${index + 1}.`,
  "alpha-upper-list": (index) => `${String.fromCharCode(65 + (index % 26))}.`,
  "alpha-lower-list": (index) => `${String.fromCharCode(97 + (index % 26))}.`,
  "roman-upper-list": (index) => `${toRoman(index + 1)}.`,
  "roman-lower-list": (index) => `${toRoman(index + 1).toLowerCase()}.`,
};

function toRoman(num: number): string {
  const romanNumerals = [
    ["M", 1000],
    ["CM", 900],
    ["D", 500],
    ["CD", 400],
    ["C", 100],
    ["XC", 90],
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ] as const;

  let result = "";
  for (const [roman, value] of romanNumerals) {
    while (num >= value) {
      result += roman;
      num -= value;
    }
  }
  return result;
}

type ListViewProps = {
  type: ListType;
  children: ListItemElement[];
  indentLevel?: IndentLevel;
  visibleChars?: number;
  showCursor?: boolean;
};

// Get total text chars in a list item (excluding nested lists)
const getListItemCharCount = (item: ListItemElement): number => {
  return item.children.reduce((total, child) => {
    // If it's a raw text node, count its length
    if (typeof child === "object" && "text" in child) {
      return total + (child.text || "").length;
    }

    // If it's a list-item-text element, count the text within it
    if (SlateElement.isElement(child) && child.type === "list-item-text") {
      return (
        total +
        child.children.reduce((innerTotal, innerChild) => {
          if (typeof innerChild === "object" && "text" in innerChild) {
            return innerTotal + (innerChild.text || "").length;
          }
          return innerTotal;
        }, 0)
      );
    }

    // Ignore nested lists (counted separately)
    if (
      SlateElement.isElement(child) &&
      (child.type as string).endsWith("list")
    ) {
      return total;
    }

    return total;
  }, 0);
};

const ListView = ({
  type,
  children,
  visibleChars,
  showCursor = false,
  indentLevel,
}: ListViewProps) => {
  let charCount = 0;

  return (
    <div
      style={{
        marginLeft: indentLevel ? indentMargin * indentLevel : 0,
      }}
      className="flex flex-col"
    >
      {children.map((child, index) => {
        if (child.type !== "list-item") return null;

        const textContent: any[] = [];
        const nestedLists: any[] = [];

        for (const itemChild of child.children) {
          if (!SlateElement.isElement(itemChild)) {
            // plain text node
            textContent.push(itemChild);
          } else if ((itemChild.type as string).endsWith("list")) {
            // nested list
            nestedLists.push(itemChild);
          } else if (itemChild.type === "list-item-text") {
            // your new Prezly text wrapper
            textContent.push(...itemChild.children);
          }
        }

        const itemCharCount = getListItemCharCount(child);

        // Stop if limit already reached
        if (visibleChars !== undefined && charCount >= visibleChars) {
          return null;
        }

        const remainingChars =
          visibleChars !== undefined ? visibleChars - charCount : undefined;

        // Render visible portion of this list item
        const content = renderTextChildren(textContent, remainingChars);

        // Feather cursor only if we cut off in this item
        const isLastVisible =
          showCursor &&
          visibleChars !== undefined &&
          charCount < visibleChars &&
          charCount + itemCharCount >= visibleChars;

        // Advance charCount *after* rendering current item
        charCount += itemCharCount;

        return (
          <div key={index}>
            <div className="flex gap-2 relative">
              <span
                className={twMerge(
                  "select-none shrink-0 text-base text-gray-600 dark:text-gray-200 inline-flex justify-end w-4",
                  (type === "hollow-square-list" || type === "star-list") &&
                    "text-[0.75rem]",
                  (type === "bulleted-list" ||
                    type === "circle-list" ||
                    type === "square-list") &&
                    "text-[1.4rem]"
                )}
                style={{ userSelect: "none" }}
              >
                {listMarkers[type](index)}
              </span>
              <div className="flex-1 min-w-0">
                {content}
                {isLastVisible && (
                  <GiFeather className="inline-block text-2xl ml-2 -translate-y-2 rotate-12 dark:text-gray-200 text-gray-700" />
                )}

                {/* Nested lists use remaining chars */}
                {nestedLists.map((nestedList, nestedIndex) => {
                  return (
                    <ListView
                      key={nestedIndex}
                      type={nestedList.type}
                      children={nestedList.children}
                      visibleChars={
                        visibleChars !== undefined
                          ? visibleChars - charCount
                          : undefined
                      }
                      showCursor={showCursor}
                      indentLevel={nestedList.indentLevel}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListView;

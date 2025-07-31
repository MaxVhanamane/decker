import type {
  ListType,
  ListItemElement,
} from "../../../../types/textEditorTypes";
import { renderTextChildren } from "../../../RichTextRenderer";
import { GiFeather } from "react-icons/gi";

const listTypeClassMap: Record<
  ListType,
  { tag: "ul" | "ol"; className: string }
> = {
  "bulleted-list": { tag: "ul", className: "list-disc ml-6" },
  "numbered-list": { tag: "ol", className: "list-decimal ml-6" },
  "alpha-upper-list": { tag: "ol", className: "list-[upper-alpha] ml-6" },
  "alpha-lower-list": { tag: "ol", className: "list-[lower-alpha] ml-6" },
  "roman-upper-list": { tag: "ol", className: "list-[upper-roman] ml-6" },
  "roman-lower-list": { tag: "ol", className: "list-[lower-roman] ml-6" },
};

type ListViewProps = {
  type: ListType;
  children: ListItemElement[];
  visibleChars?: number;
  showCursor?: boolean; // Add this prop
};

// Helper function to get total character count for a list item
const getListItemCharCount = (item: ListItemElement): number => {
  return item.children.reduce((total, child) => {
    if (typeof child === "object" && "text" in child) {
      return total + (child.text || "").length;
    }
    return total;
  }, 0);
};

// Helper function to get visible list items based on character count
const getVisibleListItems = (
  children: ListItemElement[],
  visibleChars: number
): { items: ListItemElement[]; lastVisibleIndex: number } => {
  const result: ListItemElement[] = [];
  let charCount = 0;
  let lastVisibleIndex = -1;

  for (let i = 0; i < children.length; i++) {
    const item = children[i];
    const itemChildren = item.children || [];
    const newItemChildren: any[] = [];
    const itemCharCount = getListItemCharCount(item);

    // Check if this item should be visible at all
    if (charCount >= visibleChars) {
      break;
    }

    // Check if this is the last visible item (partially or fully)
    if (charCount + itemCharCount >= visibleChars) {
      lastVisibleIndex = i;
    }

    for (const child of itemChildren) {
      if (typeof child === "object" && "text" in child) {
        const childText = child.text;
        const remainingChars = visibleChars - charCount;

        if (remainingChars <= 0) {
          break;
        }

        if (childText.length <= remainingChars) {
          newItemChildren.push(child);
          charCount += childText.length;
        } else {
          // Partial text node
          newItemChildren.push({
            ...child,
            text: childText.substring(0, remainingChars),
          });
          charCount += remainingChars;
          break;
        }
      } else {
        // Handle non-text children (like links)
        newItemChildren.push(child);
      }
    }

    if (newItemChildren.length > 0) {
      result.push({
        ...item,
        children: newItemChildren,
      });
    }

    if (charCount >= visibleChars) {
      break;
    }
  }

  return { items: result, lastVisibleIndex };
};

const ListView = ({
  type,
  children,
  visibleChars,
  showCursor = false,
}: ListViewProps) => {
  const { tag: ListTag, className } = listTypeClassMap[type];

  // Extract actual list items from potentially nested structure
  const actualListItems = extractListItems(children);

  // If visibleChars is provided, filter the list items to show only visible portion
  const { items: visibleItems, lastVisibleIndex } =
    visibleChars !== undefined
      ? getVisibleListItems(actualListItems, visibleChars)
      : { items: actualListItems, lastVisibleIndex: -1 };

  return (
    <ListTag className={className}>
      {visibleItems.map((child, index) => {
        const content = renderTextChildren(child.children, visibleChars);
        const isLastVisible = showCursor && index === lastVisibleIndex;

        return (
          <li key={index}>
            {content}
            {isLastVisible && (
              <GiFeather className="inline-block text-2xl ml-2 -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 " />
            )}
          </li>
        );
      })}
    </ListTag>
  );
};

// Helper function to extract actual list items from nested structure
const extractListItems = (children: any[]): ListItemElement[] => {
  const listItems: ListItemElement[] = [];

  for (const child of children) {
    if (child.type === "list-item") {
      listItems.push(child);
    } else if (child.type && child.type.includes("list") && child.children) {
      // If it's a nested list, recursively extract list items
      listItems.push(...extractListItems(child.children));
    }
  }

  return listItems;
};

export default ListView;

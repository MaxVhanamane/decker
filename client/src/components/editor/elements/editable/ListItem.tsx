import { RenderElementProps, ReactEditor, useSlate } from "slate-react";
import { Editor, Element as SlateElement } from "slate";
import type { ListType } from "../../../../types/textEditorTypes";
import { twMerge } from "tailwind-merge";

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

const ListItem = ({ attributes, children, element }: RenderElementProps) => {
  const editor = useSlate();

  // Find parent list to get list type and index
  let listType: ListType = "bulleted-list";
  let itemIndex = 0;

  try {
    const path = ReactEditor.findPath(editor, element);
    const parentPath = path.slice(0, -1);
    const [parentList] = Editor.node(editor, parentPath);

    if (
      SlateElement.isElement(parentList) &&
      (parentList.type as string).endsWith("list")
    ) {
      listType = parentList.type as ListType;
      itemIndex = path[path.length - 1];
    }
  } catch (e) {
    // Fallback to default
  }

  const marker = listMarkers[listType](itemIndex);

  return (
    <div {...attributes} className="flex gap-2 relative">
      <span
        contentEditable={false}
        className={twMerge(
          "select-none shrink-0 text-base text-gray-600 dark:text-gray-200  inline-flex justify-end w-4",
          (listType === "hollow-square-list" || listType === "star-list") &&
            "text-[0.75rem]",
          (listType === "bulleted-list" ||
            listType === "circle-list" ||
            listType === "square-list") &&
            "text-[1.4rem]"
        )}
        style={{ userSelect: "none" }}
      >
        {marker}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default ListItem;

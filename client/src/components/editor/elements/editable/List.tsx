import { RenderElementProps } from "slate-react";
import type { ListType } from "../../../../types/textEditorTypes";

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

const List = ({ attributes, children, element }: RenderElementProps) => {
  const { type } = element as { type: ListType };
  const { tag, className } = listTypeClassMap[type];

  const ListTag = tag;

  return (
    <ListTag {...attributes} className={className}>
      {children}
    </ListTag>
  );
};

export default List;

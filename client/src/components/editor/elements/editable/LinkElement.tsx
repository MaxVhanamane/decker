import { Dispatch, memo, SetStateAction } from "react";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import type { LinkElementType } from "../../../../types/textEditorTypes";
import { Editor, Range, Text } from "slate";
import { NonBreakingSpace } from "../../NonBreakingSpace";

const LinkElement = ({
  attributes,
  children,
  element,
  setSelectedLinkDetails,
}: RenderElementProps & {
  setSelectedLinkDetails?: Dispatch<
    SetStateAction<{ title: string; url: string; linkPosition: Range } | null>
  >;
}) => {
  const { url, children: child } = element as LinkElementType;
  const editor = useSlateStatic();

  const handleClick = () => {
    const path = ReactEditor.findPath(editor, element);
    const range = Editor.range(editor, path);
    if (setSelectedLinkDetails) {
      setSelectedLinkDetails((prev) => {
        if (prev) {
          return null;
        } else {
          if (
            Array.isArray(child) &&
            child.length > 0 &&
            Text.isText(child[0])
          ) {
            return { url, title: child[0].text, linkPosition: range };
          } else {
            return null;
          }
        }
      });
    }
  };

  return (
    <>
      <NonBreakingSpace />
      <a
        {...attributes}
        className="relative text-blue-600 underline cursor-pointer"
        onClick={handleClick}
      >
        {children}
      </a>
      <NonBreakingSpace />
    </>
  );
};

export default memo(LinkElement);

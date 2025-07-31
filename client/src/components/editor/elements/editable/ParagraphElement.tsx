import { RenderElementProps, useSlateStatic } from "slate-react";
import { Element as SlateElement, Text } from "slate";
import { memo } from "react";

const ParagraphElement = memo(
  ({ element, attributes, children }: RenderElementProps) => {
    const editor = useSlateStatic();

    const isSingleParagraphBelowTitle =
      editor.children.length === 2 &&
      SlateElement.isElement(editor.children[0]) &&
      editor.children[0].type === "title" &&
      SlateElement.isElement(editor.children[1]) &&
      editor.children[1].type === "paragraph" &&
      editor.children[1] === element;

    const isEmpty =
      element.children.length === 1 &&
      Text.isText(element.children[0]) &&
      element.children[0].text === "";

    return (
      <p {...attributes} className="relative outline-none ">
        {isSingleParagraphBelowTitle && isEmpty && (
          <span
            contentEditable={false}
            className="absolute left-0 top-0 text-gray-400 pointer-events-none select-none  "
            style={{
              padding: "0.125rem 0",
            }}
          >
            Write your note, use '/' for commands...
          </span>
        )}
        {children}
      </p>
    );
  }
);

export default memo(ParagraphElement);

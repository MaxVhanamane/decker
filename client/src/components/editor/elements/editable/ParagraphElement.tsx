import { RenderElementProps, useSlateStatic } from "slate-react";
import { Text } from "slate";
import { memo } from "react";

const ParagraphElement = memo(
  ({ element, attributes, children }: RenderElementProps) => {
    const editor = useSlateStatic();

    // Early exit: if there are more than 2 elements, this can't be the paragraph to show placeholder text.
    if (editor.children.length !== 2) {
      return (
        <p {...attributes} className="relative outline-none">
          {children}
        </p>
      );
    }

    // Early exit: if this isn't the second element, return immediately
    if (editor.children[1] !== element) {
      return (
        <p {...attributes} className="relative outline-none">
          {children}
        </p>
      );
    }

    // Only now check if empty (this will only run for the special paragraph)
    const isEmpty =
      element.children.length === 1 &&
      Text.isText(element.children[0]) &&
      element.children[0].text === "";

    return (
      <p
        {...attributes}
        className="relative outline-none paragraph-with-placeholder"
        data-placeholder="Write your note, use '/' for commands..."
        data-is-empty={isEmpty.toString()}
      >
        {children}
      </p>
    );
  }
);

export default memo(ParagraphElement);

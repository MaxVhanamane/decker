import { memo } from "react";
import { Text } from "slate";
import { RenderElementProps, useSlateStatic } from "slate-react";

const TitleElement = memo(
  ({ element, attributes, children }: RenderElementProps) => {
    const editor = useSlateStatic();

    // Early exit: if there are more than 2 elements, this can't be the special title
    if (editor.children.length !== 2 || editor.children[0] !== element) {
      return (
        <h1 {...attributes} className="text-lg font-bold outline-none relative">
          {children}
        </h1>
      );
    }

    const firstChild = element.children[0];
    const isEmpty =
      element.children.length === 1 &&
      Text.isText(firstChild) &&
      firstChild.text === "";

    return (
      <h1
        {...attributes}
        className="text-lg font-bold outline-none relative slate-placeholder"
        data-placeholder="Title"
        data-is-empty={isEmpty.toString()}
      >
        {children}
      </h1>
    );
  }
);

export default memo(TitleElement);

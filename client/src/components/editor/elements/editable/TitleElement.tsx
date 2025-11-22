import { memo } from "react";
import { Text } from "slate";
import { RenderElementProps } from "slate-react";

const TitleElement = memo(
  ({ element, attributes, children }: RenderElementProps) => {
    const firstChild = element.children[0];
    const isEmpty =
      element.children.length === 1 &&
      Text.isText(firstChild) &&
      firstChild.text === "";

    return (
      <h1
        {...attributes}
        className="text-2xl font-bold outline-none relative slate-placeholder-title"
        data-placeholder="Title"
        data-is-empty-title={isEmpty.toString()}
      >
        {children}
      </h1>
    );
  }
);

export default memo(TitleElement);

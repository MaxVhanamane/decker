import { memo } from "react";
import { Text } from "slate";
import { RenderElementProps } from "slate-react";

const TitleElement = ({
  element,
  children,
  attributes,
}: RenderElementProps) => {
  const firstChild = element.children[0];
  const isEmpty =
    element.children.length === 1 &&
    Text.isText(firstChild) &&
    firstChild.text === "";

  return (
    <h1
      {...attributes}
      className={`text-lg font-bold outline-none relative title-with-placeholder`}
      data-placeholder="Title"
      data-is-empty={isEmpty.toString()}
    >
      {children}
    </h1>
  );
};

export default memo(TitleElement);

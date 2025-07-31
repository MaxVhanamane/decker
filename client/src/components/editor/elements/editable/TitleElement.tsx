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
    <h1 {...attributes} className="text-lg font-bold outline-none relative ">
      {isEmpty && (
        <span
          contentEditable={false}
          className="absolute left-0 top-0 text-gray-400 pointer-events-none select-none"
          style={{
            padding: "0.125rem 0",
          }}
        >
          Title
        </span>
      )}
      {children}
    </h1>
  );
};

export default memo(TitleElement);

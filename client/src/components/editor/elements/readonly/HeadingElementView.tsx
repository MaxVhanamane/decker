import { memo, ReactNode } from "react";
import { HeadingElement } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

const HeadingElementView = ({
  children,
  element,
}: {
  children: ReactNode;
  element: HeadingElement;
}) => {
  const { indentLevel, level } = element;

  const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";

  const className =
    level === 1
      ? "text-2xl font-bold dark:text-white text-gray-800"
      : level === 2
      ? "text-xl font-semibold dark:text-white text-gray-800"
      : "text-lg font-medium dark:text-white text-gray-800";

  return (
    <Tag
      className={className}
      style={{
        marginLeft: indentLevel ? indentMargin * indentLevel : 0,
      }}
    >
      {children}
    </Tag>
  );
};

export default memo(HeadingElementView);

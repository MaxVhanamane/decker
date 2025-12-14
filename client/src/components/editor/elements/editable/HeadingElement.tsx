import { memo } from "react";
import { RenderElementProps } from "slate-react";
import type { HeadingElement } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

const Heading = (props: RenderElementProps) => {
  const element = props.element as HeadingElement;

  const Tag = element.level === 1 ? "h1" : element.level === 2 ? "h2" : "h3";

  const className =
    element.level === 1
      ? "text-2xl font-bold dark:text-white text-gray-800"
      : element.level === 2
      ? "text-xl font-semibold dark:text-white text-gray-800"
      : "text-lg font-medium dark:text-white text-gray-800";

  return (
    <Tag
      {...props.attributes}
      className={className}
      style={{
        marginLeft: element.indentLevel
          ? indentMargin * element.indentLevel
          : 0,
      }}
    >
      {props.children}
    </Tag>
  );
};

export default memo(Heading);

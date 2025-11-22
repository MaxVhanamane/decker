import { memo } from "react";
import { RenderElementProps } from "slate-react";
import { LargeHeadingElementType } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

const HeadingOneElement = (props: RenderElementProps) => {
  const heading = props.element as LargeHeadingElementType;
  return (
    <h2
      style={{
        marginLeft: heading.indentLevel
          ? indentMargin * heading.indentLevel
          : 0,
      }}
      {...props.attributes}
      className="text-xl font-semibold dark:text-white text-gray-800"
    >
      {props.children}
    </h2>
  );
};

export default memo(HeadingOneElement);

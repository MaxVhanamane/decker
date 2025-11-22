import { memo } from "react";
import { RenderElementProps } from "slate-react";
import { MediumHeadingElementType } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

const HeadingTwoElement = (props: RenderElementProps) => {
  const heading = props.element as MediumHeadingElementType;

  return (
    <h3
      style={{
        marginLeft: heading.indentLevel
          ? indentMargin * heading.indentLevel
          : 0,
      }}
      {...props.attributes}
      className="text-lg font-semibold dark:text-white text-gray-800"
    >
      {props.children}
    </h3>
  );
};

export default memo(HeadingTwoElement);

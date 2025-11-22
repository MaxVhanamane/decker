import { memo, ReactNode } from "react";
import { MediumHeadingElementType } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

const HeadingTwoElementView = ({
  children,
  element,
}: {
  children: ReactNode;
  element: MediumHeadingElementType;
}) => {
  const { indentLevel } = element;
  return (
    <h3
      style={{
        marginLeft: indentLevel ? indentMargin * indentLevel : 0,
      }}
      className="text-lg font-semibold dark:text-white text-gray-800"
    >
      {children}
    </h3>
  );
};

export default memo(HeadingTwoElementView);

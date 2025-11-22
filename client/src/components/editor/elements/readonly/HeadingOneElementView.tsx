import { memo, ReactNode } from "react";
import { LargeHeadingElementType } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

const HeadingOneElementView = ({
  children,
  element,
}: {
  children: ReactNode;
  element: LargeHeadingElementType;
}) => {
  const { indentLevel } = element;
  return (
    <h2
      style={{
        marginLeft: indentLevel ? indentMargin * indentLevel : 0,
      }}
      className="text-xl font-semibold dark:text-white text-gray-800"
    >
      {children}
    </h2>
  );
};

export default memo(HeadingOneElementView);

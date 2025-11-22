import { memo, ReactNode } from "react";
import { ParagraphElementType } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

const ParagraphElementView = memo(
  ({
    children,
    element,
  }: {
    children: ReactNode;
    element: ParagraphElementType;
  }) => {
    const { indentLevel } = element;
    return (
      <p
        style={{
          marginLeft: indentLevel ? indentMargin * indentLevel : 0,
        }}
        className="relative outline-none"
      >
        {children}
      </p>
    );
  }
);

export default memo(ParagraphElementView);

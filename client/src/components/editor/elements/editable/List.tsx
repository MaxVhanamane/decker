// List.tsx
import { RenderElementProps } from "slate-react";
import { ListElement } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

const List = ({ attributes, children, element }: RenderElementProps) => {
  const { indentLevel } = element as ListElement;
  return (
    <div
      style={{
        marginLeft: indentLevel ? indentMargin * indentLevel : 0,
      }}
      {...attributes}
      className="flex flex-col"
    >
      {children}
    </div>
  );
};

export default List;

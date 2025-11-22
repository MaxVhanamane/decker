import { memo, ReactNode } from "react";
import { BlockquoteElementType } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

export const QuoteElementView = ({
  children,
  element,
}: {
  children: ReactNode;
  element: BlockquoteElementType;
}) => {
  const { indentLevel } = element;
  return (
    <blockquote
      style={{
        marginLeft: indentLevel ? indentMargin * indentLevel : 0,
      }}
      className="border-l-4 relative text-lg text-gray-800 border-teal-500 dark:bg-slate-700 bg-gray-100 dark:text-white mb-2 !pt-6 !pl-14 !pr-4 !pb-6 italic  before:content-['\201C'] before:text-teal-500 z-0 before:absolute before:top-10 before:left-3 before:text-[64px] before:font-[Arial]"
    >
      {children}
    </blockquote>
  );
};

export default memo(QuoteElementView);

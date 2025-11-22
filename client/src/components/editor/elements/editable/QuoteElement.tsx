import { memo } from "react";
import { RenderElementProps } from "slate-react";
import { BlockquoteElementType } from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

export const QuoteElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const quoteElement = element as BlockquoteElementType;

  return (
    <blockquote
      style={{
        marginLeft: quoteElement.indentLevel
          ? indentMargin * quoteElement.indentLevel
          : 0,
      }}
      {...attributes}
      className="border-l-4 relative text-lg text-gray-800 border-yellow-500 dark:bg-slate-800/50 bg-gray-100 dark:text-white mb-2 !pt-6 !pl-14 !pr-4 !pb-6 italic  before:content-['\201C'] before:text-yellow-500 z-0 before:absolute before:top-10 before:left-3 before:text-[64px] before:font-[Arial]"
    >
      {children}
    </blockquote>
  );
};

export default memo(QuoteElement);

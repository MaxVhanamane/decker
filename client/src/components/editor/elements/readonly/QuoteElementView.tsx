import { memo } from "react";

export const QuoteElementView = ({ children }: { children: any }) => {
  return (
    <blockquote className="border-l-4 relative text-lg text-gray-800 border-teal-500 dark:bg-slate-700 bg-gray-100 dark:text-white mb-2 !pt-6 !pl-14 !pr-4 !pb-6 italic  before:content-['\201C'] before:text-teal-500 z-0 before:absolute before:top-10 before:left-3 before:text-[64px] before:font-[Arial]">
      {children}
    </blockquote>
  );
};

export default memo(QuoteElementView);

import { memo, JSX } from "react";
import { RenderLeafProps } from "slate-react";
import { twMerge } from "tailwind-merge";
import {
  highlightStylePlain,
  highlightStyleWavy,
} from "../../../../utils/editor/styles/highlightStyles";

export const Highlight = memo(
  ({
    attributes,
    styledText,
    leaf,
  }: RenderLeafProps & { styledText: JSX.Element }) => {
    return (
      <mark
        {...attributes}
        className={twMerge(
          " dark:text-white text-gray-800",
          leaf.highlightConfig?.style === "wavy"
            ? `wavy-highlight px-1 -mx-1  ${
                highlightStyleWavy[leaf.highlightConfig?.color ?? "yellow"]
              }`
            : `${highlightStylePlain[leaf.highlightConfig?.color ?? "yellow"]}`
        )}
      >
        {styledText}
      </mark>
    );
  }
);

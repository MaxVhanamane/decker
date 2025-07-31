import { memo, JSX } from "react";
import { twMerge } from "tailwind-merge";
import type { HighlightConfig } from "../../../../types/textEditorTypes";
import {
  highlightStylePlain,
  highlightStyleWavy,
} from "../../../../utils/editor/styles/highlightStyles";

export const HighlightView = memo(
  ({
    highlightConfig,
    styledText,
  }: {
    styledText: JSX.Element;
    highlightConfig: HighlightConfig;
  }) => {
    return (
      <mark
        className={twMerge(
          "px-1 dark:text-white text-gray-800",
          highlightConfig?.style === "wavy"
            ? `wavy-highlight ${
                highlightStyleWavy[highlightConfig?.color ?? "yellow"]
              }`
            : highlightStylePlain[highlightConfig?.color ?? "yellow"]
        )}
      >
        {styledText}
      </mark>
    );
  }
);

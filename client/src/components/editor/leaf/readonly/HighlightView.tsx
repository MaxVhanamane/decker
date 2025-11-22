import { memo, JSX } from "react";
import { twMerge } from "tailwind-merge";
import type {
  CustomTextType,
  HighlightConfig,
} from "../../../../types/textEditorTypes";
import {
  highlightStylePlain,
  highlightStyleWavy,
} from "../../../../utils/editor/styles/highlightStyles";
const EMPTY_CHARS = ["", "\uFEFF", "\u00A0", "\u200B"];
export const HighlightView = memo(
  ({
    highlightConfig,
    styledText,
    leaf,
  }: {
    styledText: JSX.Element;
    highlightConfig: HighlightConfig;
    leaf: CustomTextType;
  }) => {
    const isEmpty = !leaf.text || EMPTY_CHARS.includes(leaf.text);
    return (
      <mark
        className={twMerge(
          " dark:text-white text-gray-800",
          highlightConfig?.style === "wavy"
            ? `wavy-highlight px-1 -mx-1 ${
                highlightStyleWavy[highlightConfig?.color ?? "yellow"]
              }`
            : highlightStylePlain[highlightConfig?.color ?? "yellow"]
        )}
      >
        {isEmpty ? "\uFEFF" : styledText}
      </mark>
    );
  }
);

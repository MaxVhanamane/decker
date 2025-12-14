import { JSX } from "react";
import { twMerge } from "tailwind-merge";
import Button from "../../components/Button";
import type {
  HighlightColors,
  HighlightConfig,
  HighlightStyle,
} from "../../types/textEditorTypes";
import { Dispatch, SetStateAction, useMemo } from "react";
import { highlightColorOptions } from "../../utils/editor/styles/highlightStyles";
import { useSlateStatic } from "slate-react";
import { Range } from "slate";
import { buttonStaggerAnimation } from "../../components/editor/dropdowns/FloatingDropdown";
import { motion } from "motion/react";

type useHighlightColorButtonsProps = {
  activeHighlightConfig?: {
    color: HighlightColors;
    style: "plain" | "wavy";
  } | null;
  selectedHighlightStyle: HighlightStyle;
  onSelect: (color: HighlightConfig) => void;
  setSelectedHighlightColor?: Dispatch<SetStateAction<HighlightColors | null>>;
  toggledHighlightColor?: HighlightColors | null;
};

type useHighlightColorButtonsReturn<T extends "toolbar" | "commandpalette"> =
  T extends "toolbar"
    ? JSX.Element[]
    : {
        label: HighlightColors;
        icon: JSX.Element;
        category: "Highlight Colors";
        onClickHandler: () => void;
        hasSubmenu: boolean;
      }[];

export const useHighlightColorButtons = <
  T extends "toolbar" | "commandpalette"
>({
  activeHighlightConfig,
  selectedHighlightStyle,
  setSelectedHighlightColor,
  onSelect,
  toggledHighlightColor,
  usage,
}: useHighlightColorButtonsProps & {
  usage: T;
}): useHighlightColorButtonsReturn<T> => {
  const editor = useSlateStatic();
  const { selection } = editor;
  const isCollapsed = selection ? Range.isCollapsed(selection) : false;
  const highlightButtons = useMemo(() => {
    return highlightColorOptions.map(
      ({ color, toolTipPosition, backgroundColor, backgroundColorWavy }) => {
        // If usage is toolbar, create a full button
        if (usage === "toolbar") {
          return (
            <Button
              toolTipText={
                activeHighlightConfig?.color === color
                  ? isCollapsed
                    ? "Exit Highlight Mode"
                    : "Remove Highlighting"
                  : `Highlight with ${color[0].toUpperCase() + color.slice(1)}`
              }
              toolTipPosition={toolTipPosition}
              toolTipColor="light"
              withTooltip={true}
              hideTooltip={false}
              key={color}
              variant="unstyled"
              className={twMerge(
                "hover:bg-white dark:hover:bg-slate-700 p-1 rounded text-sm w-20 dark:text-white shadow-md border border-gray-300 dark:border-slate-600 relative transition duration-300 ",
                activeHighlightConfig?.color === color &&
                  "ring-2 dark:ring-cyan-400 ring-sky-500  "
              )}
              onClick={() => {
                if (setSelectedHighlightColor) {
                  setSelectedHighlightColor(color);
                }
                onSelect({ color: color, style: selectedHighlightStyle });
              }}
            >
              <motion.div
                variants={buttonStaggerAnimation}
                className={twMerge(
                  "flex flex-col justify-center items-center w-full",
                  selectedHighlightStyle === "plain"
                    ? backgroundColor
                    : backgroundColorWavy,
                  selectedHighlightStyle === "wavy" &&
                    "wavy-highlight px-1 -mx-1"
                )}
              >
                {color[0].toUpperCase() + color.slice(1)}
              </motion.div>
            </Button>
          );
        } else {
          // For command palette, return just the visual component without wrapping it in a Button
          const colorButtonPreview = (
            <div
              className={twMerge(
                "hover:bg-white dark:hover:bg-slate-700 p-1 rounded text-sm w-20 dark:text-white shadow-md border border-gray-300 dark:border-slate-600 relative transition duration-300"
              )}
            >
              <div
                className={twMerge(
                  "flex flex-col justify-center items-center w-full rounded ",
                  selectedHighlightStyle === "plain" && backgroundColor,
                  selectedHighlightStyle === "wavy" &&
                    toggledHighlightColor === color
                    ? backgroundColorWavy
                    : backgroundColor
                )}
              >
                {color[0].toUpperCase() + color.slice(1)}
              </div>
            </div>
          );

          return {
            label: color,
            icon: colorButtonPreview,
            category: "Highlight Colors",
            onClickHandler: () => {
              onSelect({ color, style: selectedHighlightStyle });
            },
            hasSubmenu: true,
          };
        }
      }
    );
  }, [
    onSelect,
    selectedHighlightStyle,
    activeHighlightConfig,
    setSelectedHighlightColor,
    usage,
  ]);

  return highlightButtons as useHighlightColorButtonsReturn<T>;
};

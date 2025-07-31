import { useMemo, JSX } from "react";
import type { ColorBarColors } from "../../types/textEditorTypes";
import Button from "../../components/Button";
import { twMerge } from "tailwind-merge";

type useColorToolbarButtonsProps = {
  activeColor?: ColorBarColors | null;
  onClick: (color: ColorBarColors) => void;
};

type useColorToolbarButtonsReturn<T extends "toolbar" | "commandpalette"> =
  T extends "toolbar"
    ? JSX.Element[]
    : {
        label: ColorBarColors;
        icon: JSX.Element;
        category: string;
        onClickHandler: () => void;
      }[];

export const useColorToolbarButtons = <T extends "toolbar" | "commandpalette">({
  activeColor,
  onClick,
  usage,
}: useColorToolbarButtonsProps & {
  usage: T;
}): useColorToolbarButtonsReturn<T> => {
  const colorBarOptions: {
    color: ColorBarColors;
    toolTipPosition: "top" | "right" | "bottom" | "left";
  }[] = [
    { color: "neutral", toolTipPosition: "left" },
    { color: "blue", toolTipPosition: "right" },
    { color: "yellow", toolTipPosition: "left" },
    { color: "green", toolTipPosition: "right" },
    { color: "red", toolTipPosition: "left" },
    { color: "pink", toolTipPosition: "right" },
  ];

  const colorButtons = useMemo(() => {
    return colorBarOptions.map(({ color, toolTipPosition }) => {
      if (usage === "toolbar") {
        return (
          <Button
            toolTipText={
              usage === "toolbar" ? "Currently applied style" : undefined
            }
            toolTipPosition={usage === "toolbar" ? toolTipPosition : undefined}
            toolTipColor={usage === "toolbar" ? "light" : undefined}
            hideTooltip={
              usage === "toolbar" ? activeColor !== color : undefined
            }
            key={color}
            withTooltip={usage === "toolbar" ? true : false}
            onClick={() => onClick(color)}
            variant="unstyled"
            className={twMerge(
              "hover:bg-white dark:hover:bg-slate-700 p-2 w-20  rounded text-sm  shadow-md border border-gray-300 dark:border-slate-600 relative transition duration-300",
              activeColor === color &&
                usage === "toolbar" &&
                "ring-1 dark:ring-slate-500 dark:bg-slate-600/80 dark:hover:bg-slate-600 ring-sky-200  bg-sky-200 hover:bg-blue-300/60"
            )}
          >
            <div
              className={twMerge(
                "flex flex-col justify-center items-start h-4 w-full border-l-[3px] pl-3",
                {
                  neutral: "border-gray-700 dark:border-gray-200",
                  blue: "border-blue-500",
                  yellow: "border-yellow-500",
                  green: "border-green-500",
                  red: "border-red-500",
                  pink: "border-pink-500",
                }[color]
              )}
            >
              {color[0].toUpperCase() + color.slice(1)}
            </div>
          </Button>
        );
      } else {
        const ToolbarButtonPreview = (
          <div
            className={twMerge(
              "hover:bg-white dark:hover:bg-slate-700 p-2 w-20  rounded text-sm  shadow-md border border-gray-300 dark:border-slate-600 relative transition duration-300"
            )}
          >
            <div
              className={twMerge(
                "flex flex-col justify-center items-start h-4 w-full border-l-[3px] pl-3",
                {
                  neutral: "border-gray-700 dark:border-gray-200",
                  blue: "border-blue-500",
                  yellow: "border-yellow-500",
                  green: "border-green-500",
                  red: "border-red-500",
                  pink: "border-pink-500",
                }[color]
              )}
            >
              {color[0].toUpperCase() + color.slice(1)}
            </div>
          </div>
        );

        return {
          label: `color-bar`,
          icon: ToolbarButtonPreview,
          category: "Color Bar",
          onClickHandler: () => onClick(color),
        };
      }
    });
  }, [activeColor, onClick, usage]);

  return colorButtons as useColorToolbarButtonsReturn<T>;
};

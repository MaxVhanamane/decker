import { Dispatch, RefObject, SetStateAction, JSX } from "react";
import Button from "../../Button";
import { FloatingDropdown } from "./FloatingDropdown";
import type { DividerStyle } from "../../../types/textEditorTypes";
import { twMerge } from "tailwind-merge";

type DividerOption = {
  dividerStyle: DividerStyle;
  tooltip: string;
  icon: () => JSX.Element;
};

type DividerDropdownProps = {
  setShowDividerOptions: Dispatch<SetStateAction<boolean>>;
  onSelect: (dividerStyle: DividerStyle) => void;
  dividerButtonRef: RefObject<HTMLButtonElement>;
  activeDivider: DividerStyle | null;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const DividerDropdown = ({
  setShowDividerOptions,
  onSelect,
  dividerButtonRef,
  activeDivider,
  mode,
  toolbarPosition,
}: DividerDropdownProps) => {
  return (
    <FloatingDropdown
      title="Divider options"
      onClickOutside={() => setShowDividerOptions(false)}
      className="w-40 flex flex-col items-center justify-center gap-3"
      buttonRef={dividerButtonRef}
      labelledBy="divider-dropdown-button"
      mode={mode}
      toolbarPosition={toolbarPosition}
    >
      <div className="flex flex-wrap gap-4 z-20 items-center justify-center">
        {options.map(({ dividerStyle, tooltip, icon }) => (
          <Button
            key={dividerStyle}
            toolTipText={
              activeDivider === dividerStyle
                ? "Currently applied divider style"
                : tooltip
            }
            toolTipColor="light"
            toolTipPosition="right"
            withTooltip
            variant="unstyled"
            className={twMerge(
              "hover:bg-white dark:hover:bg-slate-700 p-2 rounded text-sm w-28 shadow-md border border-gray-300 dark:border-slate-600 relative",
              activeDivider === dividerStyle &&
                "ring-1 dark:ring-slate-500 dark:bg-slate-600/80 dark:hover:bg-slate-600 ring-sky-200 bg-sky-200 hover:bg-blue-300/60"
            )}
            onClick={() => onSelect(dividerStyle)}
          >
            {icon()}
          </Button>
        ))}
      </div>
    </FloatingDropdown>
  );
};

const options: DividerOption[] = [
  {
    dividerStyle: "plain",
    tooltip: "Plain divider",
    icon: () => (
      <div className="flex flex-col justify-center items-center h-4 w-full">
        <div className="w-full h-px dark:bg-slate-500 bg-slate-300/60" />
      </div>
    ),
  },
  {
    dividerStyle: "dashed",
    tooltip: "Dashed divider",
    icon: () => (
      <div className="flex flex-col justify-center items-center h-4 w-full">
        <div className="w-full h-px bg-[repeating-linear-gradient(to_right,theme(colors.slate.300)_0px,theme(colors.slate.300)_8px,transparent_8px,transparent_16px)] dark:bg-[repeating-linear-gradient(to_right,theme(colors.slate.500)_0px,theme(colors.slate.500)_8px,transparent_8px,transparent_16px)]" />
      </div>
    ),
  },
  {
    dividerStyle: "3-dots",
    tooltip: "3-dot divider",
    icon: () => (
      <div className="flex justify-center items-center gap-4 w-full h-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="w-1.5 h-1.5 dark:bg-slate-400 bg-slate-500 rounded-full"
          />
        ))}
      </div>
    ),
  },
];

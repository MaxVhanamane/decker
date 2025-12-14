import { Dispatch, RefObject, SetStateAction, useMemo } from "react";
import type { HeadingLevel } from "../../../types/textEditorTypes";
import { buttonStaggerAnimation, FloatingDropdown } from "./FloatingDropdown";
import Button from "../../Button";
import { twMerge } from "tailwind-merge";
import { motion } from "motion/react";

type HeadingStyleDropdownProps = {
  setShowHeadingOptions: Dispatch<SetStateAction<boolean>>;
  onSelect: (headingLevel: HeadingLevel) => void;
  headingButtonRef: RefObject<HTMLButtonElement>;
  activeStyle: HeadingLevel | null;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const HeadingDropdown = ({
  setShowHeadingOptions,
  onSelect,
  headingButtonRef,
  activeStyle,
  mode,
  toolbarPosition,
}: HeadingStyleDropdownProps) => {
  const headings: HeadingLevel[] = useMemo(() => [1, 2, 3], []);

  const baseBtnClasses =
    "justify-center p-2 rounded text-sm w-28 shadow-md border border-gray-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 relative";

  return (
    <FloatingDropdown
      title="Heading Style"
      onClickOutside={() => setShowHeadingOptions(false)}
      buttonRef={headingButtonRef}
      className="flex flex-wrap gap-4 w-36 items-center justify-center"
      labelledBy="heading-dropdown-button"
      mode={mode}
      toolbarPosition={toolbarPosition}
    >
      <div className="flex flex-col gap-4 z-20 items-center">
        {headings.map((heading, i) => {
          const isActive = activeStyle === heading;

          return (
            <Button
              toolTipText={`ctrl + ${i + 1}`}
              withTooltip
              toolTipPosition="right"
              key={heading}
              onClick={() => onSelect(heading)}
              variant="unstyled"
              className={twMerge(
                baseBtnClasses,
                isActive &&
                  "ring-1 ring-sky-200 bg-sky-200 hover:bg-blue-300/60 " +
                    "dark:ring-slate-500 dark:bg-slate-600/80 dark:hover:bg-slate-600"
              )}
            >
              <motion.span variants={buttonStaggerAnimation}>
                Heading {i + 1}
              </motion.span>
            </Button>
          );
        })}
      </div>
    </FloatingDropdown>
  );
};

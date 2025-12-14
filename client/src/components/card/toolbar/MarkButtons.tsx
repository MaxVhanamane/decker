import { useSlate } from "slate-react";
import type {
  CustomTextKeyType,
  MarkButtonConfig,
} from "../../../types/textEditorTypes";
import CardToolbarButton from "./CardToolbarButton";
import { twMerge } from "tailwind-merge";
import { CustomEditor } from "../../../utils/editor/customEditor";
import { NodeQueries } from "../../../utils/editor/nodeQueries";
import { memo, useCallback } from "react";
import { isTouchOnlyDevice } from "../../../functions/isTouchOnlyDevice";

type MarkButtonProps = {
  markButtons: MarkButtonConfig[];
  isFormatDropdownOpen: (format: string) => boolean;
  isAnyDropdownOpen: () => boolean;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const MarkButtons = memo(
  ({
    markButtons,
    isFormatDropdownOpen,
    isAnyDropdownOpen,
    mode,
    toolbarPosition,
  }: MarkButtonProps) => {
    const editor = useSlate();

    const getTooltipPosition = useCallback(() => {
      const dropdownOpen = isAnyDropdownOpen();
      if (mode === "create") {
        return dropdownOpen ? "top" : "bottom";
      }
      return dropdownOpen ? "bottom" : "top";
    }, [isAnyDropdownOpen, mode]);

    return (
      <div
        className={twMerge(
          "flex items-center justify-end  w-full md:w-fit h-full gap-1",
          mode === "edit"
            ? "border-gray-400/40 dark:border-gray-300/10 border-r md:border-none"
            : ""
        )}
      >
        {markButtons.map((button) => {
          const isActive = CustomEditor.isMarkActive(
            editor,
            button?.format as CustomTextKeyType
          );

          const activeClass =
            isActive && mode === "create"
              ? "dark:bg-slate-700 bg-gray-200 hover:!bg-gray-100 hover:!text-gray-600 dark:hover:!bg-slate-800 dark:hover:!text-gray-200"
              : isActive && mode === "edit"
              ? "dark:bg-slate-500 bg-gray-200 hover:bg-gray-300 hover:!text-gray-600 dark:hover:!bg-slate-600 dark:hover:!text-gray-200 "
              : "";

          return (
            <CardToolbarButton
              className={twMerge(button.className, activeClass)}
              Icon={button.icon}
              name={button.name}
              mode={mode}
              onClickHandler={button.onClickHandler}
              toolTipText={button.toolTipText}
              subTooltipText={isTouchOnlyDevice() ? "" : button?.subTooltipText}
              withTooltip={button.withTooltip}
              tabIndex={button.tabIndex}
              key={button.name}
              disabled={NodeQueries.isInsideDivider(editor)}
              ref={button.ref}
              hideTooltip={isFormatDropdownOpen(button.format)}
              hasDropdown={
                !isFormatDropdownOpen(button.format) && button?.hasDropdown
                  ? button?.hasDropdown
                  : false
              }
              toolTipPosition={getTooltipPosition()}
              toolbarPosition={toolbarPosition}
              isActive={isActive}
            />
          );
        })}
      </div>
    );
  }
);

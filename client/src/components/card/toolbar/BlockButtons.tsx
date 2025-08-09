import { useSlate } from "slate-react";
import type {
  BlockButtonConfig,
  CustomElementFormatType,
} from "../../../types/textEditorTypes";
import CardToolbarButton from "./CardToolbarButton";
import { CustomEditor } from "../../../utils/editor/customEditor";
import { NodeQueries } from "../../../utils/editor/nodeQueries";
import { twMerge } from "tailwind-merge";
import { useCallback } from "react";
import { isTouchOnlyDevice } from "../../../functions/isTouchOnlyDevice";

type BlockButtonProps = {
  blockButtons: BlockButtonConfig[];
  isBlockDropdownOpen: (format: string) => boolean;
  isAnyDropdownOpen: () => boolean;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const BlockButtons = ({
  blockButtons,
  isBlockDropdownOpen,
  isAnyDropdownOpen,
  mode,
  toolbarPosition,
}: BlockButtonProps) => {
  const editor = useSlate();

  const getTooltipPosition = useCallback(() => {
    const dropdownOpen = isAnyDropdownOpen();
    if (mode === "create") {
      return dropdownOpen ? "top" : "bottom";
    }
    if (mode === "edit" && toolbarPosition === "top") {
      return dropdownOpen ? "top" : "bottom";
    } else {
      return dropdownOpen ? "bottom" : "top";
    }
  }, [isAnyDropdownOpen, mode]);

  return (
    <div className="flex items-center justify-end gap-1 w-full h-1/2 md:pr-0">
      {blockButtons.map((button) => {
        const isActive = CustomEditor.isBlockActive(
          editor,
          button?.format as CustomElementFormatType
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
            mode={mode}
            name={button.name}
            onClickHandler={button.onClickHandler}
            toolTipText={
              NodeQueries.isInRestrictedBlockExceptSelf(editor, button.format)
                ? "Formatting unavailable in the title."
                : button.toolTipText
            }
            subTooltipText={
              NodeQueries.isInRestrictedBlockExceptSelf(
                editor,
                button.format
              ) || isTouchOnlyDevice()
                ? ""
                : button?.subTooltipText
            }
            withTooltip={button.withTooltip}
            tabIndex={button.tabIndex}
            hasDropdown={
              !isBlockDropdownOpen(button.format) && button?.hasDropdown
                ? button?.hasDropdown
                : false
            }
            key={button.name}
            disabled={NodeQueries.isInRestrictedBlockExceptSelf(
              editor,
              button.format
            )}
            ref={button.ref}
            hideTooltip={isBlockDropdownOpen(button.format)}
            id={button?.id}
            aria-haspopup={button?.ariaHaspopup}
            aria-expanded={button?.ariaExpanded}
            toolTipPosition={getTooltipPosition()}
            toolbarPosition={toolbarPosition}
            isActive={isActive}
          />
        );
      })}
    </div>
  );
};

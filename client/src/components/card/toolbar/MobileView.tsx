import { memo } from "react";
import type {
  ActionButtonsConfig,
  BlockButtonConfig,
  MarkButtonConfig,
} from "../../../types/textEditorTypes";
import ActionButtons from "./ActionButtons";
import { MarkButtons } from "./MarkButtons";
import { VerticalDivider } from "../../VerticalDivider";
import { twMerge } from "tailwind-merge";
import { BlockButtons } from "./BlockButtons";

type MobileAndDeskTopViewProps = {
  isFormatDropdownOpen: (format: string) => boolean;
  markButtons: MarkButtonConfig[];
  blockButtons: BlockButtonConfig[];
  isBlockDropdownOpen: (format: string) => boolean;
  isAnyDropdownOpen: () => boolean;
  actionButtons: ActionButtonsConfig[];
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const MobileView = memo(
  ({
    isFormatDropdownOpen,
    markButtons,
    blockButtons,
    isBlockDropdownOpen,
    isAnyDropdownOpen,
    actionButtons,
    mode,
    toolbarPosition,
  }: MobileAndDeskTopViewProps) => {
    return (
      <>
        <div
          className={twMerge(
            "flex items-center justify-center md:gap-1 w-full  h-1/2 pr-4 gap-2",
            mode === "edit"
              ? "border-gray-400/40 dark:border-gray-300/10 border-b"
              : "dark:border-[#5fb1d6] border-b border-sky-500"
          )}
        >
          <MarkButtons
            isFormatDropdownOpen={isFormatDropdownOpen}
            isAnyDropdownOpen={isAnyDropdownOpen}
            markButtons={markButtons}
            mode={mode}
            toolbarPosition={toolbarPosition}
          />
          <VerticalDivider mode={mode} />
          <ActionButtons
            actionButtons={actionButtons}
            mode={mode}
            toolbarPosition={toolbarPosition}
          />
        </div>
        <div
          className={twMerge(
            "flex items-center justify-center gap-1 w-full  h-1/2 pr-4"
          )}
        >
          <BlockButtons
            blockButtons={blockButtons}
            isBlockDropdownOpen={isBlockDropdownOpen}
            isAnyDropdownOpen={isAnyDropdownOpen}
            mode={mode}
            toolbarPosition={toolbarPosition}
          />
        </div>
      </>
    );
  }
);

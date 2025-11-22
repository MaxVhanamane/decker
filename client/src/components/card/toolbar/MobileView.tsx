import { memo } from "react";
import type {
  ActionButtonsConfig,
  BlockButtonConfig,
  HistoryButtonsConfig,
  MarkButtonConfig,
  StructureButtonsConfig,
} from "../../../types/textEditorTypes";
import ActionButtons from "./ActionButtons";
import { MarkButtons } from "./MarkButtons";
import { VerticalDivider } from "../../VerticalDivider";
import { twMerge } from "tailwind-merge";
import { BlockButtons } from "./BlockButtons";
import { StructureButtons } from "./StructureButtons";
import { HistoryButtons } from "./HistoryButtons";

type MobileAndDeskTopViewProps = {
  isFormatDropdownOpen: (format: string) => boolean;
  markButtons: MarkButtonConfig[];
  blockButtons: BlockButtonConfig[];
  structureButtons: StructureButtonsConfig[];
  historyButtons: HistoryButtonsConfig[];
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
    structureButtons,
    mode,
    toolbarPosition,
    historyButtons,
  }: MobileAndDeskTopViewProps) => {
    return (
      <>
        <div
          className={twMerge(
            "flex items-center justify-center md:gap-1 w-full h-1/2 pr-3 gap-2",
            mode === "edit"
              ? "border-gray-400/40 dark:border-gray-300/10 border-b"
              : "dark:border-slate-500 border-gray-400 border-b "
          )}
        >
          <div className="flex items-center justify-end w-full">
            <MarkButtons
              isFormatDropdownOpen={isFormatDropdownOpen}
              isAnyDropdownOpen={isAnyDropdownOpen}
              markButtons={markButtons}
              mode={mode}
              toolbarPosition={toolbarPosition}
            />
            <VerticalDivider mode={mode} />
            <StructureButtons
              structureButtons={structureButtons}
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
        </div>
        <div
          className={twMerge(
            "flex items-center justify-center gap-0 w-full  h-1/2 pr-2"
          )}
        >
          <BlockButtons
            blockButtons={blockButtons}
            isBlockDropdownOpen={isBlockDropdownOpen}
            isAnyDropdownOpen={isAnyDropdownOpen}
            mode={mode}
            toolbarPosition={toolbarPosition}
          />
          <VerticalDivider mode={mode} />
          <HistoryButtons
            mode={mode}
            historyButtons={historyButtons}
            toolbarPosition={toolbarPosition}
          />
        </div>
      </>
    );
  }
);

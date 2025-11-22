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
  actionButtons: ActionButtonsConfig[];
  isAnyDropdownOpen: () => boolean;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const DesktopView = memo(
  ({
    isFormatDropdownOpen,
    markButtons,
    blockButtons,
    isBlockDropdownOpen,
    actionButtons,
    isAnyDropdownOpen,
    mode,
    structureButtons,
    toolbarPosition,
    historyButtons,
  }: MobileAndDeskTopViewProps) => {
    return (
      <>
        <div className="flex items-center">
          <BlockButtons
            mode={mode}
            blockButtons={blockButtons}
            isBlockDropdownOpen={isBlockDropdownOpen}
            isAnyDropdownOpen={isAnyDropdownOpen}
            toolbarPosition={toolbarPosition}
          />

          <VerticalDivider />
        </div>
        <div className=" flex items-center justify-center gap-1 pr-4">
          <MarkButtons
            isFormatDropdownOpen={isFormatDropdownOpen}
            markButtons={markButtons}
            isAnyDropdownOpen={isAnyDropdownOpen}
            mode={mode}
            toolbarPosition={toolbarPosition}
          />
          <VerticalDivider />

          <StructureButtons
            mode={mode}
            structureButtons={structureButtons}
            toolbarPosition={toolbarPosition}
          />
          <VerticalDivider />
          <HistoryButtons
            mode={mode}
            historyButtons={historyButtons}
            toolbarPosition={toolbarPosition}
          />
          <VerticalDivider />

          <ActionButtons
            actionButtons={actionButtons}
            mode={mode}
            toolbarPosition={toolbarPosition}
          />
        </div>
      </>
    );
  }
);

import { memo } from "react";
import type {
  ActionButtonsConfig,
  BlockButtonConfig,
  MarkButtonConfig,
} from "../../../types/textEditorTypes";
import ActionButtons from "./ActionButtons";
import { MarkButtons } from "./MarkButtons";
import { VerticalDivider } from "../../VerticalDivider";
import { BlockButtons } from "./BlockButtons";

type MobileAndDeskTopViewProps = {
  isFormatDropdownOpen: (format: string) => boolean;
  markButtons: MarkButtonConfig[];
  blockButtons: BlockButtonConfig[];
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
    toolbarPosition,
  }: MobileAndDeskTopViewProps) => {
    return (
      <>
        <BlockButtons
          mode={mode}
          blockButtons={blockButtons}
          isBlockDropdownOpen={isBlockDropdownOpen}
          isAnyDropdownOpen={isAnyDropdownOpen}
          toolbarPosition={toolbarPosition}
        />
        <VerticalDivider />
        <div className=" flex items-center justify-center gap-1  pr-4">
          <MarkButtons
            isFormatDropdownOpen={isFormatDropdownOpen}
            markButtons={markButtons}
            isAnyDropdownOpen={isAnyDropdownOpen}
            mode={mode}
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

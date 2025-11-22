import { memo } from "react";
import type { HistoryButtonsConfig } from "../../../types/textEditorTypes";
import CardToolbarButton from "./CardToolbarButton";
import { twMerge } from "tailwind-merge";
import { NodeQueries } from "../../../utils/editor/nodeQueries";
import { useSlate } from "slate-react";

type HistoryButtonsProps = {
  historyButtons: HistoryButtonsConfig[];
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const HistoryButtons = memo(
  ({ historyButtons, mode, toolbarPosition }: HistoryButtonsProps) => {
    const editor = useSlate();

    return (
      <div className="flex items-center justify-center ">
        {historyButtons.map((button) => {
          return (
            <CardToolbarButton
              className={twMerge(button.className)}
              Icon={button.icon}
              mode={mode}
              name={button.name}
              onClickHandler={button.onClickHandler}
              toolTipText={
                NodeQueries.isInRestrictedBlockExceptSelf(editor)
                  ? "Formatting unavailable in the title."
                  : button.toolTipText
              }
              disabled={NodeQueries.isInRestrictedBlockExceptSelf(editor)}
              withTooltip={button.withTooltip}
              tabIndex={button.tabIndex}
              hasDropdown={false}
              key={button.name}
              toolTipPosition="bottom"
              toolbarPosition={toolbarPosition}
            />
          );
        })}
      </div>
    );
  }
);

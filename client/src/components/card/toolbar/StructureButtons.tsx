import { memo } from "react";
import type { StructureButtonsConfig } from "../../../types/textEditorTypes";
import CardToolbarButton from "./CardToolbarButton";
import { twMerge } from "tailwind-merge";
import { NodeQueries } from "../../../utils/editor/nodeQueries";
import { useSlate } from "slate-react";

type StructureButtonsProps = {
  structureButtons: StructureButtonsConfig[];
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const StructureButtons = memo(
  ({ structureButtons, mode, toolbarPosition }: StructureButtonsProps) => {
    const editor = useSlate();

    return (
      <div className="flex items-center justify-center ">
        {structureButtons.map((button) => {
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

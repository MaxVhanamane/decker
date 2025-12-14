import { twMerge } from "tailwind-merge";
import type { ActionButtonsConfig } from "../../../types/textEditorTypes";
import CardToolbarButton from "./CardToolbarButton";
import { memo } from "react";
type ActionButtonProps = {
  actionButtons: ActionButtonsConfig[];
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};
const ActionButtons = ({
  actionButtons,
  mode,
  toolbarPosition,
}: ActionButtonProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {actionButtons.map(({ icon, ...button }) => {
        return (
          <CardToolbarButton
            {...button}
            className={twMerge(
              button.className,
              button.name === "Toggle toolbar Position" && "lg:hidden",
              button.name === "Toggle toolbar Position" &&
                toolbarPosition === "bottom" &&
                "rotate-180",
              mode === "edit" &&
                toolbarPosition === "bottom" &&
                button.name === "More Options" &&
                "rotate-0"
            )}
            Icon={icon}
            name={button.name}
            onClickHandler={button.onClickHandler}
            toolTipText={button.toolTipText}
            withTooltip={button.withTooltip}
            tabIndex={button.tabIndex}
            key={button.name}
            isActive={false}
            mode={mode}
            toolbarPosition={toolbarPosition}
          />
        );
      })}
    </div>
  );
};

export default memo(ActionButtons);

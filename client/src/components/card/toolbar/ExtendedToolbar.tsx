import { MarkButtons } from "./MarkButtons";
import { memo } from "react";
import { getExtendedToolbarMarkButtons } from "../../../utils/editor/editorButtonConfigs";
import { useEditorActions } from "../../../hooks/editor/useEditorActions";

type ExtendedToolbarProps = {
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const ExtendedToolbar = memo(
  ({ mode, toolbarPosition }: ExtendedToolbarProps) => {
    const { handleStrikethrough, handleInlineCode } = useEditorActions();
    const markButtons = getExtendedToolbarMarkButtons({
      handleStrikethrough,
      handleInlineCode,
      tabbable: false,
    });

    return (
      <div className="flex items-center">
        <MarkButtons
          mode={mode}
          markButtons={markButtons}
          isAnyDropdownOpen={() => false}
          isFormatDropdownOpen={() => false}
          toolbarPosition={toolbarPosition}
        />
      </div>
    );
  }
);

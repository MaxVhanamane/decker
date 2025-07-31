import { Dispatch, RefObject, SetStateAction } from "react";
import { FloatingDropdown } from "./FloatingDropdown";
import type { ColorBarColors } from "../../../types/textEditorTypes";
import { useColorToolbarButtons } from "../../../hooks/editor/useColorToolbarButtons";

type ColorBarDropdownProps = {
  setShowColorBarOptions: Dispatch<SetStateAction<boolean>>;
  onSelect: (color: ColorBarColors) => void;
  colorBarButtonRef: RefObject<HTMLButtonElement>;
  activeColor: ColorBarColors | null;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const ColorBarDropdown = ({
  setShowColorBarOptions,
  onSelect,
  colorBarButtonRef,
  activeColor,
  mode,
  toolbarPosition,
}: ColorBarDropdownProps) => {
  const colorButtons = useColorToolbarButtons({
    activeColor,
    onClick: onSelect,
    usage: "toolbar",
  });
  return (
    <FloatingDropdown
      buttonRef={colorBarButtonRef}
      onClickOutside={() => setShowColorBarOptions(false)}
      className="w-56 flex items-center justify-center flex-wrap gap-4"
      title="Bar Colors"
      labelledBy="colorbar-dropdown-button"
      mode={mode}
      toolbarPosition={toolbarPosition}
    >
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {colorButtons}
      </div>
    </FloatingDropdown>
  );
};

export default ColorBarDropdown;

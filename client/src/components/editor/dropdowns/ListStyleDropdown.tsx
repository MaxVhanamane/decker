import { Dispatch, RefObject, SetStateAction } from "react";
import type { ListType } from "../../../types/textEditorTypes";
import { FloatingDropdown } from "./FloatingDropdown";
import { useListToolbarButtons } from "../../../hooks/editor/useListToolbarButtons";

type ListStyleDropdownProps = {
  setShowListStyleOptions: Dispatch<SetStateAction<boolean>>;
  onSelect: (listType: ListType) => void;
  listStyleButtonRef: RefObject<HTMLButtonElement>;
  activeStyle: ListType | null;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const ListStyleDropdown = ({
  setShowListStyleOptions,
  onSelect,
  listStyleButtonRef,
  activeStyle,
  mode,
  toolbarPosition,
}: ListStyleDropdownProps) => {
  const listItems = useListToolbarButtons({
    usage: "toolbar",
    activeStyle,
    onClick: onSelect,
  });

  return (
    <FloatingDropdown
      title="List Style"
      onClickOutside={() => setShowListStyleOptions(false)}
      buttonRef={listStyleButtonRef}
      className="flex flex-wrap gap-4 w-56"
      labelledBy="list-dropdown-button"
      mode={mode}
      toolbarPosition={toolbarPosition}
    >
      <div className="flex flex-wrap gap-4 z-20 items-center justify-center">
        {listItems}
      </div>
    </FloatingDropdown>
  );
};

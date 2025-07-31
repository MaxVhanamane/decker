import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { BaseRange } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import Button from "../../Button";
import { twMerge } from "tailwind-merge";
import type {
  CommandItemType,
  HighlightStyle,
} from "../../../types/textEditorTypes";
import { removeSlashCommandText } from "../../../utils/editor/commandUtils";
import { useClickOutside } from "../../../hooks/utility/useClickOutside";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import HighlightSubmenu from "./HighlightSubmenu";
import { useDisableTabNavigation } from "../../../hooks/utility/useDisableTabNavigation";

type CommandPaletteProps = {
  filteredCommands: CommandItemType[];
  target: BaseRange | null;
  selectedIndex?: number;
  closeCommandPalette: () => void;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  isUsingArrowKeys: boolean;
  setIsUsingArrowKeys: Dispatch<SetStateAction<boolean>>;
  commandSearch: string;
  selectedHighlightStyle: HighlightStyle;
  setSelectedHighlightStyle: Dispatch<SetStateAction<HighlightStyle>>;
  activeSubmenuId: string | null;
  hasSubmenu: (command: CommandItemType) => boolean;
  toggleSubmenu: (command: string) => void;
  mode: "create" | "edit";
};

const CommandPalette = ({
  target,
  closeCommandPalette,
  selectedIndex,
  filteredCommands,
  setSelectedIndex,
  isUsingArrowKeys,
  setIsUsingArrowKeys,
  commandSearch,
  selectedHighlightStyle,
  setSelectedHighlightStyle,
  activeSubmenuId,
  hasSubmenu,
  toggleSubmenu,
  mode,
}: CommandPaletteProps) => {
  const commandPaletRef = useRef<HTMLDivElement>(null);
  const editor = useSlateStatic();
  const selectedItemRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(commandPaletRef, true, () => closeCommandPalette());

  useDisableTabNavigation(true);

  const updatePosition = () => {
    if (!target || !commandPaletRef.current) return;

    // Get the DOM range from the target
    const domRange = ReactEditor.toDOMRange(editor, target);

    const slashElement = document.querySelector('[data-slash-command="true"]');
    let rect;
    if (slashElement) {
      // Use the actual position of the decorated slash command
      rect = slashElement.getBoundingClientRect();
    } else {
      // Fallback to the normal cursor position
      rect = domRange.getBoundingClientRect();
    }
    const domNode =
      domRange.startContainer.parentElement ||
      (domRange.startContainer as Element);

    if (!domNode) return;
    let editorContainer;
    if (mode === "create") {
      editorContainer = domNode.closest("[data-editor-parent-create]");
    } else {
      editorContainer = domNode.closest("[data-editor-parent-edit]");
    }

    const palette = commandPaletRef.current;

    if (editorContainer) {
      const parentRect = editorContainer.getBoundingClientRect();
      const paletteHeight = palette.offsetHeight;
      const paletteWidth = palette.offsetWidth;

      // Calculate position relative to editor
      const distanceFromParentTop = rect.top - parentRect.top;
      const distanceFromParentLeft = rect.left - parentRect.left;

      const spaceBelow = parentRect.bottom - rect.bottom;
      const spaceAbove = rect.top - parentRect.top;

      // Default to show below the target
      let top = distanceFromParentTop + 15 + rect.height;

      // Flip above if there's not enough space below
      if (spaceBelow < paletteHeight && spaceAbove >= paletteHeight) {
        top = distanceFromParentTop - 15 - paletteHeight;
      }

      // Horizontal logic
      let left = distanceFromParentLeft;

      // Adjust if palette goes out to the right
      if (left + paletteWidth > parentRect.width) {
        left = parentRect.width - paletteWidth - 8; // Add small margin
      }

      // Adjust if palette goes out to the left
      if (left < 0) {
        left = 8; // Minimum padding from left
      }

      palette.style.top = `${top}px`;
      palette.style.left = `${left}px`;
    }
  };

  // Update position whenever command search changes
  useEffect(() => {
    requestAnimationFrame(updatePosition);
  }, [commandSearch]);

  // Initial setup and cleanup
  useEffect(() => {
    // Initial position update with a slight delay to ensure rendering
    const timer = setTimeout(() => {
      updatePosition();
    }, 10);

    // Also listen for editor changes
    const handleSelectionChange = () => {
      requestAnimationFrame(updatePosition);
    };

    // Update when window resizes
    window.addEventListener("resize", updatePosition);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [target]);

  useEffect(() => {
    if (
      selectedItemRef.current &&
      commandPaletRef.current &&
      isUsingArrowKeys
    ) {
      const container = commandPaletRef.current;
      const element = selectedItemRef.current;

      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Calculate the visible boundaries with padding
      const paddingTop = 10; // Pixels of padding at the top
      const paddingBottom = 10; // Pixels of padding at the bottom

      const topBoundary = containerRect.top + paddingTop;
      const bottomBoundary = containerRect.bottom - paddingBottom;

      // Check if element is outside or too close to the visible area
      const isTooHigh = elementRect.top < topBoundary;
      const isTooLow = elementRect.bottom > bottomBoundary;

      if (isTooHigh) {
        // Scroll so the element is at the top + padding
        container.scrollTop = element.offsetTop - paddingTop;
      } else if (isTooLow) {
        // Scroll so the element is at the bottom - padding - element height
        container.scrollTop =
          element.offsetTop +
          element.offsetHeight -
          container.clientHeight +
          paddingBottom;
      }
    }
  }, [selectedIndex]);

  const handleCommandClick = useCallback((item: CommandItemType) => {
    removeSlashCommandText(editor);
    item.onClickHandler();
    closeCommandPalette();
  }, []);

  let lastCategory = "";

  return (
    <div
      ref={commandPaletRef}
      className={twMerge(
        "w-64 border absolute -left-full -top-full dark:border-gray-500 border-gray-400 flex flex-col items-start p-2 gap-4 rounded-md dark:bg-slate-800 bg-gray-100 max-h-80 h-fit overflow-y-auto dark:dark-scrollbar light-scrollbar outline-none z-[1000]"
      )}
      role="dialog"
      aria-label="Command Palette"
    >
      {filteredCommands.length > 0 ? (
        <nav aria-label="Command categories" className="h-full w-full">
          <ul className="w-full list-inside flex flex-col gap-0.5 pb-2">
            {filteredCommands.map((item, index) => {
              const showCategory = item.category !== lastCategory;
              const isSubmenuOpen = activeSubmenuId === item.label;

              if (showCategory) {
                lastCategory = item.category;
              }

              return (
                <li key={index} className="w-full">
                  {showCategory && (
                    <>
                      {index !== 0 && index !== filteredCommands.length - 1 && (
                        <div className="border-t dark:border-white/10 border-gray-700/20"></div>
                      )}
                      <h3 className="dark:text-gray-500 text-gray-500 font-semibold text-sm mb-2 mt-2">
                        {item.category}
                      </h3>
                    </>
                  )}

                  <div className="w-full">
                    <Button
                      variant="unstyled"
                      className={twMerge(
                        "text-sm rounded-md px-2 py-2 w-full flex items-center gap-2 justify-start",
                        selectedIndex === index &&
                          isUsingArrowKeys &&
                          "dark:bg-slate-700 bg-gray-200",
                        !isUsingArrowKeys &&
                          "dark:hover:bg-slate-700 hover:bg-gray-200"
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasSubmenu(item)) {
                          if (activeSubmenuId === item.label) {
                            toggleSubmenu("");
                          } else {
                            toggleSubmenu(item.label);
                          }
                        } else {
                          handleCommandClick(item);
                        }
                      }}
                      onMouseMove={() => {
                        setIsUsingArrowKeys(false);
                        setSelectedIndex(index);
                      }}
                      ref={selectedIndex === index ? selectedItemRef : null}
                      aria-expanded={isSubmenuOpen}
                      aria-haspopup={hasSubmenu(item) ? "true" : "false"}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {item.icon && item.icon}
                          {item.JSX && item.JSX}
                          <span>{item.label}</span>
                        </div>
                        {hasSubmenu(item) &&
                          (activeSubmenuId === item.label ? (
                            <RiArrowDropUpLine
                              className="text-2xl"
                              aria-hidden="true"
                            />
                          ) : (
                            <RiArrowDropDownLine
                              className="text-2xl"
                              aria-hidden="true"
                            />
                          ))}
                      </div>
                    </Button>
                  </div>

                  {isSubmenuOpen && item.hasSubmenu && (
                    <HighlightSubmenu
                      setSelectedHighlightStyle={setSelectedHighlightStyle}
                      handleCommandClick={handleCommandClick}
                      item={item}
                      selectedHighlightStyle={selectedHighlightStyle}
                      toggleSubmenu={toggleSubmenu}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <div className="flex items-center justify-between w-full">
          <p>No commands found!</p>
          <Button
            variant="danger"
            className="rounded-md px-2 py-1 text-sm"
            toolTipText="close command pallet"
            withTooltip
            onClick={closeCommandPalette}
            type="button"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommandPalette;

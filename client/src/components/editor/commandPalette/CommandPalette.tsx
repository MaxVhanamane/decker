import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { BaseRange } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import Button from "../../Button";
import { twMerge } from "tailwind-merge";
import type { CommandItemType } from "../../../types/textEditorTypes";
import { removeSlashCommandText } from "../../../utils/editor/commandUtils";
import { useClickOutside } from "../../../hooks/utility/useClickOutside";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import HighlightSubmenu from "./HighlightSubmenu";
import { useDisableTabNavigation } from "../../../hooks/utility/useDisableTabNavigation";
import { CommandPaletteHighLightConfigType } from "../../../types/types";

type CommandPaletteProps = {
  filteredCommands: CommandItemType[];
  commandPalettePosition: BaseRange | null;
  selectedIndex?: number;
  closeCommandPalette: () => void;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  isUsingArrowKeys: boolean;
  setIsUsingArrowKeys: Dispatch<SetStateAction<boolean>>;
  commandSearch: string;
  highLightConfig: CommandPaletteHighLightConfigType;
  setHighlightConfig: Dispatch<
    SetStateAction<CommandPaletteHighLightConfigType>
  >;
  activeSubmenuId: string | null;
  hasSubmenu: (command: CommandItemType) => boolean;
  toggleSubmenu: (command: string) => void;
  mode: "create" | "edit";
  resetSlashPosition: () => void;
};

const CommandPalette = ({
  commandPalettePosition,
  closeCommandPalette,
  selectedIndex,
  filteredCommands,
  setSelectedIndex,
  isUsingArrowKeys,
  setIsUsingArrowKeys,
  commandSearch,
  highLightConfig,
  setHighlightConfig,
  activeSubmenuId,
  hasSubmenu,
  toggleSubmenu,
  mode,
  resetSlashPosition,
}: CommandPaletteProps) => {
  const commandPaletRef = useRef<HTMLDivElement>(null);
  const editor = useSlateStatic();
  const initialPlacement = useRef<"above" | "below" | null>(null);
  const selectedItemRef = useRef<HTMLButtonElement | null>(null);
  useClickOutside(commandPaletRef, true, () => {
    closeCommandPalette();
    resetSlashPosition();
    initialPlacement.current = null;
  });

  useDisableTabNavigation(true);

  const updatePosition = useCallback(() => {
    if (!commandPalettePosition || !commandPaletRef.current) return;

    const palette = commandPaletRef.current;
    const domRange = ReactEditor.toDOMRange(editor, commandPalettePosition);
    const slashElement = document.querySelector('[data-slash-command="true"]');

    const rect = slashElement
      ? slashElement.getBoundingClientRect()
      : domRange.getBoundingClientRect();

    const domNode =
      domRange.startContainer.parentElement ||
      (domRange.startContainer as Element);
    if (!domNode) return;

    const editorContainer =
      mode === "create"
        ? domNode.closest("[data-editor-parent-create]")
        : domNode.closest("[data-editor-parent-edit]");
    if (!editorContainer) return;

    const parentRect = editorContainer.getBoundingClientRect();
    const style = window.getComputedStyle(editorContainer);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    // const paddingBottom = parseFloat(style.paddingBottom) || 0;

    const scrollTop = editorContainer.scrollTop || 0;
    const scrollLeft = editorContainer.scrollLeft || 0;

    const distanceFromParentTop =
      rect.top - parentRect.top - paddingTop + scrollTop;
    const distanceFromParentLeft =
      rect.left - parentRect.left - paddingLeft + scrollLeft;

    const spaceBelow =
      parentRect.bottom - rect.bottom - (mode === "edit" ? 10 : 0);
    const spaceAbove = rect.top - parentRect.top;

    // Decide initial placement
    if (!initialPlacement.current) {
      initialPlacement.current = spaceBelow >= spaceAbove ? "below" : "above";
    }

    const GAP = 8; // smaller gap for a closer feel

    // Determine max-height class
    const MAX_HEIGHT = 272; // 17rem
    const DEFAULT_HEIGHT = 320; // 20rem = max-h-80
    let appliedHeight: number;

    if (
      spaceBelow < palette.offsetHeight &&
      spaceAbove < palette.offsetHeight
    ) {
      palette.classList.remove("max-h-80");
      palette.classList.add("max-h-[17rem]");
      appliedHeight = Math.min(MAX_HEIGHT, spaceAbove, spaceBelow);
    } else {
      palette.classList.remove("max-h-[17rem]");
      palette.classList.add("max-h-80");
      appliedHeight = Math.min(DEFAULT_HEIGHT, palette.offsetHeight);
    }

    // Compute top based on placement and visible height
    let top: number;
    if (initialPlacement.current === "below") {
      top = distanceFromParentTop + rect.height + GAP;
    } else {
      top = distanceFromParentTop - appliedHeight - GAP;
      if (top < 0) top = GAP; // prevent going out of editor top
    }

    let left = distanceFromParentLeft;
    const paletteWidth = palette.offsetWidth;

    // Clamp to container edges
    if (left + paletteWidth > parentRect.width - paddingRight) {
      left = parentRect.width - paddingRight - paletteWidth;
    }
    if (left < paddingLeft) {
      left = paddingLeft;
    }

    palette.style.top = `${top}px`;
    palette.style.left = `${left}px`;
  }, [commandPalettePosition, editor, mode]);

  // Update position whenever command search changes
  useLayoutEffect(() => {
    requestAnimationFrame(updatePosition);
  }, [commandSearch, updatePosition]);

  // Initial setup and cleanup
  useLayoutEffect(() => {
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
  }, [commandPalettePosition]);

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

  const handleCommandClick = useCallback(
    (item: CommandItemType) => {
      removeSlashCommandText(editor);
      resetSlashPosition();
      item.onClickHandler();
      closeCommandPalette();
      setHighlightConfig({
        selectedHighlightStyle: "plain",
        toggledHighlightColor: null,
      });
      initialPlacement.current = null;
    },
    [closeCommandPalette]
  );

  let lastCategory = "";

  return (
    <div
      ref={commandPaletRef}
      className={twMerge(
        "w-64 border absolute -left-full -top-full dark:border-gray-500 border-gray-400 flex flex-col items-start p-2 gap-4 rounded-md  bg-gray-100 max-h-80  h-fit overflow-y-auto dark:dark-scrollbar light-scrollbar outline-none z-[1000]",
        mode === "edit" ? "dark:bg-slate-900" : "dark:bg-slate-800"
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
                <li
                  key={index}
                  className="w-full dark:text-gray-50 text-gray-800"
                >
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
                      highLightConfig={highLightConfig}
                      handleCommandClick={handleCommandClick}
                      item={item}
                      setHighlightConfig={setHighlightConfig}
                      toggleSubmenu={toggleSubmenu}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <div className="flex flex-col items-center justify-center w-full py-4 text-center">
          <p className="text-sm font-medium text-muted-foreground/90">
            No commands found!
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Press{" "}
            <span className="px-1 py-0.5 bg-muted rounded-md text-xs font-mono">
              Space
            </span>{" "}
            to close or try a different command
          </p>
        </div>
      )}
    </div>
  );
};

export default CommandPalette;

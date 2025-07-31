import { twMerge } from "tailwind-merge";
import Button from "../../Button";
import type {
  CommandItemType,
  HighlightStyle,
} from "../../../types/textEditorTypes";
import { Dispatch, memo, SetStateAction, useRef } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import { useFocusTrap } from "../../../hooks/utility/useFocusTrap";

type HighlightSubmenuProps = {
  item: CommandItemType;
  selectedHighlightStyle: HighlightStyle;
  setSelectedHighlightStyle: Dispatch<SetStateAction<HighlightStyle>>;
  handleCommandClick: (item: CommandItemType) => void;
  toggleSubmenu: (command: string) => void;
};

const HighlightSubmenu = ({
  item,
  selectedHighlightStyle,
  setSelectedHighlightStyle,
  handleCommandClick,
  toggleSubmenu,
}: HighlightSubmenuProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  //   const [interactionMode, setInteractionMode] = useState<"mouse" | "keyboard">(
  //     "keyboard"
  //   );
  //   // Store the index of the currently hovered/focused element
  //   const currentElementIndex = useRef<number>(-1);

  const editor = useSlateStatic();

  //   useEffect(() => {
  //     if (containerRef.current) {
  //       containerRef.current.focus();
  //     }

  //     const handleKeyDown = (e: KeyboardEvent) => {
  //       if (!containerRef.current?.contains(document.activeElement)) return;

  //       if (
  //         e.key !== "ArrowDown" &&
  //         e.key !== "ArrowUp" &&
  //         e.key !== "Tab" &&
  //         e.key !== "Escape"
  //       )
  //         return;

  //       setInteractionMode("keyboard");
  //       const focusables = containerRef.current.querySelectorAll<HTMLElement>(
  //         'input[type="radio"], button'
  //       );
  //       const focusArray = Array.from(focusables);
  //       if (focusArray.length === 0) return;

  //       // Use the stored current element index for navigation calculations
  //       let nextIndex = currentElementIndex.current;

  //       if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
  //         e.preventDefault();
  //         // Move to next element from current position
  //         nextIndex = nextIndex === -1 ? 0 : (nextIndex + 1) % focusArray.length;
  //       } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
  //         e.preventDefault();
  //         // Move to previous element from current position
  //         nextIndex =
  //           nextIndex === -1
  //             ? focusArray.length - 1
  //             : (nextIndex - 1 + focusArray.length) % focusArray.length;
  //       } else if (e.key === "Escape") {
  //         e.preventDefault();
  //         toggleSubmenu("");
  //         ReactEditor.focus(editor);
  //         return;
  //       }

  //       // Update the current index and focus the element
  //       currentElementIndex.current = nextIndex;
  //       focusArray[nextIndex]?.focus();
  //     };

  //     document.addEventListener("keydown", handleKeyDown);
  //     return () => document.removeEventListener("keydown", handleKeyDown);
  //   }, [toggleSubmenu, editor]);

  //   // Create handlers for each element to track hover state
  //   const handleMouseOverElement = (index: number) => {
  //     return () => {
  //       setInteractionMode("mouse");
  //       currentElementIndex.current = index;
  //     };
  //   };

  const { isUsingKeyboard } = useFocusTrap(containerRef, "both", {
    onEscape: () => {
      toggleSubmenu("");
      ReactEditor.focus(editor);
    },
    trackInputMethod: true,
  });

  return (
    <div
      className="mt-1 ml-4 p-2 border outline-none dark:border-gray-600 border-gray-300 rounded-md dark:bg-slate-700 bg-white shadow-md relative"
      role="region"
      aria-label={`${item.label} options`}
      ref={containerRef}
      tabIndex={-1}
    >
      <p className="text-xs dark:text-gray-400 text-gray-500 mb-2">
        Select highlight style:
      </p>
      <fieldset className="flex flex-col gap-1">
        <legend className="sr-only">Highlight style options</legend>
        <label
          className={twMerge(
            "flex items-center gap-2 cursor-pointer p-1 rounded-md transition duration-200",
            isUsingKeyboard
              ? "focus-within:bg-gray-100 focus-within:dark:bg-gray-600"
              : "hover:bg-gray-100 dark:hover:bg-gray-600"
          )}
        >
          <input
            type="radio"
            name="highlightStyle"
            onKeyDown={(e) => {
              // Only handle Space and Enter for activation
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedHighlightStyle("plain");
              }
              // Let Tab and Arrow keys be handled by the focus trap
            }}
            checked={selectedHighlightStyle === "plain"}
            onChange={() => setSelectedHighlightStyle("plain")}
            // Make only the checked radio button tabbable
            tabIndex={selectedHighlightStyle === "plain" ? 0 : -1}
            className={twMerge(
              "appearance-none w-4 h-4 mr-2 rounded-full border-2 border-gray-400 relative cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gray-600 outline-none",
              "checked:border-blue-500",
              "dark:border-gray-500 dark:checked:border-sky-400",
              "before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-blue-500 before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:scale-0 checked:before:scale-100 checked:before:opacity-100",
              "before:transition-transform before:duration-200 before:opacity-0"
            )}
          />
          <span className="text-sm">Plain</span>
        </label>

        <label
          className={twMerge(
            "flex items-center gap-2 cursor-pointer p-1 rounded-md transition duration-200",
            isUsingKeyboard
              ? "focus-within:bg-gray-100 focus-within:dark:bg-gray-600"
              : "hover:bg-gray-100 dark:hover:bg-gray-600"
          )}
        >
          <input
            type="radio"
            name="highlightStyle"
            onKeyDown={(e) => {
              // Only handle Space and Enter for activation
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedHighlightStyle("wavy");
              }
              // Let Tab and Arrow keys be handled by the focus trap
            }}
            checked={selectedHighlightStyle === "wavy"}
            onChange={() => setSelectedHighlightStyle("wavy")}
            // Make only the checked radio button tabbable
            tabIndex={selectedHighlightStyle === "wavy" ? 0 : -1}
            className={twMerge(
              "appearance-none w-4 h-4 mr-2 rounded-full border-2 border-gray-400 relative cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gray-600 outline-none",
              "checked:border-blue-500",
              "dark:border-gray-500 dark:checked:border-sky-400",
              "before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-blue-500 before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:scale-0 checked:before:scale-100 checked:before:opacity-100",
              "before:transition-transform before:duration-200 before:opacity-0"
            )}
          />
          <span className="text-sm">Wavy</span>
        </label>

        <Button
          variant="primary"
          className={twMerge(
            "mt-2 w-full py-1 text-sm rounded-md",
            !isUsingKeyboard &&
              "focus-visible:ring-0 dark:ring-transparent ring-transparent"
          )}
          onClick={() => {
            handleCommandClick(item);
          }}
        >
          Apply
        </Button>
      </fieldset>
    </div>
  );
};

export default memo(HighlightSubmenu);

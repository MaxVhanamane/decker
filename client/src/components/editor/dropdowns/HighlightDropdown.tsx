import { Dispatch, RefObject, SetStateAction, useState } from "react";
import { FloatingDropdown } from "./FloatingDropdown";
import type {
  HighlightColors,
  HighlightConfig,
  HighlightStyle,
} from "../../../types/textEditorTypes";
import { twMerge } from "tailwind-merge";
import { useHighlightColorButtons } from "../../../hooks/editor/useHighlightColorButtons";
import {
  highlightStylePlain,
  highlightStyleWavy,
} from "../../../utils/editor/styles/highlightStyles";
import StopOrRemoveHighlightButton from "../HighlightButton";
import { CustomEditor } from "../../../utils/editor/customEditor";
import { useSlateStatic } from "slate-react";

type HighlightDropdownProps = {
  setShowHighlightOptions: Dispatch<SetStateAction<boolean>>;
  onSelect: (color: HighlightConfig) => void;
  highlightButtonRef: RefObject<HTMLButtonElement>;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
  activeHighlightConfig: {
    color: HighlightColors;
    style: "plain" | "wavy";
  } | null;
};

export const HighlightDropdown = ({
  setShowHighlightOptions,
  onSelect,
  highlightButtonRef,
  activeHighlightConfig,
  mode,
  toolbarPosition,
}: HighlightDropdownProps) => {
  const [selectedHighlightStyle, setSelectedHighlightStyle] =
    useState<HighlightStyle>(() =>
      activeHighlightConfig?.style ? activeHighlightConfig.style : "plain"
    );
  const [selectedHighlightColor, setSelectedHighlightColor] =
    useState<HighlightColors | null>(() =>
      activeHighlightConfig?.color ? activeHighlightConfig.color : null
    );
  const hightLightButtons = useHighlightColorButtons({
    activeHighlightConfig,
    onSelect,
    selectedHighlightStyle,
    setSelectedHighlightColor,
    usage: "toolbar",
  });
  const editor = useSlateStatic();
  const isActive = CustomEditor.isMarkActive(editor, "highlightConfig");
  return (
    <FloatingDropdown
      buttonRef={highlightButtonRef}
      onClickOutside={() => setShowHighlightOptions(false)}
      className="w-56 flex items-center justify-center flex-wrap gap-3"
      title="Hightlight style"
      labelledBy="colorbar-dropdown-button"
      mode={mode}
      toolbarPosition={toolbarPosition}
    >
      <div className="flex flex-col gap-3">
        <div
          className="flex flex-wrap gap-4 items-center justify-center"
          role="radiogroup"
          aria-label="Highlight style"
        >
          {highlightStyle.map(({ style, className }) => (
            <label
              key={style}
              className={twMerge(
                "flex items-center cursor-pointer p-1 rounded "
              )}
            >
              <input
                type="radio"
                name="highlightStyle"
                value={style}
                checked={selectedHighlightStyle === style}
                onChange={() => {
                  if (selectedHighlightColor) {
                    onSelect({ color: selectedHighlightColor, style });
                  }
                  setSelectedHighlightStyle(style);
                }}
                className={twMerge(
                  "appearance-none w-4 h-4 mr-2 rounded-full border-2 border-gray-400 relative cursor-pointer transition-all duration-200 focus-visible:ring-2  focus-visible:ring-gray-600 focus-visible:ring-offset-2 focus-visible:dark:ring-offset-slate-700 focus-visible:dark:ring-sky-200 focus-visible:ring-offset-gray-100 outline-none",
                  "checked:border-blue-500",
                  "dark:border-gray-500 dark:checked:border-sky-400",
                  "before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-blue-500 before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:scale-0 checked:before:scale-100 checked:before:opacity-100",
                  "before:transition-transform before:duration-200 before:opacity-0"
                )}
              />

              <div
                className={twMerge(
                  "flex flex-col justify-center items-center w-12 h-6 rounded "
                )}
              >
                <span
                  className={twMerge(
                    className,
                    selectedHighlightColor && style === "plain"
                      ? highlightStylePlain[selectedHighlightColor]
                      : selectedHighlightColor &&
                          highlightStyleWavy[selectedHighlightColor]
                  )}
                >
                  {style[0].toUpperCase() + style.slice(1)}
                </span>
              </div>
            </label>
          ))}
        </div>
        <div>
          <div className="border-t dark:border-gray-700 border-gray-400 "></div>
          <p className="dark:text-gray-300 text-gray-800 text-sm font-semibold text-center mb-4 mt-2">
            Highlight Colors
          </p>

          <div className="flex flex-wrap gap-4 items-center justify-center ">
            {hightLightButtons}
          </div>
        </div>
        {isActive && (
          <div>
            <div className="border-t dark:border-gray-700 border-gray-300"></div>

            <div className="flex flex-wrap gap-4 items-center justify-center  mt-3">
              <StopOrRemoveHighlightButton
                toggleDropdown={setShowHighlightOptions}
              />
            </div>
          </div>
        )}
      </div>
    </FloatingDropdown>
  );
};

export default HighlightDropdown;

const highlightStyle: {
  style: "plain" | "wavy";
  className: string;
}[] = [
  {
    style: "plain",
    className: "bg-yellow-200 dark:bg-yellow-400/50 !rounded-none px-2",
  },
  {
    style: "wavy",
    className: twMerge(
      "wavy-highlight px-1 -mx-1 ",
      highlightStyleWavy["yellow"]
    ),
  },
];

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactEditor, useSlate, useSlateSelection } from "slate-react";
import { Editor, Path, Range, Element as SlateElement } from "slate";
import { useEditorActions } from "../../../hooks/editor/useEditorActions";
import {
  commonButtonClassNames,
  getExtendedToolbarMarkButtons,
  getMarkButtons,
} from "../../../utils/editor/editorButtonConfigs";
import HighlightDropdown from "../dropdowns/HighlightDropdown";
import { createPortal } from "react-dom";
import {
  CustomTextKeyType,
  HighlightConfig,
} from "../../../types/textEditorTypes";
import { NodeQueries } from "../../../utils/editor/nodeQueries";
import CardToolbarButton from "../../card/toolbar/CardToolbarButton";
import { twMerge } from "tailwind-merge";
import { isTouchOnlyDevice } from "../../../functions/isTouchOnlyDevice";
import { CustomEditor } from "../../../utils/editor/customEditor";
import { useScrollLock } from "../../../hooks/utility/useScrollLock";
import { useIsDeviceType } from "../../../hooks/utility/useIsDeviceType";
import Button from "../../Button";
import { AiOutlineLink } from "react-icons/ai";
import { ShowToastContext } from "../../../context/ToastNotificationContext";

type SelectionToolbarProps = {
  mode: "create" | "edit";
  setShowHyperlinkModal: Dispatch<SetStateAction<boolean>>;
};

const SelectionToolbar = ({
  mode,
  setShowHyperlinkModal,
}: SelectionToolbarProps) => {
  const hoveringToolbarRef = useRef<HTMLDivElement | null>(null);
  const highlightButtonRef = useRef<HTMLButtonElement>(null);

  const editor = useSlate();
  const selection = useSlateSelection();
  const hasActiveSelection = useMemo(() => {
    if (!selection || Range.isCollapsed(selection)) return false;

    const selectedText = Editor.string(editor, selection).trim();
    return selectedText.length > 0;
  }, [selection, editor]);

  const { showToast } = useContext(ShowToastContext);
  const isTabOrMobile = useIsDeviceType("tablet");

  const [showHighlightOptions, setShowHighlightOptions] = useState(false);
  const {
    handleBold,
    handleUnderline,
    handleHighlight,
    handleItalic,
    handleLink,
    handleInlineCode,
    handleStrikethrough,
  } = useEditorActions();

  const markButtons = useMemo(
    () => [
      ...getMarkButtons({
        handleUnderline,
        handleBold,
        handleItalic,
        setShowHighlightOptions,
        tabbable: true,
        highlightButtonRef,
      }),
      ...getExtendedToolbarMarkButtons({
        handleInlineCode,
        handleStrikethrough,
        tabbable: true,
      }),
    ],
    [
      handleUnderline,
      handleBold,
      handleItalic,
      setShowHighlightOptions,
      highlightButtonRef,
      handleInlineCode,
      handleStrikethrough,
    ]
  );

  useScrollLock(showHighlightOptions);

  const isInsideTitle = useMemo(() => {
    if (!hasActiveSelection) return false;
    const [match] = Editor.nodes(editor, {
      at: selection!,
      match: (n) => SlateElement.isElement(n) && n.type === "title",
    });
    return !!match;
  }, [hasActiveSelection, selection, editor]);

  const isTrulyMultiLine = useMemo(() => {
    if (!hasActiveSelection) return false;
    const [startBlock] = Editor.nodes(editor, {
      at: selection!.anchor,
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });
    const [endBlock] = Editor.nodes(editor, {
      at: selection!.focus,
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
    });

    if (!startBlock || !endBlock) return false;
    if (!Path.equals(startBlock[1], endBlock[1])) return true;

    return Editor.string(editor, selection!).includes("\n");
  }, [hasActiveSelection, selection, editor]);

  /** Toolbar positioning */
  useEffect(() => {
    if (!hasActiveSelection || !hoveringToolbarRef.current) return;

    const toolbarEl = hoveringToolbarRef.current;
    try {
      const domRange = ReactEditor.toDOMRange(editor, selection!);
      const rects = Array.from(domRange.getClientRects());
      const targetRect =
        rects.length > 0
          ? isInsideTitle || isTabOrMobile
            ? rects[rects.length - 1]
            : rects[0]
          : domRange.getBoundingClientRect();

      const parent = document.querySelector(
        mode === "create"
          ? "[data-editor-parent-create]"
          : "[data-editor-parent-edit]"
      ) as HTMLElement | null;

      if (!parent) return;

      toolbarEl.style.visibility = "hidden";
      toolbarEl.style.display = "block";

      const toolbarRect = toolbarEl.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const scrollTop = parent.scrollTop;

      const LEFT_PADDING = 12;
      const RIGHT_PADDING = 12;
      const TOP_PADDING = 8;

      let left =
        targetRect.left -
        parentRect.left +
        targetRect.width / 2 -
        toolbarRect.width / 2;

      let top =
        isInsideTitle || isTabOrMobile
          ? targetRect.bottom - parentRect.top + scrollTop + TOP_PADDING
          : targetRect.top -
            parentRect.top +
            scrollTop -
            toolbarRect.height -
            TOP_PADDING;

      left = Math.max(
        LEFT_PADDING,
        Math.min(left, parentRect.width - toolbarRect.width - RIGHT_PADDING)
      );
      top = Math.min(
        Math.max(scrollTop, top),
        parent.scrollHeight - toolbarRect.height - TOP_PADDING
      );

      toolbarEl.style.top = `${top}px`;
      toolbarEl.style.left = `${left}px`;
      toolbarEl.style.visibility = "visible";
    } catch (err) {
      toolbarEl.style.display = "none";
    }
  }, [
    hasActiveSelection,
    selection,
    editor,
    mode,
    isInsideTitle,
    isTabOrMobile,
  ]);

  /** Handlers */
  const handleHighlightText = useCallback(
    (highlightConf: HighlightConfig) => {
      handleHighlight(highlightConf);
      setShowHighlightOptions(false);
    },
    [handleHighlight]
  );

  const handleLinkButtonClick = useCallback(() => {
    if (CustomEditor.isBlockActive(editor, "link")) {
      handleLink();
    } else if (hasActiveSelection) {
      setShowHyperlinkModal(true);
    } else {
      showToast({
        message: "Please select some text to convert it into a link.",
        severity: "warning",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
    }
  }, [
    editor,
    hasActiveSelection,
    handleLink,
    setShowHyperlinkModal,
    showToast,
  ]);

  const getTooltipPosition = useCallback(() => {
    if (mode === "create") return showHighlightOptions ? "top" : "bottom";
    return showHighlightOptions ? "bottom" : "top";
  }, [mode, showHighlightOptions]);

  const isLinkActive = CustomEditor.isBlockActive(editor, "link");

  const portalContainer = document.getElementById(
    mode === "edit"
      ? "dropdownPortalContainerForEdit"
      : "dropdownPortalContainer"
  )!;

  if (!hasActiveSelection) return null;

  return (
    <div
      ref={hoveringToolbarRef}
      className="dark:bg-slate-800 bg-gray-50 border border-slate-600 rounded-lg shadow-lg p-2 absolute"
      style={{ display: "none" }}
    >
      <div className="flex gap-1">
        {markButtons.map((button) => {
          const isActive = CustomEditor.isMarkActive(
            editor,
            button.format as CustomTextKeyType
          );
          const activeClass =
            isActive && mode === "create"
              ? "dark:bg-slate-700 bg-gray-200 hover:!bg-gray-100 dark:hover:!bg-slate-600"
              : isActive && mode === "edit"
              ? "dark:bg-slate-500 bg-gray-200 hover:bg-gray-300 dark:hover:!bg-slate-600"
              : "";

          return (
            <CardToolbarButton
              key={button.name}
              className={twMerge(button.className, activeClass)}
              Icon={button.icon}
              name={button.name}
              mode={mode}
              onClickHandler={button.onClickHandler}
              toolTipText={button.toolTipText}
              subTooltipText={isTouchOnlyDevice() ? "" : button.subTooltipText}
              withTooltip={button.withTooltip}
              tabIndex={button.tabIndex}
              disabled={NodeQueries.isInsideDivider(editor)}
              ref={button.ref}
              hideTooltip={
                showHighlightOptions && button.format === "highlightConfig"
              }
              hasDropdown={
                !showHighlightOptions && button.hasDropdown
                  ? button.hasDropdown
                  : false
              }
              toolTipPosition={getTooltipPosition()}
              toolbarPosition="top"
              isActive={isActive}
            />
          );
        })}
        {!isTrulyMultiLine && !isInsideTitle && (
          <Button
            variant="unstyled"
            className={twMerge(
              commonButtonClassNames,
              isLinkActive && mode === "create"
                ? "dark:bg-slate-700 bg-gray-200 hover:!bg-gray-100 dark:hover:!bg-slate-600"
                : isLinkActive && mode === "edit"
                ? "dark:bg-slate-500 bg-gray-200 hover:bg-gray-300 dark:hover:!bg-slate-600"
                : ""
            )}
            onClick={handleLinkButtonClick}
          >
            <AiOutlineLink />
          </Button>
        )}
      </div>

      {showHighlightOptions &&
        createPortal(
          <HighlightDropdown
            onSelect={handleHighlightText}
            setShowHighlightOptions={setShowHighlightOptions}
            highlightButtonRef={highlightButtonRef}
            activeHighlightConfig={NodeQueries.getActiveHighlightConfig(editor)}
            mode={mode}
            toolbarPosition="top"
          />,
          portalContainer
        )}
    </div>
  );
};

export default SelectionToolbar;

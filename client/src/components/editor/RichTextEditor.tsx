import React, {
  Dispatch,
  memo,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  useSlate,
} from "slate-react";
import { CustomEditor } from "../../utils/editor/customEditor";
import {
  Text,
  Element as SlateElement,
  Editor,
  Range,
  Transforms,
} from "slate";
import CommandPalette from "./commandPalette/CommandPalette";
import { NodeEntry } from "slate";
import { Path } from "slate";
import { RenderLeaf } from "./RenderLeaf";
import { RenderElement } from "./RenderElement";
import { useCommandPalette } from "../../hooks/editor/useCommandPalette";
import LinkTooltip from "./LinkTooltip";
import { SetNodeToDecorations } from "./SetNodeToDecorations";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useEditorActions } from "../../hooks/editor/useEditorActions";
import { ListsEditor, onKeyDown } from "@prezly/slate-lists";
import { CommandPaletteHandle } from "../card/CardInput";
import { Node } from "slate";

export interface TokenRange extends Range {
  token: boolean;
  [key: string]: unknown;
}
export type EditorWithDecorations = Editor & {
  nodeToDecorations: Map<SlateElement, TokenRange[]>;
};

interface CommonProps {
  setShowHyperlinkModal: Dispatch<SetStateAction<boolean>>;
  comandPaletteConfig: MutableRefObject<CommandPaletteHandle | null>;
}

// Create mode specific props
interface CreateModeProps extends CommonProps {
  mode: "create";
  expandEditorToMaxHeight: () => void;
  parentIndex?: 0 | -1;
}

// Edit mode specific props
interface EditModeProps extends CommonProps {
  mode: "edit";
}

type RichTextEditorProps = CreateModeProps | EditModeProps;

const RichTextEditor = (props: RichTextEditorProps) => {
  const editor = useSlate();
  const { mode, comandPaletteConfig } = props;

  const expandEditorToMaxHeight =
    mode === "create" ? props.expandEditorToMaxHeight : undefined;

  const [selectedLinkDetails, setSelectedLinkDetails] = useState<{
    title: string;
    url: string;
    linkPosition: Range;
  } | null>(null);

  const {
    totalCommandCount,
    filteredCommands,
    runCommand,
    setCommandSearch,
    setSelectedIndex,
    selectedIndex,
    closeCommandPalette,
    openCommandPalette,
    showCommandPalette,
    commandPalettePosition,
    isUsingArrowKeys,
    setIsUsingArrowKeys,
    commandSearch,
    highLightConfig,
    setHighlightConfig,
    activeSubmenuId,
    hasSubmenu,
    toggleSubmenu,
  } = useCommandPalette(editor, expandEditorToMaxHeight);
  const { handleLink } = useEditorActions();
  const { showToast } = useContext(ShowToastContext);
  const isEditorExpanded = mode === "create" && props?.parentIndex === -1;
  const lastSlashLocation = useRef<Range | null>(null);

  const resetSlashPosition = useCallback(() => {
    lastSlashLocation.current = null;
  }, []);

  useEffect(() => {
    if (isEditorExpanded) {
      ReactEditor.focus(editor);
    }
  }, [isEditorExpanded, editor]);

  useImperativeHandle(
    comandPaletteConfig,
    () => ({
      showCommandPalette: showCommandPalette,
      setCommandSearch: setCommandSearch,
      closeCommandPalette: closeCommandPalette,
      resetSlashPosition: resetSlashPosition,
      lastSlashLocation: lastSlashLocation,
      openCommandPalette: openCommandPalette,
    }),
    [
      showCommandPalette,
      setCommandSearch,
      closeCommandPalette,
      resetSlashPosition,
      lastSlashLocation,
      openCommandPalette,
    ],
  );

  const isInsideListElement = () => {
    const isInListItem = !!Editor.above(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === "list-item",
      mode: "lowest", // ensures only direct ancestor chain checked
    });
    return isInListItem;
  };

  const isInsideListElementAndEmpty = () => {
    // Find the closest ancestor that is a 'list-item-text'
    const entry = Editor.above(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === "list-item-text",
      mode: "lowest", // direct parent chain
    });

    if (!entry) return false; // not inside a list-item-text

    const [node] = entry;

    // Check if the node is empty
    const isEmpty = Node.string(node).trim() === "";

    return isEmpty;
  };

  const isInsideTitleElement = () => {
    const isInTitle = !!Editor.above(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === "title",
      mode: "lowest", // ensures only direct ancestor chain checked
    });
    return isInTitle;
  };

  const handleOnDOMBeforeInput = useCallback(
    (e: InputEvent) => {
      const { selection } = editor;
      if (!selection) return;

      //  Only run this for *real text insertions*.
      //  Backspace/Delete also trigger onDOMBeforeInput, but if we flipped
      // `data-is-empty` to false during those, the placeholder would disappear
      //  even when the node is still empty. This avoids that bug.
      if (
        e.inputType !== "insertText" &&
        e.inputType !== "insertCompositionText"
      ) {
        return;
      }

      // Find the nearest element block node (e.g., title or paragraph)
      const [elementNode, path] =
        Editor.above(editor, {
          match: SlateElement.isElement,
        }) || [];

      if (!elementNode || !path) return;

      // Only apply this logic to the first two elements (title at index 0, paragraph at index 1)
      const index = path[0];
      if (index > 1) return;

      const domNode = ReactEditor.toDOMNode(editor, elementNode);

      // Remove placeholder if it's currently marked empty
      if (
        index === 0 &&
        domNode.getAttribute("data-is-empty-title") === "true"
      ) {
        domNode.setAttribute("data-is-empty-title", "false");
      } else if (
        index === 1 &&
        domNode.getAttribute("data-is-empty-paragraph") === "true"
      ) {
        domNode.setAttribute("data-is-empty-paragraph", "false");
      }
    },
    [editor],
  );

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { selection } = editor;
    // Make sure the Control key is not pressed, since that toggles the chapters sidebar.
    // If we don't check this, pressing Ctrl + / will toggle the sidebar and also open the command palette.
    // if (
    //   event.key === "/" &&
    //   !event.ctrlKey && // not holding Ctrl (Windows/Linux)
    //   !event.metaKey && // not holding Cmd (Mac)
    //   !isInsideCodeBlock(editor) &&
    //   !showCommandPalette
    // ) {
    //   // Remember this slash position
    //   if (editor.selection) {
    //     lastSlashLocation.current = editor.selection;
    //   }
    //   openCommandPalette();

    //   return;
    // }

    if (event.key === "Enter" && isInsideListElement()) {
      onKeyDown(editor, event);
      return;
    }
    if (event.key === "Backspace" && isInsideListElementAndEmpty()) {
      event.preventDefault();
      ListsEditor.decreaseDepth(editor);
      return;
    }

    //Handle Exit code block on Shift + Enter

    if (event.key === "Enter" && event.shiftKey) {
      const { selection } = editor;
      if (!selection) return;

      const anchorBlockEntry = Editor.above(editor, {
        at: selection.anchor,
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "code-block",
      });
      const focusBlockEntry = Editor.above(editor, {
        at: selection.focus,
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "code-block",
      });

      // If neither anchor nor focus is in a code block, let default behavior happen
      if (!anchorBlockEntry && !focusBlockEntry) return;

      // Prevent default anytime selection touches a code block
      event.preventDefault();

      // Only handle if selection is fully inside a single code block
      if (!anchorBlockEntry || !focusBlockEntry) return;
      const [, anchorPath] = anchorBlockEntry;
      const [, focusPath] = focusBlockEntry;
      if (!Path.equals(anchorPath, focusPath)) return;

      // Now handle the “exit code block” logic
      const nextPath = Path.next(anchorPath);
      let nextNode: Node | null = null;
      if (Editor.hasPath(editor, nextPath)) {
        nextNode = Node.get(editor, nextPath);
      }

      const isNextEmptyParagraph =
        nextNode &&
        SlateElement.isElement(nextNode) &&
        nextNode.type === "paragraph" &&
        nextNode.children.length === 1 &&
        Text.isText(nextNode.children[0]) &&
        nextNode.children[0].text === "";

      if (isNextEmptyParagraph) {
        Transforms.select(editor, Editor.start(editor, nextPath));
        Transforms.collapse(editor, { edge: "start" });
      } else {
        Transforms.insertNodes(
          editor,
          { type: "paragraph", children: [{ text: "" }] },
          { at: nextPath, select: true },
        );
      }
    }

    if (event.key === "Tab" && event.shiftKey) {
      if (isInsideTitleElement()) return;
      event.preventDefault();
      const { selection } = editor;
      if (!selection) return;
      const isCollapsed = Range.isCollapsed(selection);
      if (isCollapsed && isInsideListElement()) {
        onKeyDown(editor, event);
      } else {
        CustomEditor.outdentBlock(editor);
      }
      return;
    }

    if (event.key === "Tab") {
      if (isInsideTitleElement()) return;

      event.preventDefault();
      const { selection } = editor;
      if (!selection) return;
      const isCollapsed = Range.isCollapsed(selection);
      if (isCollapsed && isInsideListElement()) {
        onKeyDown(editor, event);
      } else {
        CustomEditor.indentBlock(editor);
      }
      return;
    }

    if (!selection || !ReactEditor.isFocused(editor)) return;

    if (showCommandPalette) {
      if (event.key === "ArrowUp") {
        // Turn off the default behavior where the cursor moves up when up arrow is pressed, and instead just change the index to navigate through the command palette.
        event.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === null || prev <= 0) return totalCommandCount - 1;
          return prev - 1;
        });
        setIsUsingArrowKeys(true);

        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === null || prev >= totalCommandCount - 1) return 0;
          return prev + 1;
        });
        setIsUsingArrowKeys(true);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        runCommand(selectedIndex);
        const commandBtn = filteredCommands[selectedIndex];
        if (!hasSubmenu(commandBtn)) {
          resetSlashPosition();
        }
        return;
      }

      if (event.key === "Escape") {
        closeCommandPalette();
        resetSlashPosition();
      }
    }

    // Support both Ctrl (Windows/Linux) and Meta ⌘ (Mac)
    if (!(event.ctrlKey || event.metaKey)) return;

    switch (event.key.toLowerCase()) {
      case "`": {
        // Code Block (Ctrl/⌘ + `)
        event.preventDefault();
        CustomEditor.toggleBlock(editor, "code-block");
        break;
      }

      case "b": {
        // Bold (Ctrl/⌘ + B)
        event.preventDefault();
        CustomEditor.toggleMark(editor, "bold");
        break;
      }

      case "u": {
        // Underline (Ctrl/⌘ + U)
        event.preventDefault();
        CustomEditor.toggleMark(editor, "underline");
        break;
      }
      case "e": {
        event.preventDefault();
        CustomEditor.toggleMark(editor, "inlineCode");
        break;
      }

      case "i": {
        // Italic (Ctrl/⌘ + I)
        event.preventDefault();
        CustomEditor.toggleMark(editor, "italic");
        break;
      }

      // Headings (Ctrl/⌘ + 1 for H1, Ctrl/⌘ + 2 for H2)
      case "1": {
        event.preventDefault();
        CustomEditor.toggleHeading(editor, 1);
        break;
      }
      case "2": {
        event.preventDefault();
        CustomEditor.toggleHeading(editor, 2);
        break;
      }
      case "3": {
        event.preventDefault();
        CustomEditor.toggleHeading(editor, 3);
        break;
      }

      // Blockquote (Ctrl/⌘ + Q)
      case "q": {
        event.preventDefault();
        CustomEditor.toggleBlock(editor, "blockquote");
        break;
      }
      case "k": {
        event.preventDefault();

        // 1. DELETE BLOCK (Ctrl/Cmd + Shift + K)
        if (event.shiftKey) {
          if (isInsideTitleElement()) {
            showToast({
              message: "The main title block cannot be deleted.",
              severity: "warning",
              autoHideDuration: 3000,
              position: "top-center",
              animationStyle: "scale-up",
              theme: "auto",
            });
            return;
          }

          Transforms.removeNodes(editor, {
            match: (n) => {
              // Ignore the editor itself and non-elements
              if (Editor.isEditor(n) || !SlateElement.isElement(n))
                return false;

              // Explicitly SKIP these inner wrapper blocks.
              // This forces Slate to look one level higher and delete the actual
              // `code-block` or `list-item` container instead of just emptying them.
              if (n.type === "code-line" || n.type === "list-item-text") {
                return false;
              }

              // Match any other valid block (paragraph, blockquote, code-block, list-item, etc.)
              return Editor.isBlock(editor, n);
            },
          });
          return;
        }

        // 2. TOGGLE LINK (Ctrl/Cmd + K)
        if (CustomEditor.isBlockActive(editor, "link")) {
          handleLink();
        } else {
          const { selection } = editor;
          if (selection && !Range.isCollapsed(selection)) {
            props.setShowHyperlinkModal(true);
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
        }
        break;
      }
    }
  };

  const renderElement = useCallback(
    (props: RenderElementProps) => {
      if (props.element.type === "link") {
        return (
          <RenderElement
            {...props}
            setSelectedLinkDetails={setSelectedLinkDetails}
          />
        );
      }
      return <RenderElement {...props} />;
    },
    [setSelectedLinkDetails],
  );

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <RenderLeaf {...props} />;
  }, []);

  const useDecorate = (editor: Editor) => {
    return useCallback(
      ([node, path]: NodeEntry) => {
        const ranges: any[] = [];

        if (Text.isText(node)) {
          const regex = /\/[^\s]*/g;
          let match;
          const lastSlashLocationValue = lastSlashLocation.current;

          while ((match = regex.exec(node.text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;

            const matchRange = {
              anchor: { path, offset: start },
              focus: { path, offset: end },
            };
            // Only highlight if it’s the same range as the *typed* slash
            if (
              lastSlashLocationValue &&
              Path.equals(path, lastSlashLocationValue.anchor.path) &&
              lastSlashLocationValue.anchor.offset >= start &&
              lastSlashLocationValue.anchor.offset <= end
            ) {
              ranges.push({
                ...matchRange,
                isSlashCommand: true,
              });
            }
          }
        }

        // Second decorator logic (handling the code-line decorations)
        if (SlateElement.isElement(node) && node.type === "code-line") {
          const codeLineRanges = editor.nodeToDecorations?.get(node) || [];
          ranges.push(...codeLineRanges); // Add code-line specific ranges to the final ranges
        }

        return ranges;
      },
      [lastSlashLocation.current],
    );
  };

  const decorate = useDecorate(editor);

  // When I press Enter in the editor, the default behavior of SlateJS's scrollIntoView causes the parent element to scroll.
  // Sometimes, the cursor isn't visible, and I have to manually scroll to bring it into view.

  const handleScrollSelectionIntoView = useCallback(
    (_editor: ReactEditor, domRange: globalThis.Range): void => {
      if (!domRange) return;

      // Get the DOM node where the cursor is now
      const domNode: Element | null = (domRange.startContainer.parentElement ||
        domRange.startContainer) as Element;

      if (!domNode) return;

      let editorContainer;
      if (mode === "create") {
        // Find the editor container that should scroll
        editorContainer = domNode.closest("[data-editor-parent-create]");
      } else {
        editorContainer = domNode.closest("[data-editor-parent-edit]");
      }

      if (!editorContainer) return;

      // Calculate the current view
      const nodeRect: DOMRect = domNode.getBoundingClientRect();
      const containerRect: DOMRect = editorContainer.getBoundingClientRect();

      // Determine if the cursor is out of view
      const isOutOfViewBottom: boolean = nodeRect.bottom > containerRect.bottom;
      const isOutOfViewTop: boolean = nodeRect.top < containerRect.top;

      if (isOutOfViewBottom) {
        // If cursor is below the visible area, scroll it into view
        // within the editor container only
        editorContainer.scrollTop =
          editorContainer.scrollTop +
          (nodeRect.bottom - containerRect.bottom) +
          20; // Add padding for visibility
      } else if (isOutOfViewTop) {
        // If cursor is above the visible area
        editorContainer.scrollTop =
          editorContainer.scrollTop + (nodeRect.top - containerRect.top) - 20; // Subtract padding for visibility
      }

      // Prevent parent scroll adjustment
      const stopPropagation = (e: Event): void => {
        e.stopPropagation();
        document.removeEventListener("scroll", stopPropagation, true);
      };

      // Capture and stop scroll events
      document.addEventListener("scroll", stopPropagation, true);
    },
    [],
  );

  return (
    <>
      <SetNodeToDecorations />
      <div className="h-full flex flex-col ">
        <Editable
          readOnly={!isEditorExpanded && mode !== "edit" ? true : false}
          renderElement={renderElement}
          decorate={decorate}
          renderLeaf={renderLeaf}
          onDOMBeforeInput={handleOnDOMBeforeInput}
          onKeyDown={onKeyDownHandler}
          scrollSelectionIntoView={handleScrollSelectionIntoView}
          className="focus-visible:outline-none flex-1 [&>*]:py-[3px] py-4 [&>*:nth-child(2)]:mt-1 break-words !whitespace-break"
          tabIndex={!isEditorExpanded && mode !== "edit" ? -1 : 0}
        />
        <div className="h-28 flex-shrink-0 " />
        {/* Spacer for bottom padding */}
      </div>

      {showCommandPalette && commandPalettePosition && (
        <CommandPalette
          commandPalettePosition={commandPalettePosition}
          closeCommandPalette={closeCommandPalette}
          selectedIndex={selectedIndex}
          filteredCommands={filteredCommands}
          setSelectedIndex={setSelectedIndex}
          setIsUsingArrowKeys={setIsUsingArrowKeys}
          isUsingArrowKeys={isUsingArrowKeys}
          commandSearch={commandSearch}
          highLightConfig={highLightConfig}
          setHighlightConfig={setHighlightConfig}
          activeSubmenuId={activeSubmenuId}
          hasSubmenu={hasSubmenu}
          toggleSubmenu={toggleSubmenu}
          mode={mode}
          resetSlashPosition={resetSlashPosition}
        />
      )}

      {selectedLinkDetails && (
        <LinkTooltip
          selectedLinkDetails={selectedLinkDetails}
          setSelectedLinkDetails={setSelectedLinkDetails}
          mode={mode}
        />
      )}
    </>
  );
};

export default memo(RichTextEditor);

//import { detectCodeAndLanguage } from "../../utils/editor/detectCodeAndLanguage";
// const handlePaste = useCallback(
//   (event: React.ClipboardEvent<HTMLDivElement>, editor: Editor) => {
//     const text = event.clipboardData.getData("text/plain");
//     const result = detectCodeAndLanguage(text);
//     if (!text) return;

//     const [codeBlockEntry] = Editor.nodes(editor, {
//       match: (n) => SlateElement.isElement(n) && n.type === "code-block",
//     });

//     if (result.isCode) {
//       event.preventDefault();

//       // Split the text into lines and map to code-line elements
//       const lines = text.replace(/\r\n?/g, "\n").split("\n");

//       if (codeBlockEntry) {
//         //  If already inside a code block, insert as code-lines
//         const nodes: CodeLineElement[] = lines.map((line) => ({
//           type: "code-line",
//           children: [{ text: line }],
//         }));
//         Transforms.insertNodes(editor, nodes);
//       } else {
//         //  Otherwise, create and insert a new code block
//         const codeBlock: CodeBlockElementType = {
//           type: "code-block",
//           language: result.language || "plaintext",
//           children: lines.map((line) => ({
//             type: "code-line",
//             children: [{ text: line }],
//           })),
//         };

//         if (editor.selection && !Range.isCollapsed(editor.selection)) {
//           Transforms.delete(editor); // clear existing selection
//         }

//         Transforms.insertNodes(editor, codeBlock);
//       }
//     }
//   },
//   [editor]
// );

import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
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

import { Text, Element as SlateElement, Editor, Point, Range } from "slate";
import CommandPalette from "./commandPalette/CommandPalette";
import { getTextAfterSlash } from "../../utils/editor/commandUtils";
import { NodeEntry } from "slate";
import { Path } from "slate";
import { RenderLeaf } from "./RenderLeaf";
import { RenderElement } from "./RenderElement";
import { useCommandPalette } from "../../hooks/editor/useCommandPalette";
import LinkTooltip from "./LinkTooltip";
import { isInsideCodeBlock } from "../../utils/editor/isInsideCodeBlock";
import { SetNodeToDecorations } from "./SetNodeToDecorations";

export interface TokenRange extends Range {
  token: boolean;
  [key: string]: unknown;
}
export type EditorWithDecorations = Editor & {
  nodeToDecorations: Map<SlateElement, TokenRange[]>;
};

interface CommonProps {
  setShowHyperlinkModal: Dispatch<SetStateAction<boolean>>;
}

// Create mode specific props
interface CreateModeProps extends CommonProps {
  mode: "create";
  expandEditorToMaxHeight: () => void;
}

// Edit mode specific props
interface EditModeProps extends CommonProps {
  mode: "edit";
}

type RichTextEditorProps = CreateModeProps | EditModeProps;

const RichTextEditor = (props: RichTextEditorProps) => {
  const editor = useSlate();
  const { mode } = props;

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
    selectedHighlightStyle,
    setSelectedHighlightStyle,
    activeSubmenuId,
    hasSubmenu,
    toggleSubmenu,
  } = useCommandPalette(editor, expandEditorToMaxHeight);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { selection } = editor;

    if (!selection || !ReactEditor.isFocused(editor)) return;

    if (
      event.key === "/" &&
      !isInsideCodeBlock(editor) &&
      !showCommandPalette
    ) {
      openCommandPalette();
      return;
    }

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
        return;
      }

      if (event.key === "Escape") {
        closeCommandPalette();
      } else {
        setTimeout(() => {
          const text = getTextAfterSlash(editor);
          //  Close only if:
          // 1. text is empty (slash was deleted)
          // 2. text contains two or more **consecutive** spaces

          if (text === null) {
            closeCommandPalette();
            return;
          }
          if (text && /\s{2,}$/.test(text)) {
            closeCommandPalette();
            return;
          }

          setCommandSearch(text || "");
        });
      }
    }

    if (!event.ctrlKey) return;

    switch (event.key) {
      case "`": {
        // Prevent the "`" from being inserted by default.
        event.preventDefault();
        CustomEditor.toggleBlock(editor, "code-block");
        break;
      }

      case "b": {
        event.preventDefault();
        CustomEditor.toggleMark(editor, "bold");
        break;
      }
      case "u": {
        event.preventDefault();
        CustomEditor.toggleMark(editor, "underline");
        break;
      }
      case "l": {
        event.preventDefault();
        CustomEditor.toggleBlock(editor, "link");
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
    [setSelectedLinkDetails]
  );

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <RenderLeaf {...props} />;
  }, []);

  const useDecorate = (editor: Editor) => {
    return useCallback(
      ([node, path]: NodeEntry) => {
        const ranges: any[] = [];

        // First decorator logic (handling the command palette matching)
        if (Text.isText(node) && showCommandPalette && commandPalettePosition) {
          // Match slash commands anywhere in the text
          const regex = /\/[^\s]*/g;
          let match;

          while ((match = regex.exec(node.text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;

            const matchRange = {
              anchor: { path, offset: start },
              focus: { path, offset: end },
            };

            // Only decorate if it's the same path and range as commandPalettePosition
            if (
              Path.equals(path, commandPalettePosition.anchor.path) &&
              Point.equals(matchRange.anchor, commandPalettePosition.anchor)
            ) {
              ranges.push({
                ...matchRange,
                isSlashCommand: true,
                text: match[0],
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
      [showCommandPalette, commandPalettePosition, editor.nodeToDecorations]
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
    []
  );

  const handleRemovePlaceholderText = (e: InputEvent) => {
    const { selection } = editor;
    if (!selection) return;
    //  Only run this for *real text insertions*.
    //    Backspace/Delete also trigger onDOMBeforeInput, but if we flipped
    //    `data-is-empty` to false during those, the placeholder would disappear
    //    even when the node is still empty. This avoids that bug.
    if (e.inputType !== "insertText" && e.inputType !== "insertCompositionText")
      return;

    const [elementNode, path] =
      Editor.above(editor, {
        match: (n) => SlateElement.isElement(n),
      }) || [];

    if (!elementNode || (path && path[0] > 1)) return;

    const domNode = ReactEditor.toDOMNode(editor, elementNode);
    if (domNode.getAttribute("data-is-empty") === "true") {
      domNode.setAttribute("data-is-empty", "false");
    }
  };

  return (
    <>
      <SetNodeToDecorations />
      <div className="h-full flex flex-col">
        <Editable
          renderElement={renderElement}
          decorate={decorate}
          renderLeaf={renderLeaf}
          onDOMBeforeInput={handleRemovePlaceholderText}
          onKeyDown={onKeyDown}
          scrollSelectionIntoView={handleScrollSelectionIntoView}
          className="focus-visible:outline-none flex-1 [&>*]:py-[3px] py-4 [&>*:nth-child(2)]:mt-1 break-words break-all whitespace-pre-wrap"
        />
        <div className="h-10 flex-shrink-0 " />
        {/* Spacer for bottom padding */}
      </div>

      {showCommandPalette && commandPalettePosition && (
        <CommandPalette
          target={commandPalettePosition}
          closeCommandPalette={closeCommandPalette}
          selectedIndex={selectedIndex}
          filteredCommands={filteredCommands}
          setSelectedIndex={setSelectedIndex}
          setIsUsingArrowKeys={setIsUsingArrowKeys}
          isUsingArrowKeys={isUsingArrowKeys}
          commandSearch={commandSearch}
          selectedHighlightStyle={selectedHighlightStyle}
          setSelectedHighlightStyle={setSelectedHighlightStyle}
          activeSubmenuId={activeSubmenuId}
          hasSubmenu={hasSubmenu}
          toggleSubmenu={toggleSubmenu}
          mode={mode}
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

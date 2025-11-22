import { useCallback } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import { CustomEditor } from "../../utils/editor/customEditor";
import type { CustomTextKeyType, DividerStyle, ColorBarColors, ListType, HighlightConfig } from "../../types/textEditorTypes";
import { HistoryEditor } from "slate-history";


export const useEditorActions = () => {
    const editor = useSlateStatic();
    // When you click on a button in the CardToolbar or use the mouse to select a command in the command palette, the focus shifts to that button. It applies the style, but you have to manually click back in the editor to continue typing.To avoid that, we'll use ReactEditor.focus(editor) to restore the focus to the editor.

    const preserveEditorFocus = useCallback(
        (fn: () => void) => {
            fn(); // run the formatting
            ReactEditor.focus(editor); // restore focus to editor
        },
        [editor]
    );

    const toggleMarkWithValidation = useCallback((format: CustomTextKeyType, highlightConf?: HighlightConfig) => {
        // const { selection } = editor
        // const isActive = CustomEditor.isMarkActive(editor, format);
        // if (selection && Range.isCollapsed(selection) && !isActive) {
        //     const label = formatMessages[format] || `format text`;
        //     showToast({
        //         message: `Select some text to ${label}.`
        //         , severity: "warning", animationStyle: "scale-up", position: "top-center", autoHideDuration: 3000, progressBar: "hide"
        //     })
        //     return
        // }
        if (format === "highlightConfig") {
            CustomEditor.toggleMark(editor, format, highlightConf)
            return
        }
        CustomEditor.toggleMark(editor, format)
    }, [editor])

    const handleBold = useCallback(() => {
        preserveEditorFocus(() => toggleMarkWithValidation("bold"));
    }, [editor, preserveEditorFocus]);
    const handleItalic = useCallback(() => {
        preserveEditorFocus(() => toggleMarkWithValidation("italic"));
    }, [editor, preserveEditorFocus]);

    const handleHighlight = useCallback((highlightConf: HighlightConfig) => {
        preserveEditorFocus(() => toggleMarkWithValidation("highlightConfig", highlightConf));
    }, [editor, preserveEditorFocus]);

    const handleUnderline = useCallback(() => {
        preserveEditorFocus(() => toggleMarkWithValidation("underline"));
    }, [editor, preserveEditorFocus]);
    const handleInlineCode = useCallback(() => {
        preserveEditorFocus(() => toggleMarkWithValidation("inlineCode"));
    }, [editor, preserveEditorFocus]);

    const handleText = useCallback(() => {
        preserveEditorFocus(() => CustomEditor.toggleBlock(editor, "paragraph"));
    }, [editor, preserveEditorFocus]);
    const handleQuote = useCallback(() => {
        preserveEditorFocus(() => CustomEditor.toggleBlock(editor, "blockquote"));
    }, [editor, preserveEditorFocus]);

    const handleCode = useCallback(() => {
        preserveEditorFocus(() => CustomEditor.toggleBlock(editor, "code-block"));
    }, [editor, preserveEditorFocus]);


    const handleList = useCallback((litsType: ListType) => {
        preserveEditorFocus(() => CustomEditor.toggleList(editor, litsType));
    }, [editor, preserveEditorFocus]);
    const handleUndo = useCallback(() => {
        HistoryEditor.undo(editor)
    }, [editor]);
    const handleRedo = useCallback(() => {
        HistoryEditor.redo(editor)

    }, [editor]);


    const handleH1 = useCallback(() => {
        preserveEditorFocus(() => CustomEditor.toggleBlock(editor, "h1"));
    }, [editor, preserveEditorFocus]);
    const handleIndentBlock = useCallback(() => {
        preserveEditorFocus(() => CustomEditor.indentBlock(editor));
    }, [editor, preserveEditorFocus]);
    const handleOutdentBlock = useCallback(() => {
        preserveEditorFocus(() => CustomEditor.outdentBlock(editor));
    }, [editor, preserveEditorFocus]);

    const handleH2 = useCallback(() => {
        preserveEditorFocus(() => CustomEditor.toggleBlock(editor, "h2"));
    }, [editor, preserveEditorFocus]);

    const handleDivider = useCallback((dividerStyle: DividerStyle) => {
        preserveEditorFocus(() => CustomEditor.toggleDivider(editor, "divider", dividerStyle));
    }, [editor, preserveEditorFocus]);
    const handleColorBar = useCallback((color: ColorBarColors) => {
        preserveEditorFocus(() => CustomEditor.toggleColorBar(editor, color, "color-bar"));
    }, [editor, preserveEditorFocus]);

    const handleLink = useCallback(() => {
        if (CustomEditor.isBlockActive(editor, "link")) {
            preserveEditorFocus(() => CustomEditor.toggleLink(editor, "link"));
        }
    }, [editor, preserveEditorFocus]);

    return {
        handleBold,
        handleItalic,
        handleUnderline,
        handleInlineCode,
        handleCode,
        handleH1,
        handleH2,
        handleLink,
        handleText,
        handleHighlight,
        handleQuote,
        handleDivider,
        handleColorBar,
        handleList,
        handleOutdentBlock,
        handleIndentBlock,
        handleUndo,
        handleRedo
    };
};

import {
    Editor,
    Transforms,
    Range,
    Path,
    Element as SlateElement,
    Text,
} from "slate";
import { ReactEditor } from "slate-react";
import type { CustomElementType } from "../../../types/textEditorTypes";

const ElementsToCheck = ["heading", "list-item-text", "blockquote", "color-bar"];

export const withResetToParagraphOnEnter = (editor: Editor & ReactEditor) => {
    const { insertBreak } = editor;

    editor.insertBreak = () => {
        const { selection } = editor;

        if (!selection || !Range.isCollapsed(selection)) {
            return insertBreak();
        }

        const [match] = Editor.nodes(editor, {
            match: n =>
                SlateElement.isElement(n) &&
                ElementsToCheck.includes((n as any).type),
            mode: "lowest",
        });

        if (!match) {
            // Normal behavior
            insertBreak();
            clearMarksIfOnEmptyText(editor);
            return;
        }

        const [node, path] = match;
        if (!SlateElement.isElement(node)) {
            insertBreak();
            clearMarksIfOnEmptyText(editor);
            return;
        }

        const type = (node as any).type;
        const isEmpty = Editor.isEmpty(editor, node);

        if (type === "heading") {
            if (isEmpty) {
                Transforms.setNodes(editor, { type: "paragraph" }, { at: path });

                Transforms.unsetNodes(editor, ["level", "indentLevel"], {
                    at: path,
                    match: n =>
                        SlateElement.isElement(n) &&
                        (n as any).type === "paragraph",
                });
            } else {
                const nextPath = Path.next(path);
                const paragraph: CustomElementType = {
                    type: "paragraph",
                    children: [{ text: "" }],
                };
                Transforms.insertNodes(editor, paragraph, { at: nextPath });
                Transforms.select(editor, Editor.start(editor, nextPath));
            }

            clearMarksIfOnEmptyText(editor);
            return;
        }

        if (type === "blockquote") {
            if (isEmpty) {
                Transforms.setNodes(editor, { type: "paragraph" }, { at: path });
            } else {
                const nextPath = Path.next(path);
                const paragraph: CustomElementType = {
                    type: "paragraph",
                    children: [{ text: "" }],
                };
                Transforms.insertNodes(editor, paragraph, { at: nextPath });
                Transforms.select(editor, Editor.start(editor, nextPath));
            }

            clearMarksIfOnEmptyText(editor);
            return;
        }

        if (type === "color-bar") {
            if (isEmpty) {
                Transforms.setNodes(editor, { type: "paragraph" }, { at: path });

                Transforms.unsetNodes(editor, ["color", "indentLevel"], {
                    at: path,
                    match: n =>
                        SlateElement.isElement(n) &&
                        (n as any).type === "paragraph",
                });
            } else {
                const nextPath = Path.next(path);
                const paragraph: CustomElementType = {
                    type: "paragraph",
                    children: [{ text: "" }],
                };
                Transforms.insertNodes(editor, paragraph, { at: nextPath });
                Transforms.select(editor, Editor.start(editor, nextPath));
            }

            clearMarksIfOnEmptyText(editor);
            return;
        }

        // Fallback
        insertBreak();
        clearMarksIfOnEmptyText(editor);
    };

    return editor;
};

/**
 * If the cursor is inside an empty text node, remove all its marks
 * and reset editor.marks so new typing is unformatted.
 */
function clearMarksIfOnEmptyText(editor: Editor) {
    const { selection } = editor;
    if (!selection || !Range.isCollapsed(selection)) return;

    const iterator = Editor.nodes(editor, {
        at: selection,
        match: n => Text.isText(n),
    });

    const first = iterator.next();
    if (first.done) {
        editor.marks = null;
        return;
    }

    const [node, path] = first.value;

    // Only remove marks IF marks actually exist
    // DO NOT call unsetNodes if the leaf is already clean
    const markKeys = Object.keys(node).filter(k => k !== "text");
    if (node.text === "" && markKeys.length > 0) {
        Transforms.unsetNodes(editor, markKeys, { at: path });
    }

    // Reset marks without interfering with normalization
    editor.marks = null; // not {}
}

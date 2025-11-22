import { Editor, Transforms, Range, Path, Element as SlateElement } from "slate";
import { ReactEditor } from "slate-react";
import type { CustomElementType } from "../../../types/textEditorTypes";

const ElementsToCheck = ['h1', 'h2', 'list-item-text', 'blockquote', "color-bar"];

export const withResetToParagraphOnEnter = (editor: Editor & ReactEditor) => {
    const { insertBreak } = editor;

    editor.insertBreak = () => {
        const { selection } = editor;
        if (!selection || !Range.isCollapsed(selection)) {
            return insertBreak();
        }

        // Reset all active text formatting marks before creating a new paragraph.
        // This clears the editor's current typing state (bold, underline, highlight, etc.)
        // so the next inserted line starts with plain, unformatted text.
        // Note: this does NOT remove marks from existing text — only affects new content.
        editor.marks = {};

        const [match] = Editor.nodes(editor, {
            match: n => SlateElement.isElement(n) && ElementsToCheck.includes(n.type),
            mode: 'lowest',
        });

        if (!match) return insertBreak();

        const [node, path] = match;
        if (!SlateElement.isElement(node)) {
            insertBreak();
            return;
        }
        const type = node.type;
        const isEmpty = Editor.isEmpty(editor, node);

        editor.withoutNormalizing(() => {
            if (['h1', 'h2', 'blockquote'].includes(type)) {
                if (isEmpty) {
                    Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
                } else {
                    const nextPath = Path.next(path);
                    const paragraph: CustomElementType = {
                        type: 'paragraph',
                        children: [{ text: '' }],
                    };
                    Transforms.insertNodes(editor, paragraph, { at: nextPath });
                    Transforms.select(editor, Editor.start(editor, nextPath));
                }
                return;
            }
            if (type === 'color-bar') {
                if (isEmpty) {

                    Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
                    // Remove the 'color' property
                    Transforms.unsetNodes(editor, 'color', { at: path, match: n => SlateElement.isElement(n) && n.type === 'paragraph' });
                } else {

                    const nextPath = Path.next(path);
                    const paragraph: CustomElementType = {
                        type: 'paragraph',
                        children: [{ text: '' }],
                    };
                    Transforms.insertNodes(editor, paragraph, { at: nextPath });
                    Transforms.select(editor, Editor.start(editor, nextPath));
                }
                return;
            }



            insertBreak();
        });
    };

    return editor;
};

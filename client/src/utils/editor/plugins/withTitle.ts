import { Editor, Transforms, Element as SlateElement } from "slate";
import type { ParagraphElementType, TitleElementType } from "../../../types/textEditorTypes";

export const withTitle = (editor: Editor): Editor => {
    const { normalizeNode } = editor;

    editor.normalizeNode = (entry) => {
        const [, path] = entry;

        if (path.length === 0) {
            const children = editor.children;

            if (children.length === 0) {
                const titleNode: TitleElementType = { type: 'title', children: [{ text: '' }] };
                Transforms.insertNodes(editor, titleNode, { at: [0] });
                return;
            }

            const firstNode = children[0] as SlateElement;
            if (firstNode.type !== 'title') {
                const titleNode: TitleElementType = { type: 'title', children: [{ text: '' }] };
                Transforms.insertNodes(editor, titleNode, { at: [0] });
                return;
            }

            for (let i = 1; i < children.length; i++) {
                const child = children[i] as SlateElement;
                if (child.type === 'title') {
                    Transforms.removeNodes(editor, { at: [i] });
                    return;
                }
            }

            if (children.length === 1) {
                const paragraphNode: ParagraphElementType = { type: 'paragraph', children: [{ text: '' }] };
                Transforms.insertNodes(editor, paragraphNode, { at: [1] });
                return;
            }
        }

        normalizeNode(entry);
    };

    return editor;
};

import { Editor, Transforms, Element as SlateElement } from "slate";
import type { ParagraphElementType, TitleElementType } from "../../../types/textEditorTypes";

export const withTitle = (editor: Editor): Editor => {
    const { normalizeNode } = editor;

    editor.normalizeNode = (entry) => {
        const [node, path] = entry;

        // 1. STRICT TITLE CHECK: Catch ANY title that tries to exist anywhere except the very first line
        if (SlateElement.isElement(node) && node.type === 'title') {
            // If it's nested (length > 1) OR it's a top-level node but not the first one (path[0] !== 0)
            if (path.length > 1 || path[0] !== 0) {
                // Check if it was pasted inside a code-block
                const [parent] = Editor.parent(editor, path);
                const isInsideCodeBlock = SlateElement.isElement(parent) && parent.type === 'code-block';

                Transforms.setNodes(
                    editor,
                    // If it's in a code block, turn it into a code-line. Otherwise, a paragraph.
                    { type: isInsideCodeBlock ? 'code-line' : 'paragraph' },
                    { at: path }
                );
                return; // Return immediately after transforming
            }
        }

        // 2. ROOT LEVEL CHECKS (Checking the document structure)
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

            // Prevent multiple titles at the top level
            for (let i = 1; i < children.length; i++) {
                const child = children[i] as SlateElement;
                if (child.type === 'title') {
                    Transforms.setNodes(
                        editor,
                        { type: 'paragraph' },
                        { at: [i] }
                    );
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

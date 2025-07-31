import { Editor, Element as SlateElement, Transforms } from 'slate';

// This removes the link element or any other inline element when it becomes empty; otherwise, an empty link will remain if you add one and then remove it using backspace.
export const withUnwrapEmptyInlines = (editor: Editor) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = entry => {
        const [node, path] = entry;

        // Check for any inline element
        if (
            SlateElement.isElement(node) &&
            Editor.isInline(editor, node) &&
            Editor.isEmpty(editor, node)
        ) {
            Transforms.unwrapNodes(editor, {
                at: path,
                match: n =>
                    SlateElement.isElement(n) &&
                    Editor.isInline(editor, n),
            });
            return;
        }

        normalizeNode(entry);
    };

    return editor;
};

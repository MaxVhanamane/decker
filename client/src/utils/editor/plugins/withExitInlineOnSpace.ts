import { Editor, Transforms, Range, Element as SlateElement, Node } from 'slate';

const INLINE_EXIT_TYPES = ['link'];

const isInlineElement = (node: Node): node is SlateElement => {
    return SlateElement.isElement(node) && INLINE_EXIT_TYPES.includes(node.type);
};

export const withExitInlineOnSpace = (editor: Editor) => {
    const { insertText } = editor;

    editor.insertText = (text: string) => {
        const { selection } = editor;

        if (text === ' ' && selection && Range.isCollapsed(selection)) {
            const inlineEntry = Editor.above(editor, {
                match: (n) => !Editor.isEditor(n) && isInlineElement(n),
                mode: 'lowest',
            });

            if (inlineEntry) {
                const [, path] = inlineEntry;

                // Ensure cursor is at the end of the inline element
                const isAtEnd = Editor.isEnd(editor, selection.focus, path);
                if (isAtEnd) {
                    const after = Editor.after(editor, path);
                    if (after) {
                        Transforms.select(editor, after);
                    }

                    insertText(' ');
                    return;
                }
            }
        }

        insertText(text);
    };

    return editor;
};

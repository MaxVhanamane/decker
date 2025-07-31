import { Editor, Element as SlateElement } from "slate";

export function isInsideCodeBlock(editor: Editor): boolean {
    if (!editor.selection) return false;

    const codeBlockEntry = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && n.type === 'code-block',
    });

    return !!codeBlockEntry;
}

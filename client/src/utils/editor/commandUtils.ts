import { Point } from "slate";
import { Range, Element as SlateElement } from "slate";
import { Editor, Transforms } from "slate";

export function removeSlashCommandText(editor: Editor) {
    const { selection } = editor;
    if (!selection) return;

    const commandText = getTextAfterSlash(editor);
    if (commandText === null) return;

    const startPoint = selection.anchor;
    let current = startPoint;

    while (true) {
        const before = Editor.before(editor, current, { unit: "character" });
        if (!before) return;
        const charRange = Editor.range(editor, before, current);
        const char = Editor.string(editor, charRange);
        if (char === "/") {
            // Found the start of the slash command
            Transforms.delete(editor, {
                at: { anchor: before, focus: startPoint },
            });
            break;
        }
        current = before;
    }
}

export const getTextAfterSlash = (editor: Editor): string | null => {
    const { selection } = editor;
    if (!selection || !Range.isCollapsed(selection)) return null;

    const cursor = selection.anchor;

    let start: Point = cursor;
    let lastSlashPosition: Point | null = null;

    // Get the path of the current block
    const [currentBlock] = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n as SlateElement),

    }) || [];

    while (true) {
        const before = Editor.before(editor, start, { unit: "character" });
        if (!before) break;

        //  stop if we've crossed into a different block
        const [block] = Editor.above(editor, {
            at: before,
            match: (n) => Editor.isBlock(editor, n as SlateElement),
        }) || [];
        if (block && block !== currentBlock) break;

        const charRange = Editor.range(editor, before, start);
        const char = Editor.string(editor, charRange);

        if (char === "/") {
            lastSlashPosition = before;
            break; // only need the nearest slash
        } else if (char === " " || char === "\n") {
            break;
        }

        start = before;
    }

    if (!lastSlashPosition) return null;

    const textAfterSlashStart = Editor.after(editor, lastSlashPosition, { unit: "character" });
    if (!textAfterSlashStart) return "";

    const textRange = Editor.range(editor, textAfterSlashStart, cursor);
    return Editor.string(editor, textRange);
};

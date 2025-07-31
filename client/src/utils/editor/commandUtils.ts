import { Range } from "slate";
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

    // Walk backwards to find the sequence
    let start = cursor;
    let lastSlashPosition = null;
    let slashCount = 0;

    while (true) {
        const before = Editor.before(editor, start, { unit: 'character' });
        if (!before) break;

        const charRange = Editor.range(editor, before, start);
        const char = Editor.string(editor, charRange);

        if (char === "/") {
            slashCount++;
            lastSlashPosition = before;
        } else if (char === " " || char === "\n") {
            break;
        }

        start = before;
    }

    if (slashCount === 0 || !lastSlashPosition) return null;

    // If only one slash was found, return everything after it
    if (slashCount === 1) {
        const textAfterSlashStart = Editor.after(editor, lastSlashPosition, { unit: "character" });
        if (!textAfterSlashStart) return "";

        const textRange = Editor.range(editor, textAfterSlashStart, cursor);
        return Editor.string(editor, textRange);
    }

    // For multiple slashes, skip the first one
    // Find position after the first slash
    const firstSlashPosition = Editor.before(editor, lastSlashPosition, {
        unit: 'character',
        distance: slashCount - 1
    });

    if (!firstSlashPosition) return null;

    const afterFirstSlash = Editor.after(editor, firstSlashPosition, { unit: "character" });
    if (!afterFirstSlash) return "";

    const textRange = Editor.range(editor, afterFirstSlash, cursor);
    return Editor.string(editor, textRange);
}

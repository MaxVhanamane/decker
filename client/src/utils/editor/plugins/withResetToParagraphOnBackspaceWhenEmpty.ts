import {
    Editor,
    Range,
    Transforms,
    Point,
    Element as SlateElement,
    Node,
} from "slate";
import { ReactEditor } from "slate-react";
import { isListType } from "../isListType";

const resettableTypes = ["h1", "h2", "blockquote", "color-bar"];

export const withResetToParagraphOnBackspaceWhenEmpty = (editor: Editor & ReactEditor) => {
    const { deleteBackward } = editor;

    editor.deleteBackward = (unit) => {

        const { selection } = editor;

        if (!selection || !Range.isCollapsed(selection)) {
            return deleteBackward(unit);
        }

        // 1. Handle resettable blocks (h1, blockquote, etc.)
        const [resetMatch] = Editor.nodes(editor, {
            match: (n: Node): n is SlateElement =>
                SlateElement.isElement(n) && resettableTypes.includes(n.type),
        });

        if (resetMatch) {
            const [node, path] = resetMatch;

            if (Editor.isEmpty(editor, node)) {

                const start = Editor.start(editor, path);
                if (Point.equals(selection.anchor, start)) {
                    Transforms.setNodes(
                        editor,
                        { type: "paragraph", color: undefined } as Partial<SlateElement>,
                        { at: path }
                    );

                    return;
                }
            }
        }

        // 2. Handle empty list-item
        const [listItemMatch] = Editor.nodes(editor, {
            match: (n) => SlateElement.isElement(n) && n.type === "list-item",
        });

        if (listItemMatch) {
            const [, path] = listItemMatch;
            const isEmpty = Editor.string(editor, path) === "";

            if (isEmpty) {
                Transforms.setNodes(editor, { type: "paragraph" }, { at: path });

                Transforms.unwrapNodes(editor, {
                    match: (n) => SlateElement.isElement(n) && isListType(n.type),
                    split: true,
                });

                return;
            }
        }

        // Default behavior
        deleteBackward(unit);
    };

    return editor;
};

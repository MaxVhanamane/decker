import {
    Editor,
    Range,
    Transforms,
    Point,
    Element as SlateElement,
    Node,
} from "slate";
import { ReactEditor } from "slate-react";

export const withResetToParagraphOnBackspaceWhenEmpty = (
    editor: Editor & ReactEditor
) => {
    const { deleteBackward } = editor;

    editor.deleteBackward = (unit) => {
        const { selection } = editor;

        if (!selection || !Range.isCollapsed(selection)) {
            return deleteBackward(unit);
        }


        // 1. HANDLE EMPTY CODE-BLOCK

        const [codeBlockMatch] = Editor.nodes(editor, {
            match: (n): n is SlateElement =>
                SlateElement.isElement(n) && n.type === "code-block",
        });

        if (codeBlockMatch) {
            const [node, path] = codeBlockMatch;

            // Cursor at start of code-block?
            const atStart = Point.equals(selection.anchor, Editor.start(editor, path));

            // Is code-block empty?
            const isEmpty =
                node.children.length === 1 &&
                SlateElement.isElement(node.children[0]) &&
                node.children[0].type === "code-line" &&
                Node.string(node.children[0]) === "";

            if (atStart && isEmpty) {
                // Convert code-block → paragraph
                Transforms.setNodes(
                    editor,
                    { type: "paragraph" },
                    { at: path }
                );

                // Remove code-line wrapper
                Transforms.unwrapNodes(editor, {
                    at: path,
                    match: (n) =>
                        SlateElement.isElement(n) &&
                        n.type === "code-line",
                });

                return;
            }
        }


        // 2. RESETTABLE BLOCK TYPES
        // Prezly list plugin will handle empty list
        const resettableTypes = ["heading", "blockquote", "color-bar"];

        const [resetMatch] = Editor.nodes(editor, {
            match: (n): n is SlateElement =>
                SlateElement.isElement(n) && resettableTypes.includes(n.type),
        });

        if (resetMatch) {
            const [node, path] = resetMatch;

            if (Editor.isEmpty(editor, node)) {
                const start = Editor.start(editor, path);

                if (Point.equals(selection.anchor, start)) {
                    Transforms.setNodes(
                        editor,
                        { type: "paragraph" },
                        { at: path }
                    );

                    return;
                }
            }
        }


        // 3. EMPTY LIST ITEM

        // const [listItemMatch] = Editor.nodes(editor, {
        //     match: (n) => SlateElement.isElement(n) && n.type === "list-item",
        // });

        // if (listItemMatch) {
        //     const [, path] = listItemMatch;

        //     const isEmpty = Editor.string(editor, path) === "";

        //     if (isEmpty) {
        //         Transforms.setNodes(editor, { type: "paragraph" }, { at: path });

        //         Transforms.unwrapNodes(editor, {
        //             match: (n) => SlateElement.isElement(n) && isListType(n.type),
        //             split: true,
        //         });

        //         return;
        //     }
        // }

        // Default behavior
        deleteBackward(unit);
    };

    return editor;
};

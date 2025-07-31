import { Element, Node, NodeEntry, Path, Transforms } from "slate";
import { Editor, Element as SlateElement, Range } from "slate";
import type { CodeBlockElementType, CustomElementFormatType, CustomTextKeyType, DividerElement, DividerStyle, ColorBarColors, ListType, ParagraphElementType, HighlightConfig } from "../../types/textEditorTypes";
import { ReactEditor } from "slate-react";
import { isListType } from "./isListType";
import { NodeQueries } from "./nodeQueries";

const CONVERTIBLE_TO_CODE_BLOCK = [
    "paragraph",
    "blockquote",
    "h1",
    "h2",
    "list-item",
    "color-bar"
]

type CustomElement = {
    type: string;
    children: any;
    color?: string;
    dividerStyle?: string;
};


function cleanAndSetNodeProperties(
    editor: Editor,
    newProps: Partial<SlateElement>,
    propertiesToRemove: (keyof CustomElement)[] = ['color', 'dividerStyle']
) {
    const match = (n: Node) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n);

    // Unset unwanted properties
    Transforms.unsetNodes(editor, propertiesToRemove, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
        mode: 'all',
    });

    // Apply new properties
    Transforms.setNodes(editor, newProps, { match });
}




export const CustomEditor = {


    isMarkActive(editor: Editor, format: CustomTextKeyType) {
        const marks = Editor.marks(editor);

        if (!marks) return false;

        if (format === 'highlightConfig') {
            const highlight = marks[format] as HighlightConfig | undefined;
            return !!highlight && !!highlight.color;
        }

        return marks[format] === true;
    }
    ,


    isBlockActive(
        editor: Editor,
        format: CustomElementFormatType,
    ) {
        const { selection } = editor
        if (!selection) return false
        const [match] = Editor.nodes(editor, {
            match: (n) => SlateElement.isElement(n) && n.type === format,
        });

        return !!match
    },



    toggleMark(editor: Editor, format: CustomTextKeyType, highlightConf?: HighlightConfig) {
        const { selection } = editor;

        if (!selection) return;

        const isCollapsed = Range.isCollapsed(selection);
        const isActive = CustomEditor.isMarkActive(editor, format);
        if (!isCollapsed) {
            // Text is selected: Toggle the mark on selection
            if (isActive) {
                if (format === "highlightConfig" && highlightConf?.color === NodeQueries.getActiveHighlightConfig(editor)?.color && highlightConf?.style === NodeQueries.getActiveHighlightConfig(editor)?.style) {
                    Editor.removeMark(editor, format);
                    return
                }
                else if (format === "highlightConfig") {
                    Editor.addMark(editor, format, highlightConf);
                    return
                }
                Editor.removeMark(editor, format);
            } else {
                if (format === "highlightConfig") {
                    Editor.addMark(editor, format, highlightConf);
                } else {
                    Editor.addMark(editor, format, true);
                }
            }
        } else {
            // No selection (collapsed cursor)
            if (isActive) {
                // Cursor is inside bold text  unbold for future input
                if (format === "highlightConfig" && highlightConf?.color === NodeQueries.getActiveHighlightConfig(editor)?.color && highlightConf?.style === NodeQueries.getActiveHighlightConfig(editor)?.style) {
                    Editor.removeMark(editor, format);
                    return
                }
                else if (format === "highlightConfig" && highlightConf?.color !== NodeQueries.getActiveHighlightConfig(editor)?.color || highlightConf?.style !== NodeQueries.getActiveHighlightConfig(editor)?.style) {
                    Editor.addMark(editor, format, highlightConf);

                    return
                }
                Editor.removeMark(editor, format);
            } else {
                // Cursor is in plain text apply bold for future input
                if (format === "highlightConfig") {
                    Editor.addMark(editor, format, highlightConf);
                } else {
                    Editor.addMark(editor, format, true);
                }
            }
        }
    }
    ,

    toggleBlock(editor: Editor, format: CustomElementFormatType,) {
        const isActive = CustomEditor.isBlockActive(editor, format);
        if (format === "code-block") {
            if (isActive) {
                // By default, Slate starts traversal from the user's current selection (cursor). If you want to change this, use the at property.
                const [codeBlockEntry] = Editor.nodes(editor, {
                    match: (n) => !Editor.isEditor(n) && Element.isElement(n) && n.type === "code-block",

                });

                if (codeBlockEntry) {
                    const [blockNode, blockPath] = codeBlockEntry as NodeEntry<CodeBlockElementType>;

                    // Merge all code-line texts
                    const combinedText = blockNode.children
                        .map((line) => Node.string(line))
                        .join("\n");


                    Transforms.removeNodes(editor, {
                        at: blockPath,
                    });

                    // Insert a single paragraph in place of the removed code block
                    Transforms.insertNodes(
                        editor,
                        {
                            type: "paragraph",
                            children: [{ text: combinedText }],
                        },
                        { at: blockPath }
                    );
                    // Move the cursor to the end of the newly inserted paragraph
                    Transforms.select(editor, {
                        path: [...blockPath, 0],
                        offset: combinedText.length,
                    });
                }

                return;
            }

            else {
                Transforms.unwrapNodes(editor, {
                    match: (n) =>
                        !Editor.isEditor(n) && SlateElement.isElement(n) &&
                        (isListType(n.type)),
                    split: true,
                });
                const [match] = Editor.nodes(editor, {
                    match: (n) => !Editor.isEditor(n) && Element.isElement(n) && CONVERTIBLE_TO_CODE_BLOCK.includes(n.type),
                });

                if (!match) return;

                const [paragraphNode, paragraphPath] = match;
                const text = Node.string(paragraphNode);

                const lines = text.split("\n");

                // Replace paragraph with code block and code lines
                const codeBlock: CodeBlockElementType = {
                    type: "code-block",
                    language: "javascript",
                    children: lines.map((line) => ({
                        type: "code-line",
                        children: [{ text: line }],
                    })),
                };

                // Remove original paragraph
                Transforms.removeNodes(editor, { at: paragraphPath });

                // Insert new code block
                Transforms.insertNodes(editor, codeBlock, { at: paragraphPath });
                // Move the cursor to the end of the last code line
                const lastLineIndex = lines.length - 1;
                const endPoint = {
                    path: [...paragraphPath, lastLineIndex, 0], // Path to the last text node
                    offset: lines[lastLineIndex].length,       // End of the last line
                };

                Transforms.select(editor, endPoint);
            }

            return;
        }

        Transforms.unwrapNodes(editor, {
            match: (n) =>
                !Editor.isEditor(n) && SlateElement.isElement(n) &&
                (isListType(n.type) || n.type === "code-block"),
            split: true,
        });

        cleanAndSetNodeProperties(editor, { type: isActive ? "paragraph" : format })


    },


    toggleDivider(
        editor: Editor,
        format: "divider",
        dividerStyle: DividerStyle
    ) {
        const isActive = CustomEditor.isBlockActive(editor, format);
        const node = Editor.above(editor, {
            match: (n) => SlateElement.isElement(n) && n.type === "divider"
        });

        const dividerNode: DividerElement = {
            type: "divider",
            dividerStyle,
            children: [{ text: "" }],
        };

        const paragraphNode: ParagraphElementType = {
            type: "paragraph",
            children: [{ text: "" }],
        };

        if (
            isActive &&
            node &&
            SlateElement.isElement(node[0]) &&
            node[0].type === "divider"
        ) {
            const dividerNode = node[0] as DividerElement;
            if (dividerNode.dividerStyle === dividerStyle) {
                Transforms.removeNodes(editor, {
                    match: n => SlateElement.isElement(n) && n.type === "divider",
                });
                return;
            }
        }


        const { selection } = editor;
        if (!selection) return;
        if (
            node &&
            SlateElement.isElement(node[0]) &&
            node[0].type === "divider"
        ) {
            // Replace existing divider and move cursor after it
            Transforms.setNodes(editor, dividerNode);

            const [, dividerPath] = node;
            const insertParagraphPath = Path.next(dividerPath);

            Transforms.insertNodes(editor, paragraphNode, { at: insertParagraphPath });
            Transforms.select(editor, Editor.start(editor, insertParagraphPath));
            return;
        }


        // Determine last block in selection
        const lastBlockPath =
            selection.focus.path[0] > selection.anchor.path[0]
                ? Path.parent(selection.focus.path)
                : Path.parent(selection.anchor.path);

        const blockEnd = Editor.end(editor, lastBlockPath);
        Transforms.select(editor, blockEnd);

        const enclosingBlockEntry = Editor.above(editor, {
            match: n =>
                SlateElement.isElement(n) &&
                (isListType(n.type) || n.type === "code-block"),
        });

        if (enclosingBlockEntry) {
            const [, listItemPath] = enclosingBlockEntry;
            const insertPath = Path.next(listItemPath);

            Transforms.insertNodes(editor, dividerNode, { at: insertPath });

            const insertParagraphPath = Path.next(insertPath);
            Transforms.insertNodes(editor, paragraphNode, { at: insertParagraphPath });

            Transforms.select(editor, Editor.start(editor, insertParagraphPath));
            return;
        }

        // Default insert: insert divider and paragraph after it
        Transforms.insertNodes(editor, dividerNode);

        const dividerEntry = Editor.above(editor, {
            match: n => SlateElement.isElement(n) && n.type === "divider",
        });

        if (!dividerEntry) return;

        const [, dividerPath] = dividerEntry;
        const insertParagraphPath = Path.next(dividerPath);

        Transforms.insertNodes(editor, paragraphNode, { at: insertParagraphPath });
        Transforms.select(editor, Editor.start(editor, insertParagraphPath));
    }

    ,
    toggleLink(
        editor: Editor,
        format: CustomElementFormatType,
        url?: string,
        title?: string
    ) {
        const { selection } = editor;

        const isActive = CustomEditor.isBlockActive(editor, format);

        if (!url) {
            if (isActive) unwrapLink(editor);
            return;
        }

        // Find the currently selected link node
        const linkEntry = Editor.above(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
        });



        if (linkEntry) {
            const [, path] = linkEntry;

            // If title is provided, replace the text of the link node
            if (title) {
                // Assuming the link node contains a single text node
                const linkTextPath = [...path, 0]; // path to the text node inside the link
                Transforms.insertText(editor, title, { at: linkTextPath });
            }

            // Always update the URL
            Transforms.setNodes(
                editor,
                { url },
                { at: path }
            );
            //For links, there's a small modal that takes focus when opened. After the operation, we return focus to the editor.
            ReactEditor.focus(editor);
            return;
        }


        // If no active link but there's a selection, insert new link
        if (selection && !Range.isCollapsed(selection)) {
            const selectedText = Editor.string(editor, selection);

            const newLink: SlateElement = {
                type: "link",
                url,
                children: [{ text: title || selectedText }],
            };

            Transforms.wrapNodes(editor, newLink, {
                at: selection,
                split: true,
                mode: "lowest",
            });

            // Move cursor to end of link 
            Transforms.collapse(editor, { edge: "end" });


            ReactEditor.focus(editor);
        }
    }
    ,

    toggleColorBar(editor: Editor, color: ColorBarColors, format: "color-bar") {
        if (!editor.selection) return;

        const blockEntry = Editor.above(editor, {
            match: n => SlateElement.isElement(n) && (isListType(n.type) || n.type === 'code-block'),
        });

        if (blockEntry) {

            const [node] = blockEntry;


            if (SlateElement.isElement(node)) {
                // Unwrap list
                if (isListType(node.type)) {
                    Transforms.unwrapNodes(editor, {
                        match: n =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            isListType(n.type),
                        split: true,
                    });
                }

                // Unwrap code blocks
                if (node.type === "code-block") {
                    Transforms.unwrapNodes(editor, {
                        match: n =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            n.type === "code-block",
                        split: true,
                    });
                }

                Transforms.setNodes(
                    editor,
                    { type: format, color: color },
                    { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n) }
                );
            }

        } else {

            const currentNode = Editor.above(editor, {
                match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n),
            });
            const currentColor = currentNode && SlateElement.isElement(currentNode[0]) ? (currentNode[0] as any).color : undefined;

            const colorValue = currentColor === color ? undefined : color
            const typeValue = currentColor === color ? "paragraph" : format

            Transforms.setNodes(
                editor,
                { type: typeValue, color: colorValue },
                { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n) }
            );

        }
    }
    ,

    toggleList(editor: Editor, format: ListType) {
        if (!editor.selection) return;
        const LIST_TYPES: ListType[] = [
            "bulleted-list",
            "numbered-list",
            "alpha-upper-list",
            "alpha-lower-list",
            "roman-upper-list",
            "roman-lower-list",
        ];

        const isListType = (type: string): type is ListType => {
            return (LIST_TYPES as readonly string[]).includes(type);
        };

        const isActive = CustomEditor.isBlockActive(editor, format); // Check if the current list type is already active

        // Unwrap any existing list blocks (bulleted-list or numbered-list) to prevent nesting different list types
        Transforms.unwrapNodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                isListType(n.type),
            split: true,
        });

        // If toggling off the list, change to a regular paragraph
        // If toggling on, set the block type to 'list-item'
        const newProperties: Partial<SlateElement> = {
            type: isActive ? 'paragraph' : 'list-item',
        };
        Transforms.setNodes(editor, newProperties);

        // If toggling *on*, wrap the current selection in the desired list block ('bulleted-list', 'numbered-list')
        if (!isActive) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    }




};

const unwrapLink = (editor: Editor) => {
    Transforms.unwrapNodes(editor, {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    });
};





// anchor – where the selection starts

// focus – where the selection ends

// path - It’s an array representing the position in the Slate document tree.

// [1, 0] means: Go to the second top-level node (1 = index 1), Then into its first child (0 = index 0).

// So it's like navigating the tree: document.children[1].children[0].

// offset
// This tells you how many characters into the node the selection is.

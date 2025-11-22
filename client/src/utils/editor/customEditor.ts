import { Node, NodeEntry, Path, Transforms } from "slate";
import { Editor, Element as SlateElement, Range } from "slate";
import type { CodeBlockElementType, CustomElementFormatType, CustomTextKeyType, DividerElement, DividerStyle, ColorBarColors, ListType, ParagraphElementType, HighlightConfig, IndentLevel, IndentableElementType, CustomElementType, ListElement, CodeLineElement } from "../../types/textEditorTypes";
import { ReactEditor } from "slate-react";
import { isListType, LIST_TYPES } from "./isListType";
import { NodeQueries } from "./nodeQueries";
import { clearDescendantListStyling, markListAsManuallyStyled } from "./plugins/withNormalizeListDepths";
import { ListsEditor } from "@prezly/slate-lists";
import { isIndentable } from "./isIndentable";
import { listsSchema } from "./prezlyList";
// Define non-listable block types
const NON_LISTABLE_TYPES = new Set([
    "title",
    "divider",
    "code-block",
    "code-line",
]);

const NON_COLORABLE_TYPES = new Set([
    "title",
    "divider",
]);

// Helper to decide which blocks can become list items
function isListableElementType(type: string): boolean {
    return !NON_LISTABLE_TYPES.has(type);
}

export function sanitizeElementForTransform(
    node: SlateElement,
    newType: CustomElementFormatType
): Record<string, any> {
    return {
        type: newType,
        children: node.children,
        // explicitly unset unwanted props by setting them to undefined
        color: undefined,
        indentLevel: undefined,
        userStyled: undefined,
        language: undefined,
        dividerStyle: undefined,
    };
}
const CONVERTIBLE_TO_CODE_BLOCK = [
    "paragraph",
    "blockquote",
    "h1",
    "h2",
    "list-item",
    "color-bar",
    "list-item-text",
    ...LIST_TYPES
]


export function cleanAndSetNodeProperties(
    editor: Editor,
    newProps: Partial<SlateElement>
) {
    if (!editor.selection) return;

    const isBlock = (n: Node) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n);

    const cleanupMap: Partial<Record<CustomElementType["type"], string[]>> = {
        paragraph: ["indentLevel"],
        blockquote: ["indentLevel"],
        h1: ["indentLevel"],
        h2: ["indentLevel"],
        "code-line": ["indentLevel"],
        "color-bar": ["color", "indentLevel"],
        "code-block": ["language"],
        link: ["url"],
        divider: ["dividerStyle"],
        title: [],
        "list-item": [],
        "list-item-text": [],
    };

    const listCleanup = ["userStyled", "locked", "indentLevel"];
    for (const t of LIST_TYPES) cleanupMap[t] = listCleanup;

    // collect top-level block entries inside selection
    const entries = Array.from(
        Editor.nodes(editor, {
            at: editor.selection,
            match: (n): n is SlateElement => SlateElement.isElement(n) && Editor.isBlock(editor, n),
            mode: "highest",
        })
    );

    if (entries.length === 0) return;

    const targetType = (newProps as any).type as CustomElementType["type"] | undefined;

    for (const [node, path] of entries) {
        if (!SlateElement.isElement(node)) continue;

        const toRemove = cleanupMap[node.type as keyof typeof cleanupMap] ?? [];

        // avoid unsetting props when node is already the target type
        if (targetType && node.type === targetType) continue;

        if (toRemove.length > 0) {
            Transforms.unsetNodes(editor, toRemove as any, { at: path });
        }
    }

    // apply new props to all block nodes in selection using the isBlock guard
    Transforms.setNodes(editor, newProps, {
        at: editor.selection,
        match: isBlock,
        mode: "highest",
    });
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

    toggleBlock(editor: Editor, format: CustomElementFormatType) {
        if (!editor.selection) return;

        const isActive = CustomEditor.isBlockActive(editor, format);
        const { selection } = editor;

        // Handle list items separately (except for code blocks)
        const listItemEntries = Array.from(
            Editor.nodes(editor, {
                at: selection,
                match: (n) => SlateElement.isElement(n) && n.type === "list-item",
            })
        );

        if (listItemEntries.length > 0 && format !== "code-block") {
            unwrapListWithFormat(editor, format);
        }

        // Handle code block toggle
        if (format === "code-block") {
            const isInsideSingleCodeBlock = isSelectionInsideSingleBlock(editor, "code-block");
            if (isInsideSingleCodeBlock) {
                const [codeBlockEntry] = Editor.nodes(editor, {
                    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "code-block",
                });

                if (codeBlockEntry) {
                    const [blockNode, blockPath] = codeBlockEntry as NodeEntry<CodeBlockElementType>;

                    // Get text of each line
                    let lines = blockNode.children.map((line) => Node.string(line));

                    // Remove all empty lines at the end
                    while (lines.length && lines[lines.length - 1].trim() === "") {
                        lines.pop();
                    }

                    const combinedText = lines.join("\n");

                    // Remove the code block
                    Transforms.removeNodes(editor, { at: blockPath });

                    // Insert as a paragraph
                    Transforms.insertNodes(
                        editor,
                        {
                            type: "paragraph",
                            children: [{ text: combinedText }],
                        },
                        { at: blockPath }
                    );

                    // Move cursor to the end of the inserted paragraph
                    Transforms.select(editor, {
                        path: [...blockPath, 0],
                        offset: combinedText.length,
                    });
                }


            } else {

                //  get *all* convertible blocks in selection
                // Helper: recursively extract text lines from lists or nodes
                function extractListTextLines(node: Node): string[] {
                    // Base case: if it's a text node
                    if (!SlateElement.isElement(node)) {
                        const text = Node.string(node).trim();
                        return text ? [text] : [];
                    }

                    // Handle list elements (bulleted-list, numbered-list, etc.)
                    if (node.type && node.type.endsWith('list')) {
                        let lines: string[] = [];
                        for (const child of node.children) {
                            lines.push(...extractListTextLines(child));
                        }
                        return lines;
                    }

                    // Handle individual list items
                    if (node.type === 'list-item') {
                        // Each list item may have text and/or nested list children
                        const lines: string[] = [];

                        for (const child of node.children) {
                            if (SlateElement.isElement(child) && child.type === 'list-item-text') {
                                const text = Node.string(child).trim();
                                if (text) lines.push(text);
                            } else if (SlateElement.isElement(child) && child.type && child.type.endsWith('list')) {
                                // Nested list — recurse
                                lines.push(...extractListTextLines(child));
                            }
                        }

                        return lines;
                    }

                    // Fallback: for non-list elements, split by newlines if any
                    const text = Node.string(node).trim();
                    return text ? text.split('\n') : [];
                }

                const matches = Array.from(
                    Editor.nodes(editor, {
                        at: selection,
                        match: (n) =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            CONVERTIBLE_TO_CODE_BLOCK.includes(n.type),
                    })
                );

                if (matches.length === 0) return;

                // 2. Sort matches by path order (top to bottom)
                matches.sort((a, b) => Path.compare(a[1], b[1]));

                // 3. Group consecutive convertible nodes (split when non-convertible in between)
                const groups: [NodeEntry<Node>[], Path][] = [];
                let currentGroup: NodeEntry<Node>[] = [];
                let lastPath: Path | null = null;

                for (const match of matches) {
                    const [, path] = match;

                    const isConsecutive =
                        lastPath &&
                        Path.isSibling(path, lastPath) &&
                        Path.equals(Path.next(lastPath), path);

                    if (!lastPath || isConsecutive) {
                        currentGroup.push(match);
                    } else {
                        groups.push([currentGroup, currentGroup[0][1]]);
                        currentGroup = [match];
                    }

                    lastPath = path;
                }

                if (currentGroup.length > 0) {
                    groups.push([currentGroup, currentGroup[0][1]]);
                }

                // 4. Process each group in reverse (so we can safely remove/insert)
                for (const [groupNodes, firstPath] of groups.reverse()) {
                    let allLines: string[] = [];

                    for (const [node] of groupNodes) {
                        allLines.push(...extractListTextLines(node));
                    }

                    if (allLines.length === 0) allLines = [""];

                    const codeBlock: CodeBlockElementType = {
                        type: "code-block",
                        language: "javascript",
                        children: allLines.map((line) => ({
                            type: "code-line",
                            children: [{ text: line }],
                        })),
                    };

                    // Remove old nodes (reverse order so paths stay valid)
                    for (const [, path] of groupNodes.slice().reverse()) {
                        Transforms.removeNodes(editor, { at: path });
                    }

                    // Insert new combined code block
                    Transforms.insertNodes(editor, codeBlock, { at: firstPath });
                }

                // 5. Move cursor to end of last inserted block
                const lastGroup = groups[groups.length - 1];
                if (lastGroup) {
                    const [, firstPath] = lastGroup;
                    const endPoint = Editor.end(editor, firstPath);
                    Transforms.select(editor, endPoint);
                }


            }
            return
        }

        // Apply final cleanup
        cleanAndSetNodeProperties(editor, { type: isActive ? "paragraph" : format });
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
            // Ensure selection and currentPath exist
            if (editor.selection && editor.selection.anchor.path) {
                // Get the path of the divider node (parent level, e.g., [2])
                const currentPath = editor.selection.anchor.path.slice(0, -1); // Remove last index to get parent ([2,0] → [2])
                const nextPath = Path.next(currentPath); // [2] → [3]

                // Check if a next node exists
                if (Editor.hasPath(editor, nextPath)) {
                    // Move cursor to the start of the next node
                    Transforms.select(editor, Editor.start(editor, nextPath));
                } else {
                    // If no next node exists, insert a new paragraph and move cursor there
                    Transforms.insertNodes(
                        editor,
                        {
                            type: 'paragraph',
                            children: [{ text: '' }],
                        },
                        { at: nextPath }
                    );
                    Transforms.select(editor, Editor.start(editor, nextPath));
                }
            }
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

        const isInsideSingleCodeBlock = isSelectionInsideSingleBlock(editor, "code-block");
        const isInsideSingleListBlock = isSelectionInsideSingleBlock(editor, "list-item");


        if (isInsideSingleCodeBlock || isInsideSingleListBlock) {

            const blockEntry = Editor.above(editor, {
                match: n => SlateElement.isElement(n) && (isListType(n.type) || n.type === 'code-block'),
            });
            if (!blockEntry) return

            const [node] = blockEntry;


            if (SlateElement.isElement(node)) {
                Editor.withoutNormalizing(editor, () => {
                    if (isListType(node.type)) {
                        unwrapListWithFormat(editor, format, color);
                        return;
                    }

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
                        { type: format, color },
                        { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n) }
                    );
                });

            }

        } else {

            if (!editor.selection) return;

            Editor.withoutNormalizing(editor, () => {
                // 1) If there are lists in the selection, unwrap them using Prezely method
                const hasList = Editor.nodes(editor, {
                    match: n => SlateElement.isElement(n) && isListType(n.type) && !NON_COLORABLE_TYPES.has(n.type),
                }).next().done === false;

                if (hasList) {
                    ListsEditor.unwrapList(editor)
                }

                // 2) Unwrap code-blocks in selection (ignore non-colorable types)
                Transforms.unwrapNodes(editor, {
                    match: n =>
                        SlateElement.isElement(n) &&
                        n.type === "code-block" &&
                        !NON_COLORABLE_TYPES.has(n.type),
                    split: true,
                });

                // 3) Now grab all block nodes in the (possibly changed) selection, excluding NON_COLORABLE_TYPES
                const selectedBlocks = Array.from(
                    Editor.nodes(editor, {
                        match: n =>
                            SlateElement.isElement(n) &&
                            Editor.isBlock(editor, n) &&
                            !NON_COLORABLE_TYPES.has(n.type),

                    })
                )

                if (selectedBlocks.length === 0) return;

                // 4) For each selected block, apply per-node toggle:
                //    - if node.type === format && node.color === color => set paragraph (remove color)
                //    - else => set type=format and color=color
                for (const [node, path] of selectedBlocks) {
                    const nodeAny = node as any;
                    const nodeType = nodeAny.type;
                    const nodeColor = nodeAny.color;

                    if (nodeType === format && nodeColor === color) {
                        // convert back to paragraph (remove color)
                        Transforms.setNodes(
                            editor,
                            { type: "paragraph", color: undefined } as Partial<SlateElement>,
                            { at: path }
                        );
                    } else {
                        // change to the requested color-bar
                        Transforms.setNodes(
                            editor,
                            { type: format, color },
                            { at: path }
                        );
                    }
                }
            });
        }
    }
    ,

    toggleList(editor: Editor, format: ListType) {
        if (!editor.selection) return;

        const { selection } = editor;
        // Find all list-item entries in the selection
        const listItemEntries = Array.from(
            Editor.nodes(editor, {
                at: selection,
                match: (n) => SlateElement.isElement(n) && n.type === "list-item",
            })
        );

        if (listItemEntries.length !== 0) {


            const changeListType = (listPath: Path, newType: ListType) => {
                Transforms.setNodes(editor, { type: newType }, { at: listPath });
            };


            // FIND THE LIST THAT CONTAINS THE SELECTION

            const getListContainingSelection = (): { path: Path; node: ListElement } | null => {
                const { anchor } = selection;
                for (let i = anchor.path.length - 1; i >= 0; i--) {
                    const path = anchor.path.slice(0, i);
                    try {
                        const [node] = Editor.node(editor, path);
                        if (SlateElement.isElement(node) && listsSchema.isListNode(node)) {
                            return { path, node: node as ListElement };
                        }
                    } catch {
                        continue;
                    }
                }
                return null;
            };

            const targetList = getListContainingSelection();
            if (!targetList) return;

            const { path: listPath, node: listNode } = targetList;
            const currentType = listNode.type as ListType;
            const wasUserStyled = listNode.userStyled === true;

            Editor.withoutNormalizing(editor, () => {
                if (currentType === format) {
                    ListsEditor.unwrapList(editor)
                } else {
                    changeListType(listPath, format);
                }

                if (!wasUserStyled) {
                    clearDescendantListStyling(editor, listPath);
                }

                markListAsManuallyStyled(editor, listPath);
            });
        } else {
            // Not in a list - convert current block to list
            const { selection } = editor;
            if (!selection) return;

            // Only cursor inside one block 
            if (Range.isCollapsed(selection)) {
                const [match] = Editor.nodes(editor, {
                    match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
                    mode: "lowest",
                });
                if (!match) return;

                const [node, path] = match;
                if (!SlateElement.isElement(node)) return;
                if (!isListableElementType(node.type)) return;

                Editor.withoutNormalizing(editor, () => {
                    const sanitized = sanitizeElementForTransform(node, "list-item");
                    Transforms.setNodes(editor, sanitized, { at: path });
                    // Wrap in new list type
                    const listNode: ListElement = { type: format, children: [] };
                    Transforms.wrapNodes(editor, listNode, { at: path });
                });

                return;
            }

            //  Extended selection 
            const selectedBlocks = Array.from(
                Editor.nodes(editor, {
                    match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
                    mode: "highest",
                })
            ) as NodeEntry<SlateElement>[];

            if (selectedBlocks.length === 0) return;

            // Split selection into consecutive listable groups
            const groups: Path[][] = [];
            let currentGroup: Path[] = [];

            for (const [node, path] of selectedBlocks) {
                if (SlateElement.isElement(node) && isListableElementType(node.type)) {
                    currentGroup.push(path);
                } else {
                    if (currentGroup.length > 0) {
                        groups.push(currentGroup);
                        currentGroup = [];
                    }
                }
            }
            if (currentGroup.length > 0) groups.push(currentGroup);

            if (groups.length === 0) return;

            Editor.withoutNormalizing(editor, () => {
                for (let i = groups.length - 1; i >= 0; i--) {
                    const group = groups[i];
                    if (group.length === 0) continue;

                    const firstPath = group[0];
                    const lastPath = group[group.length - 1];
                    const range = Editor.range(editor, firstPath, lastPath);

                    //  convert existing lists in selection to the new type 
                    const listMatches = Array.from(
                        Editor.nodes(editor, {
                            at: range,
                            match: n => SlateElement.isElement(n) && n.type.endsWith("-list"),
                        })
                    ) as NodeEntry<ListElement>[];

                    for (const [, path] of listMatches) {
                        Transforms.setNodes(editor, { type: format }, { at: path });
                    }

                    // Convert all other blocks to list-item
                    for (const path of group) {
                        const [node] = Editor.node(editor, path);
                        if (!SlateElement.isElement(node)) continue;

                        const sanitized = sanitizeElementForTransform(node, "list-item");
                        Transforms.setNodes(editor, sanitized, { at: path });
                    }

                    // Wrap any blocks that are not already inside a list
                    const nonListPaths = group.filter(path => {
                        const [node] = Editor.node(editor, path);
                        return !SlateElement.isElement(node) || !node.type.endsWith("-list");
                    });
                    if (nonListPaths.length > 0) {
                        const wrapRange = Editor.range(editor, nonListPaths[0], nonListPaths[nonListPaths.length - 1]);
                        const newListNode: ListElement = { type: format, children: [] };
                        Transforms.wrapNodes(editor, newListNode, { at: wrapRange });
                    }
                }
            });

        }
    },


    indentBlock(editor: Editor) {
        const { selection } = editor;
        if (!selection) return;

        const isCollapsed = Range.isCollapsed(selection);

        // Special case: Collapsed cursor inside code block → insert 4 spaces
        if (isCollapsed) {
            const [codeBlockEntry] = Editor.nodes<CodeBlockElementType>(editor, {
                match: (n) => SlateElement.isElement(n) && n.type === 'code-block',
            });

            if (codeBlockEntry) {
                editor.insertText('    ');
                return;
            }
        }

        // Get other block-level elements in selection (excluding list items)
        const blockEntries = Array.from(
            Editor.nodes<CustomElementType>(editor, {
                at: selection,
                match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n) && !listsSchema.isListItemNode(n),
                mode: 'lowest',
            })
        );
        // Separate non-list elements by type
        const codeBlocks: NodeEntry<CodeLineElement>[] = [];
        const otherIndentables: NodeEntry<IndentableElementType>[] = [];

        for (const [block, path] of blockEntries) {
            if (SlateElement.isElement(block)) {
                if (block.type === 'code-line') {
                    codeBlocks.push([block as CodeLineElement, path]);
                } else if (isIndentable(block) && !isListType(block.type)) {
                    const parentList = ListsEditor.getParentList(editor, path);
                    if (!parentList) {
                        otherIndentables.push([block as IndentableElementType, path]);
                    }
                }
            }
        }

        // Handle code blocks
        for (const [block, path] of codeBlocks) {
            const currentIndent = (block.indentLevel || 0) as IndentLevel;
            if (currentIndent < 5) {
                Transforms.setNodes<IndentableElementType>(
                    editor,
                    { indentLevel: (currentIndent + 1) as IndentLevel },
                    { at: path }
                );
            }
        }

        // Handle other indentable elements
        for (const [block, path] of otherIndentables) {
            const currentIndent = (block.indentLevel || 0) as IndentLevel;
            if (currentIndent < 5) {
                Transforms.setNodes<IndentableElementType>(
                    editor,
                    { indentLevel: (currentIndent + 1) as IndentLevel },
                    { at: path }
                );
            }
        }

        // Get all list items in selection (using 'lowest' to avoid over-selecting)
        const listItems = Array.from(
            Editor.nodes<SlateElement>(editor, {
                at: selection,
                match: (n) => SlateElement.isElement(n) && listsSchema.isListItemNode(n),
                mode: 'lowest',
            })
        );


        // Handle lists
        if (listItems.length > 0) {
            if (listItems.length === 1) {
                // Single list item selected → use Prezly's increaseDepth
                ListsEditor.increaseDepth(editor);
            } else {
                // Multiple list items selected → indent the highest fully selected list
                const listItemPaths = listItems.map(([, path]) => path);
                let commonPath = listItemPaths.reduce((acc, curr) => Path.common(acc, curr));

                let currentPath = commonPath.slice();
                let containingList: NodeEntry<SlateElement> | null = null;

                // Walk up to find the first list node
                while (currentPath.length > 0) {
                    const node = Node.get(editor, currentPath) as SlateElement;
                    if (SlateElement.isElement(node) && listsSchema.isListNode(node)) {
                        containingList = [node, currentPath];
                        break;
                    }
                    currentPath = Path.parent(currentPath);
                }

                // Climb up to the highest list that is fully selected
                if (containingList) {
                    let [listNode, listPath] = containingList;
                    while (listPath.length > 0) {
                        const parentPath = Path.parent(listPath);
                        const parentNode = Node.get(editor, parentPath) as SlateElement;

                        if (!SlateElement.isElement(parentNode) || !listsSchema.isListItemNode(parentNode)) break;

                        const grandPath = Path.parent(parentPath);
                        const grandNode = Node.get(editor, grandPath) as SlateElement;

                        if (!SlateElement.isElement(grandNode) || !listsSchema.isListNode(grandNode)) break;

                        const grandStart = Editor.start(editor, grandPath);
                        const grandEnd = Editor.end(editor, grandPath);

                        if (!Range.includes(selection, grandStart) || !Range.includes(selection, grandEnd)) break;

                        containingList = [grandNode, grandPath];
                        listNode = grandNode;
                        listPath = grandPath;
                    }

                    // Indent the identified list
                    if (containingList) {
                        const currentIndent = ((listNode as ListElement).indentLevel || 0) as IndentLevel;
                        if (currentIndent < 5) {
                            Transforms.setNodes<IndentableElementType>(
                                editor,
                                { indentLevel: (currentIndent + 1) as IndentLevel },
                                { at: listPath }
                            );
                        }
                    }
                }
            }
        }


    },

    /**
 * Outdent the selected content.
 * Works for code-blocks, lists (single / multiple / nested) and other indentable blocks.
 */
    outdentBlock(editor: Editor) {
        const { selection } = editor;
        if (!selection) return;

        const isCollapsed = Range.isCollapsed(selection);

        // Special case: Collapsed cursor inside code block → do nothing
        if (isCollapsed) {
            const [codeBlockEntry] = Editor.nodes<CodeBlockElementType>(editor, {
                match: (n) => SlateElement.isElement(n) && n.type === 'code-block',
            });

            if (codeBlockEntry) {
                return;
            }
        }

        // Get other block-level elements in selection (excluding list items)
        const blockEntries = Array.from(
            Editor.nodes<CustomElementType>(editor, {
                at: selection,
                match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n) && !listsSchema.isListItemNode(n),
                mode: 'lowest',
            })
        );

        // Separate non-list elements by type
        const codeBlocks: NodeEntry<CodeLineElement>[] = [];
        const otherIndentables: NodeEntry<IndentableElementType>[] = [];

        for (const [block, path] of blockEntries) {
            if (SlateElement.isElement(block)) {
                if (block.type === 'code-line') {
                    codeBlocks.push([block as CodeLineElement, path]);
                } else if (isIndentable(block) && !isListType(block.type)) {
                    const parentList = ListsEditor.getParentList(editor, path);
                    if (!parentList) {
                        otherIndentables.push([block as IndentableElementType, path]);
                    }
                }
            }
        }

        // Handle code blocks
        for (const [block, path] of codeBlocks) {
            const currentIndent = (block.indentLevel || 0) as IndentLevel;
            if (currentIndent > 0) {
                Transforms.setNodes<IndentableElementType>(
                    editor,
                    { indentLevel: (currentIndent - 1) as IndentLevel },
                    { at: path }
                );
            }
        }

        // Handle other indentable elements
        for (const [block, path] of otherIndentables) {
            const currentIndent = (block.indentLevel || 0) as IndentLevel;
            if (currentIndent > 0) {
                Transforms.setNodes<IndentableElementType>(
                    editor,
                    { indentLevel: (currentIndent - 1) as IndentLevel },
                    { at: path }
                );
            }
        }

        // Get all list items in selection (using 'lowest' to avoid over-selecting)
        const listItems = Array.from(
            Editor.nodes<SlateElement>(editor, {
                at: selection,
                match: (n) => SlateElement.isElement(n) && listsSchema.isListItemNode(n),
                mode: 'lowest',
            })
        );

        // Handle lists
        if (listItems.length > 0) {
            if (listItems.length === 1) {
                // Single list item selected → use Prezly's decreaseDepth
                ListsEditor.decreaseDepth(editor);

            } else {
                // Multiple list items selected → outdent the highest fully selected list
                const listItemPaths = listItems.map(([, path]) => path);
                let commonPath = listItemPaths.reduce((acc, curr) => Path.common(acc, curr));

                let currentPath = commonPath.slice();
                let containingList: NodeEntry<SlateElement> | null = null;

                // Walk up to find the first list node
                while (currentPath.length > 0) {
                    const node = Node.get(editor, currentPath) as SlateElement;
                    if (SlateElement.isElement(node) && listsSchema.isListNode(node)) {
                        containingList = [node, currentPath];
                        break;
                    }
                    currentPath = Path.parent(currentPath);
                }

                // Climb up to the highest list that is fully selected
                if (containingList) {
                    let [listNode, listPath] = containingList;
                    while (listPath.length > 0) {
                        const parentPath = Path.parent(listPath);
                        const parentNode = Node.get(editor, parentPath) as SlateElement;

                        if (!SlateElement.isElement(parentNode) || !listsSchema.isListItemNode(parentNode)) break;

                        const grandPath = Path.parent(parentPath);
                        const grandNode = Node.get(editor, grandPath) as SlateElement;

                        if (!SlateElement.isElement(grandNode) || !listsSchema.isListNode(grandNode)) break;

                        const grandStart = Editor.start(editor, grandPath);
                        const grandEnd = Editor.end(editor, grandPath);

                        if (!Range.includes(selection, grandStart) || !Range.includes(selection, grandEnd)) break;

                        containingList = [grandNode, grandPath];
                        listNode = grandNode;
                        listPath = grandPath;
                    }

                    // Outdent the identified list
                    if (containingList) {
                        const currentIndent = ((listNode as ListElement).indentLevel || 0) as IndentLevel;
                        if (currentIndent > 0) {
                            Transforms.setNodes<IndentableElementType>(
                                editor,
                                { indentLevel: (currentIndent - 1) as IndentLevel },
                                { at: listPath }
                            );
                        }
                    }
                }
            }
        }


    },


};

const unwrapLink = (editor: Editor) => {
    Transforms.unwrapNodes(editor, {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    });
};



export const createCustomCreateNode = (format: CustomElementFormatType, options?: { color?: ColorBarColors }) => {
    return (props: Partial<CustomElementType> = {}): CustomElementType => {
        if (format === "code-block") {
            // Special handling for code blocks
            return {
                type: "code-block",
                language: "javascript", // or "plaintext", "typescript", etc.
                children: [
                    {
                        type: "code-line",
                        children: [{ text: "" }],
                    },
                ],
                ...props,
            } as CustomElementType;
        }
        if (format === "color-bar") {
            return {
                type: "color-bar",
                color: options?.color ?? "neutral",
                children: [
                    {
                        type: "code-line",
                        children: [{ text: "" }],
                    },
                ],
                ...props,
            } as CustomElementType;
        }

        // Default block handling (paragraph, h1, h2, blockquote, etc.)
        return {
            type: format,
            children: [{ text: "" }],
            ...props,
        } as CustomElementType;
    };
};


const unwrapListWithFormat = (
    editor: Editor,
    format: CustomElementFormatType = "color-bar",
    color?: ColorBarColors
) => {
    const customCreateNode = createCustomCreateNode(format, { color });

    const original = listsSchema.createDefaultTextNode;
    listsSchema.createDefaultTextNode = customCreateNode as typeof listsSchema.createDefaultTextNode;

    try {
        ListsEditor.unwrapList(editor);
    } finally {
        //  restore the original factory function
        listsSchema.createDefaultTextNode = original;
    }
};

export const isSelectionInsideSingleBlock = (
    editor: Editor,
    type: CustomElementFormatType
): boolean => {
    const { selection } = editor;
    if (!selection) return false;

    // Find the block element of the given type at the anchor
    const anchorBlockEntry = Editor.above(editor, {
        at: selection.anchor,
        match: (n) => SlateElement.isElement(n) && n.type === type,
    });

    if (!anchorBlockEntry) return false;

    const [, blockPath] = anchorBlockEntry;

    // Check if both ends of the selection are descendants of this block
    const isAnchorInside = Path.isAncestor(blockPath, selection.anchor.path);
    const isFocusInside = Path.isAncestor(blockPath, selection.focus.path);

    return isAnchorInside && isFocusInside;
};

// anchor – where the selection starts

// focus – where the selection ends

// path - It’s an array representing the position in the Slate document tree.

// [1, 0] means: Go to the second top-level node (1 = index 1), Then into its first child (0 = index 0).

// So it's like navigating the tree: document.children[1].children[0].

// offset
// This tells you how many characters into the node the selection is.

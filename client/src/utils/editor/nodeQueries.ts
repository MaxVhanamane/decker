import { NodeEntry } from "slate";
import { Editor, Element as SlateElement } from "slate";
import { isListType } from "./isListType";
import type { ColorBarElement, DividerElement, HighlightConfig, ListType } from "../../types/textEditorTypes";
import { Path } from "slate";


export const NodeQueries = {
    getListParentTypeIfInListItem(editor: Editor): ListType | null {
        const matchEntry = Editor.nodes(editor, {
            match: (n) => SlateElement.isElement(n) && n.type === "list-item",
            mode: "lowest",
        }).next().value as NodeEntry<SlateElement> | undefined;

        if (!matchEntry) return null;

        const [, listItemPath] = matchEntry;
        // Traverse up from list-item to its parent
        const [parentNode] = Editor.parent(editor, listItemPath);

        if (SlateElement.isElement(parentNode) &&
            isListType(parentNode.type)) {
            return parentNode.type;
        }
        else {
            return null
        }

    }


    ,
    getActiveColorOnSelectedNode(editor: Editor) {
        const { selection } = editor;

        if (!selection) return null;

        // Get the nearest ancestor node that matches 'color-bar'
        const [match] = Editor.nodes(editor, {
            at: selection,
            match: (n): n is SlateElement =>
                SlateElement.isElement(n) && n.type === 'color-bar',
        });

        if (match) {
            const [node] = match as [ColorBarElement, Path];
            return node.color; // This is your custom color value
        }

        return null;
    },

    getActiveDividerOnSelectedNode(editor: Editor) {
        const { selection } = editor;

        if (!selection) return null;

        // Get the nearest ancestor node that matches 'divider'
        const [match] = Editor.nodes(editor, {
            at: selection,
            match: (n): n is SlateElement =>
                SlateElement.isElement(n) && n.type === 'divider',
        });

        if (match) {
            const [node] = match as [DividerElement, Path];
            return node.dividerStyle;
        }

        return null;
    },
    isInRestrictedBlockExceptSelf(editor: Editor, format: string): boolean {
        if (!editor.selection) return false;

        const [node] = Editor.above(editor, {
            match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
            mode: "lowest",
        }) ?? [];

        if (!SlateElement.isElement(node)) return false;

        const restrictedTypes = new Set(["title", "divider"]);

        return restrictedTypes.has(node.type as string) && node.type !== format;
    },
    isInsideDivider(editor: Editor): boolean {
        if (!editor.selection) return false;

        const [node] = Editor.above(editor, {
            match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
            mode: "lowest",
        }) ?? [];

        if (!SlateElement.isElement(node)) return false;


        return node.type === "divider"
    },
    getActiveHighlightConfig(editor: Editor): HighlightConfig | null {
        const { selection } = editor;

        // Return null if there is no selection
        if (!selection) return null;

        // Get the marks applied to the selection
        const marks = Editor.marks(editor);

        // If there's no marks or no highlight mark, return null
        if (!marks || !marks['highlightConfig']) return null;

        // Return the highlightConfig if the mark exists
        return marks['highlightConfig'] as HighlightConfig;
    }
}

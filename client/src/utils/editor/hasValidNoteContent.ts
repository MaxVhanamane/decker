import { Descendant, Text, Element } from "slate";

export function hasValidNoteContent(nodes: Descendant[]): boolean {
    if (!Array.isArray(nodes) || nodes.length === 0) return false;

    //  Check title node (first node)
    const titleNode = nodes[0];
    if (isElement(titleNode)) {
        if (titleNode.children.some(child => Text.isText(child) && child.text.trim().length > 0)) {
            return true; // Title has non-whitespace text
        }
    }

    // Check remaining nodes recursively
    function hasText(node: Descendant): boolean {
        if (Text.isText(node)) {
            return node.text.trim().length > 0;
        }
        if (isElement(node)) {
            return node.children.some(hasText);
        }
        return false;
    }

    for (let i = 1; i < nodes.length; i++) {
        if (hasText(nodes[i])) {
            return true;
        }
    }

    // If no text found anywhere
    return false;
}

// Helper type guard for elements
function isElement(node: Descendant): node is Element {
    return 'children' in node;
}

// You can use Node.string to convert it into a string, but since we only need the first 200 characters, it would unnecessarily process all the nodes. So, I created a custom function that is faster, and I’ve tested it.
// const getNotePreview = (note: Descendant[], maxChars = 200): string => {
//   if (!Array.isArray(note) || note.length < 2) return "";

import { Descendant, Node, Text } from "slate";

//   const contentNodes = note.slice(1);

//   const fakeRoot = {
//     type: "paragraph",
//     children: contentNodes,
//   } as unknown as Node;

//   const fullText = Node.string(fakeRoot);
//   return fullText.slice(0, maxChars);
// };

export const getNotePreview = (note: Descendant[]) => {
    if (!note || note.length < 2) return "";
    const contentNodes = note.slice(1); // skip title
    return getNodePreview(contentNodes, 200);
};

const getNodePreview = (nodes: Node[], maxChars = 200): string => {
    let preview = "";
    let charCount = 0;
    let stop = false;

    const extractPreviewText = (node: Node) => {
        if (stop) return;

        if (Text.isText(node)) {
            const remaining = maxChars - charCount;
            if (remaining <= 0) {
                stop = true;
                return;
            }

            const piece = node.text.slice(0, remaining);
            preview += piece;
            charCount += piece.length;

            if (charCount >= maxChars) stop = true;
        } else if ("children" in node && Array.isArray(node.children)) {
            for (const child of node.children) {
                extractPreviewText(child);
                if (stop) break;
            }
        }
    };

    for (const node of nodes) {
        extractPreviewText(node);
        if (stop) break;
    }

    return preview;
};

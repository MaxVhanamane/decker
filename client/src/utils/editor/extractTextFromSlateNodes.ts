import { Descendant } from "slate";

/**
 * Extracts text from Slate Descendant[] with natural spacing.
 * Stops once maxChars is reached.
 */
export const extractTextFromSlateNodes = (
    nodes: Descendant[],
    maxChars: number = 200
): string => {
    let result = '';
    let currentLength = 0;
    let done = false;

    const walk = (nodeList: Descendant[]) => {
        for (const node of nodeList) {
            if (done) break;

            if ('text' in node) {
                const remaining = maxChars - currentLength;
                if (remaining <= 0) {
                    done = true;
                    break;
                }

                const textChunk = node.text.slice(0, remaining);
                result += textChunk;
                currentLength += textChunk.length;
            }

            if ('children' in node && Array.isArray(node.children)) {
                walk(node.children);
            }

            // Add space between top-level nodes to mimic original `.join(' ')`
            if (!done) result += ' ';

            if (currentLength >= maxChars) {
                done = true;
                break;
            }
        }
    };

    // Skip the first node (index 0) as it is title
    walk(nodes.slice(1));
    return result.trim().replace(/\s+/g, ' ');
};

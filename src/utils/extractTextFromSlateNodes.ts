export const extractTextFromSlateNodes = (nodes: any): string => {
    if (!nodes || !Array.isArray(nodes)) return '';

    return nodes.map((node: any) => {
        let text = '';

        if (typeof node.text === 'string') {
            text += node.text;
        }

        if (Array.isArray(node.children)) {
            text += extractTextFromSlateNodes(node.children);
        }

        return text;
    }).join(' ').replace(/\s+/g, ' ').trim(); // Normalize spaces
};

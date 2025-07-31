import { Editor } from "slate";

const inlineTypes = new Set(["link"]);

export const withInlineElements = (editor: Editor) => {
    const { isInline } = editor;

    editor.isInline = (element) => {
        return inlineTypes.has(element.type) || isInline(element);
    };

    return editor;
};


// In slateJs all elements default to being "block" elements. They each appear separated by vertical space, and they never run into each other.

// But in certain cases, like for links, you might want to make them "inline" flowing elements instead. That way they live at the same level as text nodes, and flow.

import { CustomElementType, IndentableElementType, IndentableElementTypeStrings } from "../../types/textEditorTypes";

const indentableElements: IndentableElementTypeStrings[] = ['paragraph', 'h1', 'h2', 'blockquote', "color-bar", "code-line", "bulleted-list", "numbered-list", "alpha-upper-list", "alpha-lower-list", "roman-upper-list", "roman-lower-list", "circle-list", "square-list", "hollow-square-list", "dash-list", "star-list", "arrow-list"
]

export const isIndentable = (element: CustomElementType): element is IndentableElementType => {
    return indentableElements.includes(element.type as IndentableElementTypeStrings);
};

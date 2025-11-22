import { ListsSchema, ListType as PrezlyListType } from "@prezly/slate-lists";
import { Node, Element } from "slate";
import { ListElement, ListItemElement, ListItemTextElementType, ListType as MyListType, ParagraphElementType } from "../../types/textEditorTypes";

// Map your string-based list types to Prezly enum where needed
export const MY_TO_PREZLY: Record<MyListType, PrezlyListType> = {
    "bulleted-list": PrezlyListType.UNORDERED,
    "circle-list": PrezlyListType.UNORDERED,
    "square-list": PrezlyListType.UNORDERED,
    "hollow-square-list": PrezlyListType.UNORDERED,
    "dash-list": PrezlyListType.UNORDERED,
    "star-list": PrezlyListType.UNORDERED,
    "arrow-list": PrezlyListType.UNORDERED,
    "numbered-list": PrezlyListType.ORDERED,
    "alpha-upper-list": PrezlyListType.ORDERED,
    "alpha-lower-list": PrezlyListType.ORDERED,
    "roman-upper-list": PrezlyListType.ORDERED,
    "roman-lower-list": PrezlyListType.ORDERED,
};

export const listsSchema: ListsSchema = {
    isConvertibleToListTextNode(node: Node) {
        return Element.isElement(node) && node.type === "paragraph";
    },

    isDefaultTextNode(node: Node) {
        return Element.isElement(node) && node.type === "paragraph";
    },

    isListNode(node: Node, type?: PrezlyListType) {
        if (!Element.isElement(node)) return false;
        if (type) return MY_TO_PREZLY[node.type as MyListType] === type;
        return Object.values(MY_TO_PREZLY).includes(MY_TO_PREZLY[node.type as MyListType]);
    },

    isListItemNode(node: Node) {
        return Element.isElement(node) && node.type === "list-item";
    },

    isListItemTextNode(node: Node) {
        return Element.isElement(node) && node.type === "list-item-text";
    },

    createDefaultTextNode(props: Partial<ParagraphElementType> = {}): ParagraphElementType {
        return { type: "paragraph", children: [{ text: "" }], ...props };
    },

    createListNode(type: PrezlyListType = PrezlyListType.UNORDERED, props: Partial<ListElement> = {}): ListElement {

        const myType = type === PrezlyListType.UNORDERED ? "bulleted-list" : "numbered-list";
        return { type: myType, children: [], ...props };
    }
    ,
    createListItemNode(props: Partial<ListItemElement> = {}): ListItemElement {
        return { type: "list-item", children: [], ...props };
    }
    ,
    createListItemTextNode(props: Partial<ListItemTextElementType> = {}): ListItemTextElementType {
        return { type: "list-item-text", children: [{ text: "" }], ...props };
    },
};



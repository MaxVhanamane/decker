import type { ListType } from "../../types/textEditorTypes";

export const LIST_TYPES: ListType[] = [
    "bulleted-list",
    "circle-list",
    "square-list",
    "hollow-square-list",
    "dash-list",
    "star-list",
    "arrow-list",
    "numbered-list",
    "alpha-upper-list",
    "alpha-lower-list",
    "roman-upper-list",
    "roman-lower-list",
];

export const isListType = (type: any): type is ListType => {
    return LIST_TYPES.includes(type as ListType);
};


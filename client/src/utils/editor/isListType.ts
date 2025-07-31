import type { ListType } from "../../types/textEditorTypes";

const LIST_TYPES: ListType[] = [
    "bulleted-list",
    "numbered-list",
    "alpha-upper-list",
    "alpha-lower-list",
    "roman-upper-list",
    "roman-lower-list",
];


export const isListType = (type: any): type is ListType => {
    return LIST_TYPES.includes(type as ListType);
};

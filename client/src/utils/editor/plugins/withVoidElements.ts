import { Editor } from "slate";
const voidTypes = ['divider'];

export const withVoidElements = (editor: Editor): Editor => {
    const { isVoid } = editor;

    editor.isVoid = (element) => {
        return voidTypes.includes(element.type as string) ? true : isVoid(element);
    };

    return editor;
};

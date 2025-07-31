import { Editor, Transforms, Range, Path, Element as SlateElement } from "slate";
import { ReactEditor } from "slate-react";
import type { CustomElementType } from "../../../types/textEditorTypes";
import { isListType } from "../isListType";

const ElementsToCheck = ['h1', 'h2', 'list-item', 'blockquote', "color-bar"];

export const withResetToParagraphOnEnter = (editor: Editor & ReactEditor) => {
    const { insertBreak } = editor;

    editor.insertBreak = () => {
        const { selection } = editor;
        if (!selection || !Range.isCollapsed(selection)) {
            return insertBreak();
        }

        editor.removeMark('bold');
        editor.removeMark('underline');
        editor.removeMark('highlight');

        const [match] = Editor.nodes(editor, {
            match: n => SlateElement.isElement(n) && ElementsToCheck.includes(n.type),
            mode: 'lowest',
        });

        if (!match) return insertBreak();

        const [node, path] = match;
        if (!SlateElement.isElement(node)) {
            insertBreak();
            return;
        }
        const type = node.type;
        const isEmpty = Editor.isEmpty(editor, node);

        editor.withoutNormalizing(() => {
            if (['h1', 'h2', 'blockquote'].includes(type)) {
                if (isEmpty) {
                    Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
                } else {
                    const nextPath = Path.next(path);
                    const paragraph: CustomElementType = {
                        type: 'paragraph',
                        children: [{ text: '' }],
                    };
                    Transforms.insertNodes(editor, paragraph, { at: nextPath });
                    Transforms.select(editor, Editor.start(editor, nextPath));
                }
                return;
            }
            if (type === 'color-bar') {
                if (isEmpty) {

                    Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
                    // Remove the 'color' property
                    Transforms.unsetNodes(editor, 'color', { at: path, match: n => SlateElement.isElement(n) && n.type === 'paragraph' });
                } else {

                    const nextPath = Path.next(path);
                    const paragraph: CustomElementType = {
                        type: 'paragraph',
                        children: [{ text: '' }],
                    };
                    Transforms.insertNodes(editor, paragraph, { at: nextPath });
                    Transforms.select(editor, Editor.start(editor, nextPath));
                }
                return;
            }

            if (type === 'list-item' && isEmpty) {
                const listPath = Path.parent(path);
                const [listNode] = Editor.node(editor, listPath);

                const paragraph: CustomElementType = {
                    type: 'paragraph',
                    children: [{ text: '' }],
                };

                if (
                    SlateElement.isElement(listNode) &&
                    isListType(listNode.type) &&
                    listNode.children.length === 1
                ) {
                    Transforms.removeNodes(editor, { at: listPath });
                    Transforms.insertNodes(editor, paragraph, { at: listPath });
                    Transforms.select(editor, Editor.start(editor, listPath));
                } else {
                    const afterListPath = Path.next(listPath);
                    Transforms.insertNodes(editor, paragraph, { at: afterListPath });
                    Transforms.select(editor, Editor.start(editor, afterListPath));
                    Transforms.removeNodes(editor, { at: path });
                }
                return;
            }

            insertBreak();
        });
    };

    return editor;
};

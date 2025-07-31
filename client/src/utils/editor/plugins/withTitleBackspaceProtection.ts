import { Editor } from "slate";

export const withTitleBackspaceProtection = (editor: Editor) => {
    const { deleteBackward } = editor

    editor.deleteBackward = (...args) => {
        const { selection } = editor

        // Check if we're at the title element (first element)
        if (selection) {

            const [start] = Editor.edges(editor, selection)
            const isAtTitle = Editor.isStart(editor, start, [0])

            // If we're at the title and trying to delete, prevent it
            if (isAtTitle) {

                return
            }
        }

        // Otherwise, proceed with normal deletion
        deleteBackward(...args)
    }

    return editor
};

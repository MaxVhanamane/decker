import { useCallback } from 'react'
import { initialValue } from '../../components/card/CardInput';
import { Editor, Transforms } from 'slate';

const useResetEditor = (editor: Editor) => {
    const resetEditor = useCallback(() => {
        // Directly replace the children
        editor.children = initialValue;

        // Normalize to ensure consistent state
        Editor.normalize(editor, { force: true });

        // Trigger onChange to update the state
        editor.onChange();

        // Set selection to start
        Transforms.select(editor, Editor.start(editor, []));
    }, [editor]);

    return { resetEditor }
}

export default useResetEditor

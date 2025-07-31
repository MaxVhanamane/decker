import { Editor, Transforms, Text, Range } from 'slate'

const withClearEmptyMarks = (editor: Editor) => {
  const { deleteBackward } = editor

  editor.deleteBackward = (unit) => {
    const { selection } = editor

    if (selection && Range.isCollapsed(selection)) {
      try {
        const [node, path] = Editor.node(editor, selection)

        if (Text.isText(node) && node.text.length === 1) {
          const markKeys = Object.keys(node).filter(key => key !== 'text')

          if (markKeys.length > 0) {
            deleteBackward(unit)

            // Clean up marks after deletion
            const newProperties: Record<string, any> = { text: '' }
            markKeys.forEach(key => {
              newProperties[key] = undefined
            })

            Transforms.setNodes(editor, newProperties, { at: path })
            return
          }
        }
      } catch (error) {
        deleteBackward(unit)
        return
      }
    }

    deleteBackward(unit)
  }

  return editor
}

export { withClearEmptyMarks }

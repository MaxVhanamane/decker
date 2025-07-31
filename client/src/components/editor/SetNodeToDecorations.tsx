import { useSlate } from "slate-react";
import { EditorWithDecorations } from "./RichTextEditor";
import type { CodeBlockElementType } from "../../types/textEditorTypes";
import { Editor, Element as SlateElement } from "slate";
import { getChildNodeToDecorations } from "../../utils/editor/getChildNodeToDecorations";
import { memo } from "react";

export const SetNodeToDecorations = memo(() => {
  const editor = useSlate() as EditorWithDecorations;

  const blockEntries = Array.from(
    Editor.nodes<CodeBlockElementType>(editor, {
      at: [],
      mode: "highest",
      match: (n) => SlateElement.isElement(n) && n.type === "code-block",
    })
  );

  const nodeToDecorations = mergeMaps(
    ...blockEntries.map(getChildNodeToDecorations)
  );

  editor.nodeToDecorations = nodeToDecorations;

  return null;
});

export const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
  const map = new Map<K, V>();

  for (const m of maps) {
    for (const item of m) {
      map.set(...item);
    }
  }

  return map;
};

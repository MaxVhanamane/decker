// import { Editor, Node, Element as SlateElement, Transforms } from "slate";
// import { ReactEditor, useSlateStatic } from "slate-react";
// import { CustomElementType } from "../../types/textEditorTypes";

// const handleClickOutside = (e: MouseEvent) => {
//     const editor = useSlateStatic()
//     const domRange = window.getSelection()?.getRangeAt(0);
//     if (!domRange) return;

//     const lastNodeEntry = Editor.last(editor, []);
//     if (!lastNodeEntry) return;

//     const [lastNode, lastPath] = lastNodeEntry;

//     const isEmptyVisually = (node: Node): boolean => {
//         // Ensure node is an Element, not the Editor or a Text node
//         if (!SlateElement.isElement(node)) return true;

//         // Now it's safe to check if it's a block
//         if (!Editor.isBlock(editor, node)) return true;

//         const text = Node.string(node).trim();
//         if (text !== "") return false;

//         if (
//             node.type === "code-block" ||
//             node.type === "list-item" ||
//             node.type === "divider" ||
//             node.type === "color-bar"
//         ) {
//             return false; // These render visibly even if string is empty
//         }

//         return true;
//     };


//     const isLastEmpty = isEmptyVisually(lastNode);

//     const domNode = ReactEditor.toDOMNode(editor, lastNode);
//     const rect = domNode.getBoundingClientRect();

//     const isClickBelow = e.clientY > rect.bottom + 5; // allow some buffer

//     if (!isLastEmpty && isClickBelow && SlateElement.isElement(lastNode) && lastNode.type !== "paragraph") {
//         const newParagraph: CustomElementType = {
//             type: "paragraph",
//             children: [{ text: "" }],
//         };

//         const insertPath = [editor.children.length];

//         Transforms.insertNodes(editor, newParagraph, {
//             at: insertPath,
//         });

//         const point = Editor.start(editor, insertPath);
//         Transforms.select(editor, {
//             anchor: point,
//             focus: point,
//         });

//         ReactEditor.focus(editor);
//     }
// };

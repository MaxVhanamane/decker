// import { useCallback, useState } from "react";
// import {
//   createEditor,
//   Editor,
//   Transforms,
//   Element,
//   Descendant,
//   BaseEditor,
// } from "slate";
// import { Slate, Editable, withReact, ReactEditor } from "slate-react";

// // Define the type for custom elements
// type ParagraphElement = { type: "paragraph"; children: Descendant[] };
// type CodeElementType = { type: "code"; children: Descendant[] };
// type CustomElement = ParagraphElement | CodeElementType;
// type CustomText = { text: string; bold?: boolean };

// // Extend Slate types to include custom elements
// // declare module "slate" {
// //   interface CustomTypes {
// //     Editor: BaseEditor & ReactEditor;
// //     Element: CustomElement;
// //     Text: CustomText;
// //   }
// // }

// // Initial content
// const initialValue: Descendant[] = [
//   {
//     type: "paragraph",
//     children: [{ text: "A line of text in a paragraph." }],
//   },
// ];

// // Define our custom helpers
// const CustomEditor = {
//   isBoldMarkActive(editor: Editor) {
//     const marks = Editor.marks(editor);
//     return marks ? marks.bold === true : false;
//   },

//   isCodeBlockActive(editor: Editor) {
//     const [match] = Editor.nodes(editor, {
//       match: (n) => Element.isElement(n) && n.type === "code", // Fixed TypeScript issue
//     });

//     return !!match;
//   },

//   toggleBoldMark(editor: Editor) {
//     const isActive = CustomEditor.isBoldMarkActive(editor);
//     if (isActive) {
//       Editor.removeMark(editor, "bold");
//     } else {
//       Editor.addMark(editor, "bold", true);
//     }
//   },

//   toggleCodeBlock(editor: Editor) {
//     const isActive = CustomEditor.isCodeBlockActive(editor);
//     Transforms.setNodes(
//       editor,
//       { type: isActive ? "paragraph" : "code" },
//       {
//         match: (n) => Element.isElement(n) && Editor.isBlock(editor, n), // Fixed TypeScript issue
//       }
//     );
//   },
// };

// const EditorComp: React.FC = () => {
//   const [editor] = useState(() => withReact(createEditor()));

//   const renderElement = useCallback(
//     ({ attributes, children, element }: ElementProps) => {
//       switch (element.type) {
//         case "code":
//           return (
//             <CodeElement attributes={attributes} element={element}>
//               {children}
//             </CodeElement>
//           );
//         default:
//           return (
//             <ParagraphElement attributes={attributes} element={element}>
//               {children}
//             </ParagraphElement>
//           );
//       }
//     },
//     []
//   );

//   const renderLeaf = useCallback(
//     ({ attributes, children, leaf }: LeafProps) => {
//       return (
//         <span
//           {...attributes}
//           style={{ fontWeight: leaf.bold ? "bold" : "normal" }}
//         >
//           {children}
//         </span>
//       );
//     },
//     []
//   );

//   return (
//     <Slate
//       editor={editor}
//       initialValue={initialValue}
//       onChange={(value) => {
//         const isAstChange = editor.operations.some(
//           (op) => op.type !== "set_selection"
//         );
//         if (isAstChange) {
//           localStorage.setItem("content", JSON.stringify(value));
//         }
//       }}
//     >
//       <div>
//         <button
//           onMouseDown={(event) => {
//             event.preventDefault();
//             CustomEditor.toggleBoldMark(editor);
//           }}
//         >
//           Bold
//         </button>
//         <button
//           onMouseDown={(event) => {
//             event.preventDefault();
//             CustomEditor.toggleCodeBlock(editor);
//           }}
//         >
//           Code Block
//         </button>
//       </div>
//       <Editable
//         renderLeaf={renderLeaf}
//         renderElement={renderElement}
//         onKeyDown={(event) => {
//           if (!event.ctrlKey) return;

//           switch (event.key) {
//             case "`": {
//               event.preventDefault();
//               const [match] = Editor.nodes(editor, {
//                 match: (n) => Element.isElement(n) && n.type === "code", // Fixed TypeScript issue
//               });
//               Transforms.setNodes(
//                 editor,
//                 { type: match ? "paragraph" : "code" },
//                 {
//                   match: (n) =>
//                     Element.isElement(n) && Editor.isBlock(editor, n), // Fixed TypeScript issue
//                 }
//               );
//               break;
//             }
//             case "b": {
//               event.preventDefault();
//               Editor.addMark(editor, "bold", true);
//               break;
//             }
//           }
//         }}
//       />
//     </Slate>
//   );
// };

// export default EditorComp;

// // Define the props for the elements
// interface ElementProps {
//   attributes: any;
//   children: React.ReactNode;
//   element: CustomElement;
// }

// // Define a React component renderer for code blocks
// const CodeElement: React.FC<ElementProps> = ({ attributes, children }) => (
//   <pre {...attributes}>
//     <code>{children}</code>
//   </pre>
// );

// // Define a React component renderer for default elements
// const ParagraphElement: React.FC<ElementProps> = ({ attributes, children }) => (
//   <p {...attributes}>{children}</p>
// );

// // Define props for leaf rendering
// interface LeafProps {
//   attributes: any;
//   children: React.ReactNode;
//   leaf: CustomText;
// }

// // Define a React component to render leaves with bold text
// const Leaf: React.FC<LeafProps> = ({ attributes, children, leaf }) => (
//   <span {...attributes} style={{ fontWeight: leaf.bold ? "bold" : "normal" }}>
//     {children}
//   </span>
// );

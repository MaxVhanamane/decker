// import { useEffect, useRef } from "react";
// import { useEditorActions } from "../../../hooks/editor/useEditorActions";
// import { MarkButtons } from "../../card/toolbar/MarkButtons";
// import { ReactEditor, useSlateStatic } from "slate-react";
// import { Range } from "slate";

// const HoveringToolbar = ({
//   isFormatDropdownOpen,
//   markButtons,
//   isAnyDropdownOpen,
// }) => {
//   const hoveringToolbarRef = useRef<HTMLDivElement | null>(null);
//   const editor = useSlateStatic();

//   useEffect(() => {
//     const { selection } = editor;
//     const toolbarEl = hoveringToolbarRef.current;

//     if (!toolbarEl || !selection || !Range.isExpanded(selection)) {
//       toolbarEl && (toolbarEl.style.display = "none");
//       return;
//     }

//     try {
//       // Use Slate's ReactEditor to get the DOM range
//       const domRange = ReactEditor.toDOMRange(editor, selection);
//       const selectionRect = domRange.getBoundingClientRect();
//       // Get the portal container
//       const portalContainer = document.getElementById(
//         "hoveringToolbarPortalContainer"
//       );
//       if (!portalContainer) {
//         toolbarEl.style.display = "none";
//         return;
//       }

//       const portalRect = portalContainer.getBoundingClientRect();
//       // Show toolbar to get dimensions
//       toolbarEl.style.display = "block";
//       const toolbarRect = toolbarEl.getBoundingClientRect();

//       // Calculate position relative to portal
//       const left =
//         selectionRect.left -
//         portalRect.left +
//         selectionRect.width / 2 -
//         toolbarRect.width / 2;
//       const top = selectionRect.top - portalRect.top - toolbarRect.height - 10;

//       toolbarEl.style.top = `${top}px`;
//       toolbarEl.style.left = `${left}px`;
//     } catch (error) {
//       console.warn("Error positioning hovering toolbar:", error);
//       toolbarEl && (toolbarEl.style.display = "none");
//     }
//   }, [editor.selection, editor]);

//   return (
//     <div
//       ref={hoveringToolbarRef}
//       className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 absolute"
//       style={{ display: "none" }}
//     >
//       <MarkButtons
//         isFormatDropdownOpen={isFormatDropdownOpen}
//         markButtons={markButtons}
//         isAnyDropdownOpen={isAnyDropdownOpen}
//       />
//     </div>
//   );
// };

// export default HoveringToolbar;

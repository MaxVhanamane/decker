import { memo, useCallback } from "react";
import { Transforms, Path, Editor } from "slate";
import {
  ReactEditor,
  RenderElementProps,
  useSlateStatic,
  useSlateSelector,
} from "slate-react";
import type {
  CodeBlockElementType,
  CodeLineElement,
} from "../../../../types/textEditorTypes";
import { CodeLanguageDropdown } from "../../dropdowns/CodeLanguageDropdown";
import CopyCode from "../../../card/CopyCode";

const CodeBlockElement = memo(
  ({ attributes, children, element }: RenderElementProps) => {
    const editor = useSlateStatic();

    const setLanguage = (language: string) => {
      const path = ReactEditor.findPath(editor, element);
      Transforms.setNodes(editor, { language }, { at: path });
    };

    const code = element.children as CodeLineElement[];

    const isActiveSelector = useCallback(
      (editor: Editor) => {
        const { selection } = editor;
        if (!selection) return false;

        const path = ReactEditor.findPath(editor, element);
        const { anchor, focus } = selection;

        return (
          Path.isAncestor(path, anchor.path) &&
          Path.isAncestor(path, focus.path)
        );
      },
      [element]
    );

    const isActive = useSlateSelector(isActiveSelector, (a, b) => a === b);

    return (
      <div
        {...attributes}
        className="relative group font-mono text-sm leading-5 !my-6 dark:bg-[#09101F] bg-gray-100 rounded-md !p-6 !py-11 min-h-[5rem] w-full"
      >
        <CopyCode code={code} variant="editor" />
        <CodeLanguageDropdown
          value={(element as CodeBlockElementType).language}
          onChange={setLanguage}
        />
        {children}
        <div
          contentEditable={false}
          className={`absolute bottom-1 right-3 text-xs dark:text-slate-500 text-gray-400 transition-opacity duration-200 pointer-events-none select-none ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        >
          Press Shift + Enter or click below to exit
        </div>
      </div>
    );
  }
);

export default memo(CodeBlockElement);

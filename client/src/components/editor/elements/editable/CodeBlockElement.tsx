import { memo } from "react";
import { Transforms } from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import type { CodeBlockElementType } from "../../../../types/textEditorTypes";
import { CodeLanguageDropdown } from "../../dropdowns/CodeLanguageDropdown";
import CopyCode from "../../../card/CopyCode";

const CodeBlockElement = memo(
  ({ attributes, children, element }: RenderElementProps) => {
    const editor = useSlateStatic();
    const setLanguage = (language: string) => {
      const path = ReactEditor.findPath(editor, element);
      Transforms.setNodes(editor, { language }, { at: path });
    };
    const code = element.children as CodeBlockElementType[];

    return (
      <div
        {...attributes}
        className="relative font-mono text-sm leading-5 !my-6 dark:bg-[#09101F] bg-gray-100 rounded-md !p-6 !py-11 min-h-[5rem] w-full"
      >
        <CopyCode code={code} variant="editor" />
        <CodeLanguageDropdown
          value={(element as CodeBlockElementType).language}
          onChange={(language) => setLanguage(language)}
        />
        {children}
      </div>
    );
  }
);

export default memo(CodeBlockElement);

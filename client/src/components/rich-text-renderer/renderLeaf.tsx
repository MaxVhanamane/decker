import { CustomTextType } from "../../types/textEditorTypes";
import { HighlightView } from "../editor/leaf/readonly/HighlightView";

export const renderLeaf = (leaf: CustomTextType) => {
  let content = <>{leaf.text}</>;
  if (leaf.bold) {
    content = (
      <strong className="font-bold dark:text-gray-50 text-gray-900">
        {content}
      </strong>
    );
  }

  if (leaf.italic) {
    content = <em>{content}</em>;
  }

  if (leaf.underline) {
    content = (
      <u className="underline dark:decoration-slate-50 decoration-gray-600">
        {content}
      </u>
    );
  }
  if (leaf.strikethrough) {
    content = (
      <del className="line-through decoration-gray-700 dark:decoration-gray-100">
        {content}
      </del>
    );
  }

  if (leaf.highlightConfig) {
    content = (
      <HighlightView
        styledText={content}
        highlightConfig={leaf.highlightConfig}
        leaf={leaf}
      />
    );
  }

  return content;
};

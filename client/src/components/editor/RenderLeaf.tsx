import { memo } from "react";
import { RenderLeafProps } from "slate-react";
import { Highlight } from "./leaf/editable/Highlight";

export const RenderLeaf = memo((props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;

  let styledText = <span {...attributes}>{children}</span>;

  if (leaf.bold) {
    styledText = (
      <strong
        {...attributes}
        className="font-bold dark:text-gray-50 text-gray-900"
      >
        {styledText}
      </strong>
    );
  }
  if (leaf.highlightConfig) {
    styledText = <Highlight {...props} styledText={styledText} />;
  }
  if (leaf.italic) {
    styledText = <i {...attributes}>{styledText}</i>;
  }

  if (leaf.underline) {
    styledText = (
      <u
        {...attributes}
        className="underline dark:decoration-slate-50 decoration-gray-600"
      >
        {styledText}
      </u>
    );
  }

  if (leaf.token) {
    const { attributes, children, leaf } = props;
    const { text: _, ...rest } = leaf;

    return (
      <span {...attributes} className={Object.keys(rest).join(" ")}>
        {children}
      </span>
    );
  }

  if (leaf.isSlashCommand) {
    const suggestion = "Type a command...";
    const remainingText = leaf.text === "/" ? suggestion : "";

    styledText = (
      <span
        {...attributes}
        className="inline-flex bg-gray-200 dark:bg-slate-700 rounded px-1 text-gray-700 dark:text-gray-200"
        data-slash-command="true"
        data-command-text={leaf.text}
      >
        <span>{children}</span>
        {remainingText && (
          <span
            contentEditable={false}
            className="opacity-50 select-none cursor-text"
          >
            {remainingText}
          </span>
        )}
      </span>
    );
  }

  return styledText;
});

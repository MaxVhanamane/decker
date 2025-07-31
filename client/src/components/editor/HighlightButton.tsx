import { useSlateStatic } from "slate-react";
import Button from "../Button";
import { Range } from "slate";
import { useEditorActions } from "../../hooks/editor/useEditorActions";
import { NodeQueries } from "../../utils/editor/nodeQueries";
import { Dispatch, SetStateAction } from "react";
type Props = {
  toggleDropdown: Dispatch<SetStateAction<boolean>>;
};
const StopOrRemoveHighlightButton = ({ toggleDropdown }: Props) => {
  const editor = useSlateStatic();
  const { selection } = editor;
  const isCollapsed = selection ? Range.isCollapsed(selection) : false;
  const { handleHighlight } = useEditorActions();
  const activeHighlightConfig = NodeQueries.getActiveHighlightConfig(editor)!;
  return (
    <Button
      onClick={() => {
        handleHighlight(activeHighlightConfig);
        toggleDropdown(false);
      }}
      variant="unstyled"
      className="text-gray-800 dark:text-gray-300 hover:bg-gray-200 border dark:border-slate-700 border-gray-400 dark:hover:bg-slate-700 dark:shadow transition-all shadow-md duration-300 rounded-md p-1 px-2"
    >
      {isCollapsed ? "Exit Highlight Mode" : "Remove Highlighting"}
    </Button>
  );
};

export default StopOrRemoveHighlightButton;

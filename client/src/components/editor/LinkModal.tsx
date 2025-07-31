import {
  ChangeEvent,
  Dispatch,
  memo,
  SetStateAction,
  useRef,
  useState,
} from "react";
import Button from "../Button";
import { CustomEditor } from "../../utils/editor/customEditor";
import { useSlateStatic } from "slate-react";
import { useClickOutside } from "../../hooks/utility/useClickOutside";

type LinkModalProps = {
  setShowHyperlinkModal: Dispatch<SetStateAction<boolean>>;
};

const LinkModal = ({ setShowHyperlinkModal }: LinkModalProps) => {
  const [url, setUrl] = useState("");
  const linkModalRef = useRef<HTMLDivElement>(null);
  const handleHyperlink = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  const editor = useSlateStatic();
  useClickOutside(linkModalRef, true, () => setShowHyperlinkModal(false));
  return (
    <div
      ref={linkModalRef}
      className=" backdrop-blur-sm backdrop-blur-fallback  flex-col  w-full h-full absolute top-0 left-0 z-30  flex items-center gap-4 justify-center rounded-md border-2 border-gray-500 animate-[opacity_0.2s_ease]"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-[90%] max-w-md space-y-4 border border-gray-500 animate-fadeIn transition-all">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white text-center">
          Add a Link
        </h2>

        <input
          name="url"
          onChange={handleHyperlink}
          placeholder="https://example.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 dark:focus:ring-gray-500 focus:ring-gray-200 transition duration-200"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="unstyled"
            onClick={() => {
              setShowHyperlinkModal(false);
              if (url) CustomEditor.toggleLink(editor, "link", url);
            }}
            className="rounded-md px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white transition"
          >
            Add Link
          </Button>
          <Button
            variant="unstyled"
            onClick={() => {
              setShowHyperlinkModal(false);
              setUrl("");
            }}
            className="rounded-md px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white transition duration-200"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(LinkModal);

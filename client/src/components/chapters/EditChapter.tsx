import { useEffect, useRef, useState } from "react";
import useEditChapter from "../../hooks/react-query/useEditChapter";
import { useStableParams } from "../../context/stableParamsContext";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";
import Button from "../Button";
import { twMerge } from "tailwind-merge";

type EditChapterProps = {
  showEditChapterModal: boolean;
  handleCloseEditChapterModal: () => void;
  currentChapterName: string;
  startClosingModalAnimation: boolean;
};
const TRANSITION_DURATION = 200;
export default function EditChapter({
  handleCloseEditChapterModal,
  currentChapterName,
  startClosingModalAnimation,
  showEditChapterModal,
}: EditChapterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [chapterName, setChapterName] = useState(currentChapterName);
  const { deckId, chapterId } = useStableParams();
  const { mutate: editChapter } = useEditChapter();
  const editChapterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeModal = (callback?: () => void) => {
    setIsVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback?.();
      handleCloseEditChapterModal();
    }, TRANSITION_DURATION);
  };

  const handleSave = () => {
    // TODO: when you are not inside a chapter chapterId is undefined so this will fail
    closeModal(() =>
      editChapter({ chapterId, deckId, newChapterName: chapterName }),
    );
  };

  const handleCancel = () => {
    closeModal();
  };

  useFocusTrap(editChapterRef, "both", {
    onEscape: handleCancel,
  });

  useEffect(() => {
    if (showEditChapterModal && !startClosingModalAnimation) {
      requestAnimationFrame(() => setIsVisible(true));
    } else if (showEditChapterModal && startClosingModalAnimation) {
      handleCancel();
    }
  }, [startClosingModalAnimation, showEditChapterModal]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.selectionStart = el.selectionEnd = el.value.length;
    }
  }, []);

  return (
    <div
      className={twMerge(
        "fixed inset-0 backdrop-blur-xl flex items-center justify-center p-4 z-[100] transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        ref={editChapterRef}
        className="
          relative w-full max-w-md rounded-xl shadow-2xl transform transition-all
          bg-white dark:bg-slate-800
        "
      >
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Chapter Name
          </h2>
          <p className="text-sm mt-1 text-gray-600 dark:text-slate-400">
            Choose a name that reflects the content
          </p>
        </div>

        <div className="px-6 pb-6">
          <textarea
            ref={textareaRef}
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            rows={3}
            className="
              w-full px-4 py-3 rounded-lg border resize-none outline-none
               focus:border-slate-400 dark:focus:border-slate-500
  focus:ring-1 focus:ring-slate-400 dark:ring-slate-500
              transition-all duration-200
              bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500
              dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400
            "
            placeholder="Enter chapter name..."
          />

          <p className="text-xs mt-2 text-right text-gray-500 dark:text-slate-400">
            {chapterName.length}{" "}
            {chapterName.length === 1 ? "character" : "characters"}
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <Button
            variant="unstyled"
            onClick={handleCancel}
            className="
              px-4 py-2 rounded-lg font-medium transition-colors
              text-gray-700 hover:bg-gray-100
              dark:text-slate-300 dark:hover:bg-slate-700
            "
          >
            Cancel
          </Button>
          <Button
            variant="unstyled"
            onClick={handleSave}
            className="
              px-6 py-2 bg-blue-600 text-white rounded-lg font-medium 
              hover:bg-blue-700 transition-colors 
              
            "
          >
            Save Changes
          </Button>
        </div>

        <Button
          variant="unstyled"
          onClick={handleCancel}
          className="
            absolute top-4 right-4 p-1 rounded-lg transition-colors
            text-gray-400 hover:text-gray-600 hover:bg-gray-100
            dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700
          "
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}

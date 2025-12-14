import { useRef, useState } from "react";
import Button from "../Button";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";
import useCreateChapter from "../../hooks/react-query/useCreateChapter";
import { v4 as uuidv4 } from "uuid";
import { useStableParams } from "../../context/stableParamsContext";

type CreateChapterModalProps = {
  startClosingModalAnimation: boolean;
  handleCloseChapterModal: () => void;
  handleAnimateCloseChapterModal: () => void;
  maxOrder: number;
};

const CreateChapterModal = ({
  startClosingModalAnimation,
  handleCloseChapterModal,
  handleAnimateCloseChapterModal,
  maxOrder,
}: CreateChapterModalProps) => {
  const { deckId } = useStableParams();
  const [chapterName, setChapterName] = useState("");
  const chapterModalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(chapterModalRef, "both", {
    onEscape: handleAnimateCloseChapterModal,
    initialFocusIndex: 0,
  });
  const { mutate: createChapter } = useCreateChapter();

  const handleCreateChapter = () => {
    createChapter({ chapterId: uuidv4(), chapterName, deckId, maxOrder });
    handleCloseChapterModal();
  };
  return (
    <div
      ref={chapterModalRef}
      onAnimationEnd={() => {
        if (startClosingModalAnimation) {
          handleCloseChapterModal();
        }
      }}
      className={`fixed inset-0 z-[999] flex items-center justify-center 
     backdrop-blur-2xl transition-opacity
    ${
      startClosingModalAnimation
        ? "animate-[opacityFadeOut_0.15s_linear_1] opacity-0"
        : "animate-[opacity_0.15s_linear_1]"
    }`}
    >
      <div
        className="
      relative mx-4 w-[90%] md:w-1/2 lg:w-1/3
      rounded-xl
      bg-gradient-to-b from-white to-gray-50
      dark:from-slate-700 dark:to-slate-800
      shadow-[0_20px_60px_rgba(0,0,0,0.25)]
      border border-gray-200/60 dark:border-slate-600/50
      transition-all duration-300
    "
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200/70 dark:border-slate-600/50">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Create Chapter
          </h2>
        </div>

        {/* Content */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateChapter();
          }}
        >
          <div className="px-6 py-5">
            <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              Chapter name
            </label>
            <input
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="e.g. Introduction"
              autoComplete="off"
              className="
            w-full rounded-lg px-4 py-2.5
            bg-white dark:bg-slate-900
            text-gray-900 dark:text-gray-50
            border border-gray-300/70 dark:border-slate-600
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none
            transition-all duration-200
          "
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-5">
            <Button
              variant="unstyled"
              type="button"
              onClick={handleAnimateCloseChapterModal}
              className="
            rounded-lg px-5 py-2 text-sm font-medium
            text-gray-600 dark:text-gray-300
            hover:text-gray-900 dark:hover:text-white
            hover:bg-gray-100 dark:hover:bg-slate-700
            transition-all
            focus:ring-2 focus:ring-gray-400/40
          "
            >
              Cancel
            </Button>

            <Button
              variant="unstyled"
              type="submit"
              className="
            rounded-lg px-5 py-2 text-sm font-semibold text-white
            bg-gradient-to-r from-blue-600 to-sky-500
            hover:from-blue-500 hover:to-sky-400
            shadow-md hover:shadow-lg
            transition-all duration-200
            focus:ring-2 focus:ring-blue-500/50
          "
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChapterModal;

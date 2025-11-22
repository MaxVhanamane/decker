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
      className={`backdrop-blur-xl fixed inset-0 flex items-center justify-center z-[999] ${
        startClosingModalAnimation
          ? "animate-[opacityFadeOut_0.15s_linear_1] opacity-0"
          : "animate-[opacity_0.15s_linear_1]"
      }`}
    >
      <div className="bg-white dark:bg-slate-800 flex flex-col items-center justify-center rounded-xl shadow-xl mx-4 w-[90%] md:w-1/2 lg:w-1/3 transition-colors duration-300">
        {/* modal head */}
        <div className="w-full border-b border-gray-200 dark:border-gray-600">
          <h2 className="py-3 px-5 text-left dark:text-gray-50 text-gray-900 font-semibold text-lg">
            Create Chapter
          </h2>
        </div>
        {/* modal content */}
        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateChapter();
          }}
        >
          <div className="px-5 py-5 w-full border-b border-gray-200 dark:border-gray-600">
            <input
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              name="Chapter name"
              placeholder="Chapter name"
              autoComplete="off"
              className="px-4 py-2 w-full outline-none rounded-lg font-medium text-gray-900 dark:bg-slate-700 dark:text-gray-50 border border-gray-300 dark:border-gray-600 focus:border-slate-400 dark:focus:border-slate-500
  focus:ring-1 focus:ring-slate-400 transition"
            />
          </div>

          {/* modal footer */}
          <div className="flex items-center justify-end space-x-3 mt-4 mb-4 mr-5">
            <Button
              variant="unstyled"
              type="submit"
              aria-label="Save"
              className="text-white bg-blue-700  hover:bg-sky-600 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              Save
            </Button>
            <Button
              variant="unstyled"
              onClick={handleAnimateCloseChapterModal}
              type="button"
              aria-label="Cancel"
              className="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChapterModal;

import { useState, Dispatch, useContext, FormEvent, useRef } from "react";
import { OfflineContext } from "../../context/OfflineContext";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import useEditDeck from "../../hooks/react-query/useEditDeck";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";

interface IProp {
  openEditDeckModal: boolean;
  animateCloseEditDeckModal: boolean;
  setOpenEditDeckModal: Dispatch<React.SetStateAction<boolean>>;
  setAnimateCloseEditDeckModal: Dispatch<React.SetStateAction<boolean>>;
  editData: {
    deckId: string;
    title: string;
  };
  setEditData: Dispatch<
    React.SetStateAction<{
      deckId: string;
      title: string;
    }>
  >;

  searchParams?: {
    page: number;
    query: string;
  };
}

const EditModalForDeck = ({
  openEditDeckModal,
  setOpenEditDeckModal,
  editData,
  setEditData,
  setAnimateCloseEditDeckModal,
  animateCloseEditDeckModal,
  searchParams,
}: IProp) => {
  const { isOnline } = useContext(OfflineContext);
  const { showToast } = useContext(ShowToastContext);
  const editModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(editModalRef, "both", {
    onEscape: () => setAnimateCloseEditDeckModal(true),
  });
  const [newTitle, setNewTitle] = useState(editData.title);
  const { mutate: editDeck } = useEditDeck();
  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isOnline) {
      showToast({
        message: "No internet connection",
        severity: "error",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });

      return;
    }

    const data = {
      deckId: editData.deckId,
      newTitle,
      searchParams,
    };
    if (newTitle !== editData.title) {
      editDeck(data);
    }
    setAnimateCloseEditDeckModal(true);
    setEditData({ deckId: "", title: "" });
  };

  return (
    <>
      {openEditDeckModal ? (
        <div
          ref={editModalRef}
          onAnimationEnd={() => {
            if (animateCloseEditDeckModal) {
              setAnimateCloseEditDeckModal(false);
              setOpenEditDeckModal(false);
            }
          }}
          className={`backdrop-blur-xl fixed inset-0 flex items-center justify-center z-[999] ${
            animateCloseEditDeckModal
              ? "animate-[opacityFadeOut_0.15s_linear_1] opacity-0"
              : "animate-[opacity_0.15s_linear_1]"
          }`}
        >
          <div className="bg-white dark:bg-slate-800 flex flex-col items-center justify-center rounded-xl shadow-xl mx-4 w-[90%] md:w-1/2 lg:w-1/3 transition-colors duration-300">
            {/* modal head */}
            <div className="w-full border-b border-gray-200 dark:border-gray-600">
              <h2 className="py-3 px-5 text-left dark:text-gray-50 text-gray-900 font-semibold text-lg">
                Edit Deck
              </h2>
            </div>
            {/* modal content */}
            <form className="w-full" onSubmit={(e) => handleSave(e)}>
              <div className="px-5 py-5 w-full border-b border-gray-200 dark:border-gray-600">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  name="title"
                  placeholder="Title"
                  autoFocus
                  className="px-4 py-2 w-full outline-none rounded-lg font-medium text-gray-900 dark:bg-slate-700 dark:text-gray-50 border border-gray-300 dark:border-gray-600 focus:border-slate-400 dark:focus:border-slate-500
  focus:ring-1 focus:ring-slate-400 transition"
                />
              </div>

              {/* modal footer */}
              <div className="flex items-center justify-end space-x-3 mt-4 mb-4 mr-5">
                <button
                  type="submit"
                  aria-label="Save"
                  className="text-white bg-blue-700  hover:bg-sky-600 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2 outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Save
                </button>
                <button
                  type="button"
                  aria-label="Cancel"
                  onClick={() => setAnimateCloseEditDeckModal(true)}
                  className="text-gray-500 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default EditModalForDeck;

import { useState, Dispatch, useContext, FormEvent, useRef } from "react";
import { OfflineContext } from "../../context/OfflineContext";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import useEditDeck from "../../hooks/react-query/useEditDeck";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";
import { useClickOutside } from "../../hooks/utility/useClickOutside";
import { motion } from "motion/react";
import Button from "../Button";
interface IProp {
  setOpenEditDeckModal: Dispatch<React.SetStateAction<boolean>>;
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
  setOpenEditDeckModal,
  editData,
  setEditData,
  searchParams,
}: IProp) => {
  const { isOnline } = useContext(OfflineContext);
  const { showToast } = useContext(ShowToastContext);
  const editModalContainerRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(editModalContainerRef, "both", {
    onEscape: () => setOpenEditDeckModal(false),
    initialFocusIndex: 0,
  });
  useClickOutside(editModalRef, true, () => {
    setOpenEditDeckModal(false);
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
    setOpenEditDeckModal(false);
    setEditData({ deckId: "", title: "" });
  };

  return (
    <motion.div
      exit={{
        opacity: 0,
        transition: {
          duration: 0.3,
        },
      }}
      ref={editModalContainerRef}
      className={`backdrop-blur-lg fixed inset-0 flex items-center justify-center z-[999]`}
    >
      <motion.div
        layoutId="editDeck"
        exit={{
          scale: 0.9,
          transition: {
            duration: 0.3,
          },
        }}
        transition={{
          layout: {
            type: "tween",
            duration: 0.28,
            ease: [0.22, 1.0, 0.36, 1.0],
          },
        }}
        ref={editModalRef}
        className="
      mx-4 w-[90%] md:w-1/2 lg:w-1/4
      flex flex-col
      rounded-xl
      bg-gradient-to-b from-white to-gray-50
      dark:from-slate-800 dark:to-slate-900
      border border-gray-200/70 dark:border-slate-600/40
      shadow-[0_20px_50px_rgba(0,0,0,0.25)]
      transition-colors duration-300
    "
      >
        {/* modal head */}
        <div className="w-full px-6 py-4 border-b border-gray-200/60 dark:border-slate-600/40">
          <h2 className="text-left text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            Edit Deck
          </h2>
        </div>

        {/* modal content */}
        <form className="w-full" onSubmit={(e) => handleSave(e)}>
          <div className="px-6 py-5">
            <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              Title
            </label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              name="title"
              placeholder="Deck title"
              autoFocus
              className="
            w-full rounded-lg px-4 py-2.5
            bg-white dark:bg-slate-800
            text-gray-900 dark:text-gray-50
            border border-gray-300/70 dark:border-slate-600 outline-none
            
            transition-all duration-200 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-1 focus:ring-slate-400
          "
            />
          </div>

          {/* modal footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-5">
            <Button
              variant="unstyled"
              type="button"
              aria-label="Cancel"
              onClick={() => setOpenEditDeckModal(false)}
              className="
            rounded-lg px-5 py-2.5 text-sm font-medium
            text-gray-600 dark:text-gray-300
            bg-transparent
            hover:bg-gray-100 dark:hover:bg-slate-700
            hover:text-gray-900 dark:hover:text-white
            border border-gray-200 dark:border-slate-600/40
            transition-all
        
          "
            >
              Cancel
            </Button>

            <Button
              variant="unstyled"
              type="submit"
              aria-label="Save"
              className="
            rounded-lg px-5 py-2.5 text-sm font-semibold text-white
            bg-gradient-to-r from-blue-600 to-sky-500
            hover:from-blue-500 hover:to-sky-400
            shadow-md hover:shadow-lg
            transition-all duration-200
            focus-within:dark:ring-gray-50
          
          "
            >
              Save
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditModalForDeck;

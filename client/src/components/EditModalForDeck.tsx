import { useState, Dispatch, useContext, FormEvent } from "react";
import useEditDeck from "../hooks/useEditDeck";
import { OfflineContext } from "../context/OfflineContext";
import { AlertData } from "../types/types";
import { AlertContext } from "../context/AlertContext";

interface IProp {
  openEditDeckModal: boolean;
  animateCloseEditDeckModal: boolean;
  setOpenEditDeckModal: Dispatch<React.SetStateAction<boolean>>;
  setAnimateCloseEditDeckModal: Dispatch<React.SetStateAction<boolean>>;
  editData: {
    deck_id: string;
    title: string;
  };
  setEditData: Dispatch<
    React.SetStateAction<{
      deck_id: string;
      title: string;
    }>
  >;
}

const EditModalForDeck = ({
  openEditDeckModal,
  setOpenEditDeckModal,
  editData,
  setEditData,
  setAnimateCloseEditDeckModal,
  animateCloseEditDeckModal,
}: IProp) => {
  const [newTitle, setNewTitle] = useState(editData.title);
  const { mutate: editDeck, isError: isEditError } = useEditDeck();
  const { isOnline } = useContext(OfflineContext);
  const { setAlert } = useContext(AlertContext);

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isOnline) {
      setAlert((preval: AlertData) => ({
        ...preval,
        severity: "error",
        show: true,
        message: "No internet connection",
        autoHideDuration: 5000,
      }));
      return;
    }
    const data = { deck_id: editData.deck_id, newTitle };
    editDeck(data);
    setAnimateCloseEditDeckModal(true);
    setEditData((prev) => ({ ...prev, deck_id: "", title: "" }));
  };

  return (
    <>
      {openEditDeckModal ? (
        <div
          onAnimationEnd={() => {
            if (animateCloseEditDeckModal) {
              setAnimateCloseEditDeckModal(false);
              setOpenEditDeckModal(false);
            }
          }}
          className={`w-full h-screen  backdrop-blur-xl  fixed inset-0 flex items-center justify-center z-[999] transition-opacity duration-300 ${
            animateCloseEditDeckModal
              ? "animate-opacityFadeOut opacity-0"
              : "animate-[opacity_0.2s_linear_1]"
          }`}
        >
          <div className=" bg-teal-500 dark:bg-slate-700 flex flex-col items-center justify-center rounded-md shadow mx-4 w-[90%] md:w-1/3">
            {/* modal head  */}
            <div className="w-full  border-b border-gray-50 dark:border-gray-50/50">
              <h2 className="py-2 px-4 text-left text-white font-bold ">
                Edit Deck
              </h2>
            </div>
            {/* modal content  */}
            <form className="w-full" onSubmit={(e) => handleSave(e)}>
              <div className=" px-4 py-4 w-full border-b border-gray-50 dark:border-gray-50/50 ">
                <input
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                  }}
                  name="title"
                  className="px-4 py-2 w-full outline-none rounded-md font-semibold text-gray-800 dark:bg-slate-800 dark:text-gray-50 "
                  placeholder="Title"
                  autoFocus
                />
              </div>

              {/* modal footer  */}
              <div className="flex items-center justify-end  space-x-2 mt-4 mb-4 mr-8 ">
                <button
                  className="px-2 py-1 bg-blue-700 hover:bg-blue-800  rounded outline-none text-white mx-4"
                  aria-label="Save"
                  type="submit"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setAnimateCloseEditDeckModal(true);
                  }}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 outline-none rounded text-white"
                  aria-label="Cancel"
                  type="button"
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

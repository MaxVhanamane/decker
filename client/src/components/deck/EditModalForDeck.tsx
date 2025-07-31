import { useState, Dispatch, useContext, FormEvent } from "react";
import { OfflineContext } from "../../context/OfflineContext";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import useEditDeck from "../../hooks/react-query/useEditDeck";

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
          onAnimationEnd={() => {
            if (animateCloseEditDeckModal) {
              setAnimateCloseEditDeckModal(false);
              setOpenEditDeckModal(false);
            }
          }}
          className={`backdrop-blur-xl  fixed inset-0 flex items-center justify-center z-[999]  ${
            animateCloseEditDeckModal
              ? "animate-[opacityFadeOut_0.15s_linear_1] opacity-0"
              : "animate-[opacity_0.15s_linear_1]"
          }`}
        >
          <div className=" bg-slate-300 dark:bg-slate-700 flex flex-col items-center justify-center rounded-md shadow mx-4 w-[90%] md:w-1/2 lg:w-1/3">
            {/* modal head  */}
            <div className="w-full  border-b border-gray-50 dark:border-gray-50/50">
              <h2 className="py-2 px-4 text-left dark:text-white text-gray-800 font-bold ">
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

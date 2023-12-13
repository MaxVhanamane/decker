import { useState, Dispatch, useContext, FormEvent } from "react";
import { OfflineContext } from "../context/OfflineContext";
import { AlertData, DeckAndCardType, DeckType } from "../types/types";
import { AlertContext } from "../context/AlertContext";
import { useNavigate } from "react-router-dom";
import { UseMutateFunction } from "@tanstack/react-query";

type CardData = {
  deck_id: string;
  newTitle: string;
};

type PromiseData = {
  title: string;
  _id: string;
  cards: { title: string; note: string }[];
  pinned: boolean;
};

type ErrorResponse = {
  message: string;
  status: number;
};

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
  editDeck: UseMutateFunction<
    PromiseData | ErrorResponse,
    Error,
    CardData,
    {
      previousQueryData: DeckType[] | undefined;
      previousQueryDataForSearch: DeckAndCardType[] | undefined;
    }
  >;
}

const EditModalForDeck = ({
  openEditDeckModal,
  setOpenEditDeckModal,
  editData,
  setEditData,
  setAnimateCloseEditDeckModal,
  animateCloseEditDeckModal,
  editDeck,
}: IProp) => {
  const [newTitle, setNewTitle] = useState(editData.title);

  const { isOnline } = useContext(OfflineContext);
  const { setAlert } = useContext(AlertContext);
  const navigate = useNavigate();

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
    navigate(-1);
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
          className={`backdrop-blur-xl  fixed inset-0 flex items-center justify-center z-[999] transition-opacity duration-300 ${
            animateCloseEditDeckModal
              ? "animate-[opacityFadeOut_0.15s_linear_1] opacity-0"
              : "animate-[opacity_0.15s_linear_1]"
          }`}
        >
          <div className=" bg-teal-500 dark:bg-slate-700 flex flex-col items-center justify-center rounded-md shadow mx-4 w-[90%] md:w-1/2 lg:w-1/3">
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
                    navigate(-1);
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

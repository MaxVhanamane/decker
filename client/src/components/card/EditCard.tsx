import React, {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  MutableRefObject,
  forwardRef,
  memo,
  useContext,
  useEffect,
  useState,
} from "react";
import { AiOutlineBold, AiOutlineLink } from "react-icons/ai";
import { BiCodeCurly } from "react-icons/bi";
import { BsCheckLg, BsTypeUnderline } from "react-icons/bs";
import { HiOutlineArrowSmDown, HiOutlineArrowSmUp } from "react-icons/hi";
import { AlertContext } from "../../context/AlertContext";
import { AlertData } from "../../types/types";
import { MdOutlineClose } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

type ContentType = {
  title: string;
  note: string;
  _id: string;
};

type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
};
type EditCardProps = {
  openModal: boolean;
  search_index?: string | null;
  setOpenModal: Dispatch<React.SetStateAction<boolean>>;
  addLink: (e: React.MouseEvent<HTMLButtonElement>) => void;
  addCodeBlock: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => void;
  addBoldText: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => void;
  addUnderlineText: (e: React.MouseEvent<HTMLButtonElement>) => void;
  editContent: ContentTypeForEdit;
  handleSave: () => void;
  closeEditModal: boolean;
  setCloseEditModal: Dispatch<React.SetStateAction<boolean>>;
};

const EditCard = forwardRef<HTMLTextAreaElement, EditCardProps>(
  (
    {
      setOpenModal,
      addLink,
      addCodeBlock,
      addBoldText,
      addUnderlineText,
      editContent,
      handleChange,
      handleSave,
      search_index,
      openModal,
      closeEditModal,
      setCloseEditModal,
    },
    editTextareaRef
  ) => {
    const [showScrollToBottomButton, setShowScrollToBottomButton] =
      useState(false);
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const { setAlert } = useContext(AlertContext);
    const location = useLocation();
    const navigate = useNavigate();

    const scrollToBottom = () => {
      const ref = editTextareaRef as MutableRefObject<HTMLTextAreaElement>;

      const isScrollable =
        ref.current!.scrollHeight > ref.current!.clientHeight;

      if (isScrollable) {
        if (ref?.current) {
          ref.current.scrollTo({
            top: ref.current.scrollHeight,
            behavior: "smooth",
          });
        }
      } else {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "warning",
          show: true,
          message: "There's nothing to scroll.",
          autoHideDuration: 2000,
        }));
        setShowScrollToTopButton(false);
        setShowScrollToBottomButton(false);
      }
    };

    const scrollToTop = () => {
      const ref = editTextareaRef as MutableRefObject<HTMLTextAreaElement>;

      const isScrollable =
        ref.current!.scrollHeight > ref.current!.clientHeight;

      if (isScrollable) {
        if (ref?.current) {
          ref.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      } else {
        setAlert((preval: AlertData) => ({
          ...preval,
          severity: "warning",
          show: true,
          message: "There's nothing to scroll.",
          autoHideDuration: 2000,
        }));
        setShowScrollToTopButton(false);
        setShowScrollToBottomButton(false);
      }
    };

    let prevScrollPosition = 0;

    const handleScroll = () => {
      const ref = editTextareaRef as MutableRefObject<HTMLTextAreaElement>;
      //By using scrollThreshold, you provide a more forgiving and user-friendly experience, as it allows the buttons to appear slightly before reaching the absolute top or bottom, making it easier for users to interact with them.
      const scrollThreshold = 2;

      if (ref.current) {
        const scrollPosition = ref.current.scrollTop;
        if (scrollPosition > prevScrollPosition) {
          // Scrolling down
          setShowScrollToTopButton(false);
          setShowScrollToBottomButton(true);
        } else if (scrollPosition < prevScrollPosition) {
          // Scrolling up
          setShowScrollToBottomButton(false);
          setShowScrollToTopButton(true);
        }

        prevScrollPosition = scrollPosition;
      }

      const scrollTop = ref.current.scrollTop;
      const scrollHeight = ref.current.scrollHeight;
      const clientHeight = ref.current.clientHeight;

      // Check if you've reached the top
      if (scrollTop <= scrollThreshold) {
        setShowScrollToTopButton(false);
        setShowScrollToBottomButton(true);
      }

      // Check if you've reached the bottom
      if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
        setShowScrollToBottomButton(false);
        setShowScrollToTopButton(true);
      }
    };

    useEffect(() => {
      const ref = editTextareaRef as MutableRefObject<HTMLTextAreaElement>;

      if (ref.current) {
        ref.current.addEventListener("scroll", handleScroll, true);

        // Clean up the event listener
        return () => {
          ref.current?.removeEventListener("scroll", handleScroll, true);
        };
      }
    }, []);

    const handleOnAnimationEnd = () => {
      if (openModal && closeEditModal) {
        setOpenModal(false);
        setCloseEditModal(false);
      }
    };

    return (
      <div
        onAnimationEnd={handleOnAnimationEnd}
        className={`w-screen  z-[90] dark:bg-slate-800 md:dark:bg-slate-900 bg-slate-300  md:bg-[#fcfefc] fixed inset-0 flex items-center justify-center  transition-opacity duration-500   ${
          closeEditModal
            ? " opacity-0 animate-opacityFadeOut"
            : "animate-[opacity_0.2s_linear_1]"
        } `}
      >
        <div className=" w-screen h-screen md:h-auto lg:w-1/2 md:mx-auto md:w-[90%]   md:rounded-md flex items-center justify-center flex-col gap-y-1 ">
          <div className="w-full  h-[3.4rem] dark:bg-slate-800 md:dark:bg-slate-900 bg-gray-300  absolute top-0 flex items-center justify-between md:justify-center md:gap-x-[23.5rem] lg:gap-x-[26rem] border-b border-gray-400/40 dark:border-gray-300/10  md:bg-[#fcfefc]">
            <div>
              <h2 className="py-2 px-4 text-left dark:text-white md:text-gray-600 text-gray-700 font-semibold ">
                Edit <span className="hidden md:inline">Card</span>
              </h2>
            </div>

            <div className="flex items-center justify-center   px-2 py-1 pr-4 ">
              <div className="flex items-center justify-center gap-3  ">
                <button
                  title="Add a link"
                  className="dark:text-blue-600   dark:hover:text-gray-300 text-blue-500 hover:text-gray-200 dark:hover:bg-gray-600 hover:bg-gray-400 hover:rounded-full p-1 text-xl  transition-all duration-150"
                  type="button"
                  name="addLinkToEditCard"
                  onClick={(e) => addLink(e)}
                >
                  <AiOutlineLink />
                </button>
                <button
                  title="Add code sample"
                  className="dark:text-green-600   dark:hover:text-gray-300 text-green-500 hover:text-gray-200 dark:hover:bg-gray-600 hover:bg-gray-400 hover:rounded-full p-1 text-xl  transition-all duration-150"
                  type="button"
                  name="addCodeSnippetToEditCard"
                  onClick={(e) => addCodeBlock(e)}
                >
                  <BiCodeCurly />
                </button>
                <button
                  name="addUnderlineTextToEditCard"
                  title="Underline text"
                  className="dark:text-teal-500  dark:hover:bg-gray-600 hover:bg-gray-400 hover:rounded-full p-1    text-xl  dark:hover:text-gray-300 text-sky-500 hover:text-gray-200 transition-all duration-150 "
                  type="button"
                  onClick={(e) => addUnderlineText(e)}
                >
                  <BsTypeUnderline />
                </button>
                <button
                  name="addBoldTextToEditCard"
                  title="Bold text"
                  className="dark:text-teal-500  dark:hover:bg-gray-600 hover:bg-gray-400 hover:rounded-full p-1    text-xl  dark:hover:text-gray-300 text-sky-500 hover:text-gray-200 transition-all duration-150 "
                  type="button"
                  onClick={(e) => addBoldText(e)}
                >
                  <AiOutlineBold />
                </button>
              </div>
              <div className="border h-4 mx-3 dark:border-gray-50/20 border-gray-500/40 "></div>
              <div className="flex items-center justify-center gap-3  ">
                <button
                  name="Close"
                  title="Close"
                  className="dark:text-red-500  dark:hover:bg-gray-600 hover:bg-gray-400 hover:rounded-full p-1    text-xl  dark:hover:text-gray-300 text-red-500 hover:text-gray-200 transition-all duration-150 "
                  type="button"
                  onClick={() => {
                    // You can remove the pushed state using either of these methods
                    // if (window?.history?.state?.isBackButtonNotClicked) {
                    //   window.history.back();
                    // }
                    if (location?.state?.isBackButtonNotClicked) {
                      navigate(-1);
                    }
                    if (search_index && openModal) {
                      navigate(location?.pathname, {
                        state: {
                          card: location?.state?.card,
                          from: location?.state?.from,
                          deckInfo: location?.state?.deckInfo,
                        },
                      });
                    }
                    setCloseEditModal(true);
                  }}
                >
                  <MdOutlineClose />
                </button>
                <button
                  name="Save"
                  title="Save"
                  className="dark:text-sky-500  dark:hover:bg-gray-600 hover:bg-gray-400 hover:rounded-full p-1    text-xl  dark:hover:text-gray-300 text-sky-500 hover:text-gray-200 transition-all duration-150 "
                  type="button"
                  onClick={handleSave}
                >
                  <BsCheckLg />
                </button>
              </div>
            </div>
          </div>
          <div className=" px-2 py-1  w-full mt-[3.4rem] dark:md:bg-gray-700 md:bg-teal-600 md:p-2 md:rounded-md">
            <div className="w-full flex flex-col items-center justify-center ">
              <div className="w-full h-16">
                <textarea
                  value={editContent.title}
                  onChange={handleChange}
                  name="title"
                  className="px-2 py-[0.36rem] w-full outline-none rounded-t-md   font-semibold text-gray-700 bg-gray-50 dark:bg-[#011627] dark:text-gray-50 resize-none border-none h-full"
                  placeholder="Title"
                  rows={2}
                />
              </div>
              <div className="dark:bg-[#011627] bg-gray-50 w-full flex items-end justify-center pb-2">
                <hr className="w-32 border-t-0 border-b dark:border-gray-200 border-gray-500  " />
              </div>
              <div className="w-full relative h-[78vh] lg:h-[78vh]  ">
                <textarea
                  value={editContent.note}
                  onChange={handleChange}
                  name="note"
                  className="px-2 py-2 pb-32 w-full outline-none text-gray-800 rounded-b-md bg-gray-50  dark:bg-[#011627] dark:text-gray-50 resize-none h-full"
                  placeholder="Note"
                  ref={editTextareaRef}
                ></textarea>
                {showScrollToBottomButton && (
                  <button
                    className=" absolute  bottom-6 right-4 border-2 dark:border-gray-600 border-gray-400 rounded-full p-1 text-gray-600 dark:text-gray-400 "
                    onClick={scrollToBottom}
                  >
                    <HiOutlineArrowSmDown />
                  </button>
                )}
                {showScrollToTopButton && (
                  <button
                    className=" absolute  bottom-6 right-4 border-2 dark:border-gray-600 border-gray-400 rounded-full p-1 text-gray-600 dark:text-gray-400 "
                    onClick={scrollToTop}
                  >
                    <HiOutlineArrowSmUp />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default memo(EditCard);

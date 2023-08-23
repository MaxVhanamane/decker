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
import { BsTypeUnderline } from "react-icons/bs";
import { FiCheck } from "react-icons/fi";
import { HiOutlineArrowSmDown, HiOutlineArrowSmUp } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { AlertContext } from "../../context/AlertContext";
import { AlertData } from "../../types/types";

type ContentType = {
  title: string;
  note: string;
  _id: string;
};

type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
};
type EditCardProps = {
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
    },
    editTextareaRef
  ) => {
    const [showScrollToBottomButton, setShowScrollToBottomButton] =
      useState(false);
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
    const { setAlert } = useContext(AlertContext);

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

    return (
      <div className="w-screen z-[90] bg-white dark:bg-slate-950 fixed inset-0 flex items-center justify-center ">
        <div className="  shadow w-screen h-screen md:h-auto lg:w-1/2 md:mx-auto md:w-[90%] dark:bg-slate-800 bg-gray-600 flex flex-col items-center justify-center md:rounded-md ">
          {/* modal head  */}

          <div className="w-full mt-1  py-[0.28rem] ">
            <div className=" flex item-center justify-between  pr-4 gap-2 ">
              <div>
                <h2 className="py-2 px-4 text-left text-white font-semibold ">
                  Edit Card
                </h2>
              </div>
              <div className="flex items-center justify-center gap-4  px-2 py-1  ">
                <button
                  title="Add a link"
                  className="dark:text-blue-600   dark:hover:text-gray-300 text-blue-500 hover:text-gray-200 dark:hover:bg-gray-600 hover:bg-gray-500 hover:rounded-full p-1 text-xl  transition-all duration-150"
                  type="button"
                  name="addLinkToEditCard"
                  onClick={(e) => addLink(e)}
                >
                  <AiOutlineLink />
                </button>
                <button
                  title="Add code sample"
                  className="dark:text-green-600   dark:hover:text-gray-300 text-green-500 hover:text-gray-200 dark:hover:bg-gray-600 hover:bg-gray-500 hover:rounded-full p-1 text-xl  transition-all duration-150"
                  type="button"
                  name="addCodeSnippetToEditCard"
                  onClick={(e) => addCodeBlock(e)}
                >
                  <BiCodeCurly />
                </button>
                <button
                  name="addUnderlineTextToEditCard"
                  title="Underline text"
                  className="dark:text-pink-600  dark:hover:bg-gray-600 hover:bg-gray-500 hover:rounded-full p-1    text-xl  dark:hover:text-gray-300 text-pink-500 hover:text-gray-200 transition-all duration-150 "
                  type="button"
                  onClick={(e) => addUnderlineText(e)}
                >
                  <BsTypeUnderline />
                </button>
                <button
                  name="addBoldTextToEditCard"
                  title="Bold text"
                  className="dark:text-sky-500  dark:hover:bg-gray-600 hover:bg-gray-500 hover:rounded-full p-1    text-xl  dark:hover:text-gray-300 text-sky-500 hover:text-gray-200 transition-all duration-150 "
                  type="button"
                  onClick={(e) => addBoldText(e)}
                >
                  <AiOutlineBold />
                </button>
              </div>
            </div>
          </div>
          {/* modal content  */}
          <div className=" px-2 py-1  w-full border-b border-t border-gray-50/80 dark:border-gray-50/20 flex flex-col items-center justify-center ">
            <textarea
              value={editContent.title}
              onChange={handleChange}
              name="title"
              className="px-2 py-[0.36rem] w-full outline-none rounded-t-md   font-semibold text-gray-800 bg-gray-100 dark:bg-[#011627] dark:text-gray-50 resize-none border-none"
              placeholder="Title"
              rows={2}
            />
            <div className="dark:bg-[#011627] bg-gray-100 w-full flex items-end justify-center pb-2">
              <hr className="w-32 border-t-0 border-b dark:border-gray-200 border-gray-700  " />
            </div>
            <div className="w-full relative">
              <textarea
                value={editContent.note}
                onChange={handleChange}
                name="note"
                className="px-2 py-2 pb-20 w-full outline-none text-gray-800 rounded-b-md bg-gray-100  dark:bg-[#011627] dark:text-gray-50 h-[72vh] resize-none "
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

          {/* modal footer  */}
          <div className="flex items-center justify-end  space-x-2 my-2 mr-8 w-full  ">
            <button
              onClick={handleSave}
              className="px-2 py-[0.20rem] rounded-md outline-none text-white mx-4 transition-all duration-300 order-2 flex items-center justify-center gap-1 shadow-inner  shadow-blue-500 hover:shadow-blue-600  bg-blue-700 hover:bg-blue-800"
              aria-label="Save"
            >
              Save <FiCheck />
            </button>
            <button
              onClick={() => {
                setOpenModal(false);
              }}
              className="px-2 py-[0.20rem]  shadow-inner shadow-red-400 bg-red-600  hover:bg-red-700 outline-none rounded-md text-white transition-all duration-300 order-1 flex items-center justify-center gap-1"
              aria-label="Cancel"
            >
              Close <IoMdClose />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default memo(EditCard);

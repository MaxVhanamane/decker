import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { BiEdit } from "react-icons/bi";
import { Dispatch, memo, useContext, useEffect, useRef, useState } from "react";
import parseNote from "../../functions/parseNote";
import ThemeToggler from "../ThemeToggler";
import { HiOutlineArrowSmDown, HiOutlineArrowSmUp } from "react-icons/hi";
import { UserContext } from "../../context/UserContext";
import { searchContext } from "../../context/SearchContext";
import { LuToggleLeft, LuToggleRight } from "react-icons/lu";
type ContentType = {
  title: string;
  note: string;
  _id: string;
  cardId: string;
};

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
  from?: string;
};

type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
};

type propTypes = {
  fullScreenCardData: ContentForFullScreen;
  search_index?: string | null;
  location: {
    pathname: string;
    search: string;
    hash: string;
    state: { isBackButtonNotClicked: boolean };
  };
  setShowFullScreen: Dispatch<React.SetStateAction<boolean>>;
  setStartAnimation: Dispatch<React.SetStateAction<boolean>>;
  setShowScrollButtons: Dispatch<React.SetStateAction<boolean>>;
  showScrollButtons: boolean;
  startAnimation: boolean;
  handleEdit: (cardItem: ContentTypeForEdit) => void;
  handleDelete: (index: number) => void;
};

const FullScreenCardView = ({
  fullScreenCardData,
  search_index,
  setShowFullScreen,
  handleDelete,
  handleEdit,
  startAnimation,
  setStartAnimation,
  showScrollButtons,
  setShowScrollButtons,
}: propTypes) => {
  const { theme } = useContext(UserContext);
  const navigate = useNavigate();
  const bottomElementRef = useRef<HTMLDivElement>(null);
  const topElementRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [parsedNote, setParsedNote] = useState<React.ReactNode[] | null>(null);
  const [parsingError, setParsingError] = useState("");
  const [parsingComplete, setParsingComplete] = useState(false);
  const { cardInfo, setCardInfo } = useContext(searchContext);
  const storedToggleValue: string | null = localStorage.getItem("toggleColor");
  const defaultToggleValue: boolean = storedToggleValue
    ? JSON.parse(storedToggleValue)
    : true; // Provide a default value in case the stored value is null or undefined

  // Now, defaultToggleValue is of type boolean

  const [toggle, setToggle] = useState(defaultToggleValue);
  const location = useLocation();
  useEffect(() => {
    const parseNoteAndSetCache = async () => {
      try {
        const parsedNoteResult = await parseNote(fullScreenCardData.note);
        setParsedNote(parsedNoteResult);
      } catch (error) {
        setParsedNote(null);
        setParsingError("An error occurred while parsing the note.");
      } finally {
        setParsingComplete(true);
      }
    };
    parseNoteAndSetCache();
  }, [fullScreenCardData.note, theme]);

  const handleScrollToTheBottom = () => {
    if (bottomElementRef.current) {
      bottomElementRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleScrollToTop = () => {
    if (topElementRef.current) {
      topElementRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  let prevScrollPosition = 0;

  const handleScroll = () => {
    if (divRef.current) {
      const scrollPosition = divRef.current.scrollTop;
      if (scrollPosition > prevScrollPosition) {
        // Scrolling down
        setShowScrollToTopButton(false);
        setShowScrollToBottomButton(true);
      } else {
        // Scrolling up
        setShowScrollToBottomButton(false);
        setShowScrollToTopButton(true);
      }
      if (bottomElementRef.current) {
        const elementRect = bottomElementRef.current.getBoundingClientRect();
        const isBottomElementInView =
          elementRect.top >= 0 && elementRect.bottom <= window.innerHeight;
        if (isBottomElementInView) {
          setShowScrollToBottomButton(false);
          setShowScrollToTopButton(true);
        }
      }
      if (topElementRef.current) {
        const elementRect = topElementRef.current.getBoundingClientRect();
        const isTopElementInView =
          elementRect.top >= 0 && elementRect.bottom <= window.innerHeight;
        if (isTopElementInView) {
          setShowScrollToBottomButton(true);
          setShowScrollToTopButton(false);
        }
      }

      prevScrollPosition = scrollPosition;
    }
  };

  useEffect(() => {
    if (divRef.current) {
      divRef.current.addEventListener("scroll", handleScroll, true);

      // Clean up the event listener
      return () => {
        divRef.current?.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, []);

  const handleOnAnimationEnd = () => {
    if (search_index && !startAnimation) {
      setCardInfo({
        title: "",
        note: "",
        _id: "",
        cardIndex: null,
        from: "",
        cardId: "",
      });
      navigate(-1);
      navigate(cardInfo?.from, { replace: true });
    }
    if (!showScrollButtons) {
      setShowScrollButtons(true);
    }
    if (!startAnimation) {
      setShowFullScreen(false), setStartAnimation(true);
    }
    const isScrollable =
      divRef.current!.scrollHeight > divRef.current!.clientHeight + 100;

    if (!isScrollable) {
      setShowScrollToBottomButton(false);
      setShowScrollToTopButton(false);
    } else {
      setShowScrollToBottomButton(true);
      setShowScrollToTopButton(false);
    }
  };

  return (
    <>
      <article
        style={{
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
        onAnimationEnd={handleOnAnimationEnd}
        className={`transition-transform duration-500 fixed inset-0 overflow-y-auto bg-[#fcfefc]   ${
          toggle
            ? "bg-gradient-to-r dark:from-slate-950 lg:dark:via-slate-700  dark:via-slate-800 dark:to-slate-900  from-slate-300 via-slate-200 to-slate-100"
            : ""
        }   dark:bg-slate-900    flex  flex-col z-[80] items-center ${
          startAnimation
            ? "animate-translateFromLeftToRight  lg:animate-quickOpacity  "
            : "animate-translateFromRightToLeft lg:animate-opacityFadeOut lg:opacity-0 scale-0 lg:scale-100 "
        } `}
      >
        <div
          className={`mt-2 lg:mt-1  w-full overflow-auto p-[0.95rem] md:p-14 lg:px-96  `}
          ref={divRef}
        >
          <div ref={topElementRef} />
          {parsingComplete && !parsingError ? (
            <div className={`mt-12 md:mt-auto `}>
              {/* here I have used tailwind's -ml-1 class to reduce the gap between the words that causes when you try to add very long words.(now it's removed) */}
              {/* whitespace-pre-line to keep the new lines and spaces as it is */}
              <p
                className={`text-left mb-5 mt-5  ${
                  fullScreenCardData?.title.length < 50
                    ? "font-semibold"
                    : "font-normal"
                }  text-lg  lg:text-xl  break-words break-normal  whitespace-pre-line text-gray-800 dark:text-slate-100 ${
                  parsedNote && "animate-opacityFadeIn lg:animate-quickOpacity"
                }`}
              >
                {fullScreenCardData?.title}
              </p>

              <div
                className={`text-left mb-20 lg:mb-16 break-words break-normal   whitespace-pre-wrap text-gray-800 dark:text-gray-200 ${
                  parsedNote && "animate-opacityFadeIn lg:animate-quickOpacity"
                } `}
              >
                {parsedNote}
              </div>
              <div ref={bottomElementRef} />
            </div>
          ) : !parsingError ? (
            <div
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-gray-800 dark:text-gray-200 ${
                !parsedNote && "animate-opacityFadeIn "
              }`}
            >
              Loading...
            </div>
          ) : (
            <div
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-gray-800 dark:text-gray-200 ${
                !parsedNote && "animate-opacityFadeIn"
              } w-full`}
            >
              {parsingError}
            </div>
          )}
          <div
            className={`fixed top-0  py-[0.95rem]  ${
              toggle
                ? "bg-gradient-to-r dark:from-slate-950 lg:dark:via-slate-700 dark:via-slate-800 dark:to-slate-900  from-slate-300 via-slate-200 to-slate-100"
                : ""
            } dark:bg-slate-900 border-b dark:border-gray-300/10 border-gray-800/10 bg-[#fcfefc]  px-4 left-0 w-full flex items-center justify-between lg:px-96  `}
          >
            <div>
              <button
                onClick={() => {
                  setStartAnimation(false);
                  setShowScrollButtons(false);
                  if (location?.state?.isBackButtonNotClicked) {
                    navigate(-1);
                  }
                }}
                className=" text-xl rounded pl-1  text-center dark:text-gray-200 text-gray-500  cursor-pointer flex items-center justify-center "
                aria-label="Back"
                title="Back"
              >
                <IoIosArrowBack /> <p className="text-xs   ">Back</p>
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 ">
              <div onClick={() => setParsingComplete(false)}>
                <ThemeToggler />
              </div>

              <button
                onClick={() => {
                  handleDelete(fullScreenCardData?.cardIndex!);
                }}
                type="button"
                className="text-blue-500 dark:text-sky-500 text-xl outline-none px-1 transition-all duration-200  text-center hover:scale-95 "
                aria-label="Delete Card"
                title="Delete Card"
              >
                <MdOutlineDeleteOutline />
              </button>

              <button
                onClick={() => {
                  handleEdit(fullScreenCardData);
                }}
                type="button"
                className="text-blue-500 text-xl outline-none  px-1  text-center hover:scale-95 dark:text-sky-500 transition-all duration-200"
                aria-label="Edit Card"
                title="Edit Card"
              >
                <BiEdit />
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("toggleColor", JSON.stringify(!toggle));
                  setToggle((pre) => !pre);
                }}
                type="button"
                className="text-blue-500 text-2xl outline-none  px-1  text-center hover:scale-95 dark:text-sky-500 transition-all duration-200"
                aria-label="Toggle Colors"
                title="Toggle Colors"
              >
                {toggle ? <LuToggleRight /> : <LuToggleLeft />}
              </button>
            </div>
          </div>
        </div>
      </article>
      {showScrollButtons &&
        (showScrollToBottomButton || showScrollToTopButton) && (
          <div className="fixed lg:right-8 lg:bottom-16 bottom-6 right-4 z-[80] animate-opacityFadeIn">
            {showScrollToBottomButton && parsedNote && (
              <button
                className=" fixed lg:right-8 lg:bottom-16 bottom-7 right-5 border-2 dark:border-gray-600 border-gray-400 rounded-full p-1 text-gray-600 dark:text-gray-400  "
                onClick={handleScrollToTheBottom}
              >
                <HiOutlineArrowSmDown />
              </button>
            )}
            {showScrollToTopButton && (
              <button
                className=" fixed lg:right-8 lg:bottom-16 bottom-7 right-5 border-2 dark:border-gray-600 border-gray-400 rounded-full p-1 text-gray-600 dark:text-gray-400 "
                onClick={handleScrollToTop}
              >
                <HiOutlineArrowSmUp />
              </button>
            )}
          </div>
        )}
    </>
  );
};

export default memo(FullScreenCardView);

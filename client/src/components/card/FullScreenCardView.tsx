import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { BiEdit } from "react-icons/bi";
import {
  Dispatch,
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import parseNote from "../../functions/parseNote";
import ThemeToggler from "../ThemeToggler";
import { HiOutlineArrowSmDown, HiOutlineArrowSmUp } from "react-icons/hi";
import { UserContext } from "../../context/UserContext";

type ContentType = {
  title: string;
  note: string;
  _id: string;
};

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
};

type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
};

type propTypes = {
  fullScreenCardData: ContentForFullScreen;
  search_index: string | null;
  location: {
    pathname: string;
    search: string;
    hash: string;
    state: any;
  };
  setShowFullScreen: Dispatch<React.SetStateAction<boolean>>;
  setStartAnimation: Dispatch<React.SetStateAction<boolean>>;
  setShowScrollButtons: Dispatch<React.SetStateAction<boolean>>;
  showScrollButtons:boolean;
  startAnimation: boolean;
  handleEdit: (cardItem: ContentTypeForEdit) => void;
  handleDelete: (index: number) => void;
};

const FullScreenCardView = ({
  fullScreenCardData,
  search_index,
  location,
  setShowFullScreen,
  handleDelete,
  handleEdit,
  startAnimation,
  setStartAnimation,
  showScrollButtons,
  setShowScrollButtons
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

  const handleOnAnimationEnd=()=>{
    if(location.state?.from === "/" && !startAnimation){
      navigate("/");
    }
    if (!showScrollButtons) {
      setShowScrollButtons(true);
    }
    if (!startAnimation) {
      setShowFullScreen(false), setStartAnimation(true);
    }
    const isScrollable =
    divRef.current!.scrollHeight > divRef.current!.clientHeight;

  if (!isScrollable) {
    setShowScrollToBottomButton(false);
    setShowScrollToTopButton(false);
  } else {
    setShowScrollToBottomButton(true);
    setShowScrollToTopButton(false);
  }
  }

  return (
    <>
      <article
        onAnimationEnd={handleOnAnimationEnd}
        className={`transition-transform duration-500 fixed inset-0 overflow-y-auto bg-[#fcfefc]  dark:bg-slate-950   flex  flex-col z-[80] items-center ${
          startAnimation
            ? "animate-translateFromLeftToRight lg:animate-none  "
            : " animate-translateFromRightToLeft lg:animate-opacity scale-0 lg:duration-0"
        } `}
      >
        <div
          className={`mt-2 lg:mt-4  w-full overflow-auto p-4 lg:px-96  `}
          ref={divRef}
        >
          <div ref={topElementRef} />
          {parsingComplete && !parsingError ? (
            <div className={`mt-12  `}>
              {/* here I have used tailwind's -ml-1 class to reduce the gap between the words that causes when you try to add very long words. */}
              {/* whitespace-pre-line to keep the new lines and spaces as it is */}
              <p
                className={`text-left mb-5 mt-5 text-lg font-bold break-words break-normal -ml-1 whitespace-pre-line text-gray-800 dark:text-slate-100 ${
                  parsedNote && "animate-opacity"
                }`}
              >
                {fullScreenCardData?.title}
              </p>
              <div
                className={`text-left mb-16 break-words break-normal  -ml-1 whitespace-pre-wrap text-gray-800 dark:text-gray-200 ${
                  parsedNote && "animate-opacity"
                } `}
              >
                {parsedNote}
              </div>
              <div ref={bottomElementRef} />
            </div>
          ) : !parsingError ? (
            <div
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-gray-800 dark:text-gray-200 ${
                !parsedNote && "animate-opacity"
              }`}
            >
              Loading...
            </div>
          ) : (
            <div
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-gray-800 dark:text-gray-200 ${
                !parsedNote && "animate-opacity"
              } w-full`}
            >
              {parsingError}
            </div>
          )}
          <div className="fixed top-0  py-[0.875rem] dark:bg-slate-950 border-b dark:border-gray-300/10 border-gray-800/10 bg-[#fcfefc] px-4 left-0 w-full flex items-center justify-between lg:px-96 ">
            <div>
              <button
                onClick={() => {
                  // "If the 'search_index' is available, we will handle the back button differently.
                  //  we will not convert the 'search_index' to a number because the index could be 0. If we convert 0 to a number and use it in the 'if' statement, it will evaluate to false. However, if we treat it as a string, it will evaluate to true
                  if (search_index) {
                    // If the 'search_index' is present and the user clicks on the back button, we will take them back to the page they came from. To get the previous URL, we can use 'location.state?.from', which we set in the Link tag.
                    if (location.state?.from === "/") {
                       setStartAnimation(false);
                      setShowScrollButtons(false);
                    } else {
                      // if user is on /cards/ReactJs(deck_id) and opens searchbar and searches something and opens card and closes when he closes the card I am navigating him to /cards/ReactJs(deck_id) but while navigating If I don't send deck as state value I will not see any cards that is why I am sending this data to avoid no cards found error. This value  location?.state?.deckInfo I set this value in searchResult component.
                      navigate(location.state?.from, {
                        state: {
                          deck: location?.state?.deckInfo
                            ? location?.state?.deckInfo
                            : null,
                        },
                      });
                      setStartAnimation(false);
                      setShowScrollButtons(false);
                    }
                  }
                  //"If the 'search_index' is undefined, it means that we did not arrive at this page from a search result, and instead opened it from the cards page. Therefore, we will simply close the fullscreen display.
                  else {
                    setStartAnimation(false);
                    setShowScrollButtons(false);
                  }
                }}
                className=" text-xl rounded px-1  text-center text-gray-50 cursor-pointer bg-red-500"
                aria-label="Back"
                title="Back"
              >
                <IoIosArrowRoundBack />
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
                className="text-red-500 text-xl outline-none px-1  text-center hover:scale-95 "
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
                className="text-blue-500 text-xl outline-none  px-1  text-center hover:scale-95 dark:text-sky-400"
                aria-label="Edit Card"
                title="Edit Card"
              >
                <BiEdit />
              </button>
            </div>
          </div>
        </div>
      </article>
      {showScrollButtons && (showScrollToBottomButton ||  showScrollToTopButton) &&(
        <div className="fixed lg:right-8 lg:bottom-16 bottom-6 right-4 z-[80] animate-opacity">
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

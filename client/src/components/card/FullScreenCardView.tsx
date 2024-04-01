import { IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { BiEdit } from "react-icons/bi";
import React, {
  Dispatch,
  isValidElement,
  memo,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import parseNote from "../../functions/parseNote";
import ThemeToggler from "../ThemeToggler";
import { HiOutlineArrowSmDown, HiOutlineArrowSmUp } from "react-icons/hi";
import { UserContext } from "../../context/UserContext";
import { searchContext } from "../../context/SearchContext";
import { LuToggleLeft, LuToggleRight } from "react-icons/lu";
import { TbKeyboard, TbKeyboardOff } from "react-icons/tb";
import PopUpMessage from "../PopUpMessage";
import DisplayNote from "./DisplayNote";
import { AudioContext } from "../../context/AudioContext";
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
  handleEditCardButtonClick: (cardItem: ContentTypeForEdit) => void;
  handleDelete: (index: number) => void;
};

const FullScreenCardView = ({
  fullScreenCardData,
  search_index,
  setShowFullScreen,
  handleDelete,
  handleEditCardButtonClick,
  startAnimation,
  setStartAnimation,
  showScrollButtons,
  setShowScrollButtons,
}: propTypes) => {
  const { theme } = useContext(UserContext);
  const navigate = useNavigate();
  const showPopUp = useRef<HTMLDivElement | null>(null);

  const bottomElementRef = useRef<HTMLDivElement>(null);
  const topElementRef = useRef<HTMLDivElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [parsedNote, setParsedNote] = useState<React.ReactNode[]>([]);
  const [parsingError, setParsingError] = useState("");
  const [parsingComplete, setParsingComplete] = useState(false);
  const { cardInfo, setCardInfo } = useContext(searchContext);
  const { isPlayingAudioAllowed, handlePlayAudio } = useContext(AudioContext);
  const storedToggleValue: string | null = localStorage.getItem("toggleColor");
  const [pageOpenCount, setPageOpenCount] = useState(1);
  const storedTypewriterEffectValue: string | null = localStorage.getItem(
    "showTypewriterEffect"
  );
  const defaultToggleValue: boolean = storedToggleValue
    ? JSON.parse(storedToggleValue)
    : false; // Provide a default value in case the stored value is null or undefined
  const defaultTypewriterEffectValue: boolean = storedTypewriterEffectValue
    ? JSON.parse(storedTypewriterEffectValue)
    : false; // Provide a default value in case the stored value is null or undefined
  const [toggle, setToggle] = useState(defaultToggleValue);
  const [showTypewriterEffect, setShowTypewriterEffect] = useState(
    defaultTypewriterEffectValue
  );
  const [dispalyResponse, setDisplayResponse] = useState<React.ReactNode[]>([]);
  const location = useLocation();
  const [startTyping, setStartTyping] = useState(false);
  const [typingInProgress, setTypingInProgress] = useState(false);
  const iRef = useRef<number>(0); // Initialize a ref to store the value of `i`. we will use this iref to continue typing where we left off when pause Typing becomes true and then false.
  const intervalIdRef = useRef<NodeJS.Timeout>();

  const flattenReactNodes = (nodes: React.ReactNode[]): React.ReactNode[] => {
    // Nodes will be an array that contains React elements for bold, underlined, linked, and code block styles. It will also include normal strings if no styles have been applied.

    const result = nodes.reduce<React.ReactNode[]>((accumulator, node) => {
      if (typeof node === "string") {
        // The regular expression /(\s+)/ is designed to split the string wherever one or more whitespace characters (spaces, tabs, or newlines) are found. The \s+ part of the regular expression specifies that it should match one or more occurrences of whitespace characters.

        // .flatMap((part) => (/\s+/.test(part) ? [part] : [...part])) — This part will keep the spaces as they are. If there are multiple spaces one after another, we will keep all of them together; we will not split them. If we encounter text, we will split it.  if we split the empty long string then while showing typing effect it will show typing effect to blank long string.

        return [
          ...accumulator,
          ...node
            .split(/(\s+)/)
            .flatMap((part) => (/\s+/.test(part) ? [part] : [...part])),
        ];
      }

      if (React.isValidElement(node)) {
        return [...accumulator, node];
      }

      return accumulator;
    }, []);
    return result;
  };

  const flattenedArray = useMemo(() => {
    if (search_index) {
      return [];
    }
    return flattenReactNodes(parsedNote);
  }, [parsedNote]);

  useEffect(() => {
    const parseNoteAndSet = async () => {
      try {
        setParsingComplete(false);
        const parsedNoteResult = await parseNote(
          fullScreenCardData.note,
          showTypewriterEffect
        );
        setParsedNote(parsedNoteResult);
      } catch (error) {
        setParsedNote([]);
        setParsingError("An error occurred while parsing the note.");
      } finally {
        setParsingComplete(true);
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
        iRef.current = 0;
        setDisplayResponse([]);
      }
    };
    parseNoteAndSet();
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

  useEffect(() => {
    if (window.innerWidth < 1024 && !defaultToggleValue) {
      setToggle(false); // Adjust the condition based on your screen size criteria
    } else if (window.innerWidth >= 1024) {
      if (localStorage.getItem("toggleColor")) {
        setToggle(defaultToggleValue);
      } else {
        setToggle(true);
      }
    }
  }, []);

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

  useEffect(() => {
    // If typing is in progress and the user clicks on the edit or delete button, instead of showing the typing effect, we will simply remove the typing effect and add all the text at once. This is because the user is not looking at the typing effect, so it is a waste of resources. To achieve this, we will use pageOpenCount state.
    if (showTypewriterEffect && pageOpenCount === 1 && !search_index) {
      if (parsingComplete) {
        const totalLength = flattenedArray.length;

        if (flattenedArray.length !== dispalyResponse.length) {
          // typingInProgress is used to show feather icon
          setTypingInProgress(true);

          intervalIdRef.current = setInterval(() => {
            // The startTyping state makes sure that the typing only begins after the card finishes opening. Without this, if the content is short, it might get typed before the card opens fully because there's an animation that takes a bit of time.
            if (startTyping) {
              const currentChar = flattenedArray[iRef.current];

              setDisplayResponse((prev) => {
                const updatedResponse: React.ReactNode[] = [
                  ...prev,
                  currentChar,
                ];

                iRef.current++;

                if (iRef.current >= totalLength) {
                  clearInterval(intervalIdRef.current!);
                  iRef.current = 0;
                  setTypingInProgress(false);
                }
                return updatedResponse;
              });
            }
          }, 20);
        }
      }
    } else if (!search_index) {
      if (showTypewriterEffect) {
        setDisplayResponse(parsedNote);
      }
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [
    parsedNote,
    parsingComplete,
    startTyping,
    showTypewriterEffect,
    pageOpenCount,
    search_index,
  ]);

  useEffect(() => {
    // Update the meta tag
    const metaTag = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement;

    if (toggle) {
      if (metaTag && theme === "light") {
        const themeColor = "#e2e8f0";
        metaTag.setAttribute("content", themeColor);
      }
      if (metaTag && theme === "dark") {
        const themeColor = "#1e293b";
        metaTag.setAttribute("content", themeColor);
      }
    } else {
      if (metaTag && theme === "light") {
        const themeColor = "#fcfefc";
        metaTag.setAttribute("content", themeColor);
      }
      if (metaTag && theme === "dark") {
        const themeColor = "#0f172a";
        metaTag.setAttribute("content", themeColor);
      }
    }
    return () => {
      const themeColor = theme === "dark" ? "#0f172a" : "#fcfefc";
      metaTag.setAttribute("content", themeColor);
    };
  }, [toggle, theme]);

  const handleOnAnimationEnd = () => {
    setStartTyping(true);
    if (search_index && !startAnimation) {
      setCardInfo({
        title: "",
        note: "",
        _id: "",
        cardIndex: null,
        from: "",
        cardId: "",
      });
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

  const handlePopUp = () => {
    if (showPopUp.current?.classList.contains("scale-0")) {
      showPopUp.current.classList.remove("scale-0");
      showPopUp?.current?.classList.add("!block");
      showPopUp.current.classList.add("!w-[85%]");
      showPopUp.current.classList.add("md:!w-fit");
      showPopUp.current.classList.add("!h-fit");
      showPopUp.current.classList.add("scale-100");

      setTimeout(() => {
        showPopUp?.current?.classList.remove("scale-100");
        showPopUp?.current?.classList.add("scale-0");
        showPopUp?.current?.classList.add("hidden");
      }, 3000);
    }
  };

  return (
    <>
      <PopUpMessage
        ref={showPopUp}
        message={
          showTypewriterEffect
            ? "You have turned on the typing effect"
            : "You have turned off the typing effect"
        }
      />
      <article
        onAnimationEnd={handleOnAnimationEnd}
        className={`transition-transform duration-500 fixed inset-0 overflow-y-auto bg-[#fcfefc]    ${
          toggle
            ? "dark:bg-BgDarkModeSmall bg-lightBg dark:lg:bg-BgForDarkMode"
            : ""
        }   dark:bg-slate-900 flex flex-col z-[80] items-center ${
          startAnimation
            ? "animate-translateFromLeftToRight  lg:animate-quickOpacity  "
            : "animate-translateFromRightToLeft lg:animate-opacityFadeOut lg:opacity-0 scale-0 lg:scale-100 "
        } `}
      >
        <div
          className={`mt-2 lg:mt-1 w-full overflow-auto p-[0.95rem] md:p-14 md:w-[51.25rem]  `}
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
                  parsedNote.length > 0 &&
                  "animate-opacityFadeIn lg:animate-quickOpacity"
                }`}
              >
                {fullScreenCardData?.title}
              </p>

              <DisplayNote
                parsedNote={parsedNote}
                showTypewriterEffect={showTypewriterEffect}
                search_index={search_index}
                dispalyResponse={dispalyResponse}
                typingInProgress={typingInProgress}
              />
              <div ref={bottomElementRef} />
            </div>
          ) : !parsingError ? (
            <div
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-gray-800 dark:text-gray-200 ${
                !(parsedNote.length > 0) && "animate-opacityFadeIn "
              }`}
            >
              Loading...
            </div>
          ) : (
            <div
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-gray-800 dark:text-gray-200 ${
                !(parsedNote.length > 0) && "animate-opacityFadeIn"
              } w-full`}
            >
              {parsingError}
            </div>
          )}
          <div
            className={`fixed top-0  py-[0.55rem]  ${
              toggle
                ? "dark:lg:bg-BgForDarkMode dark:bg-BgDarkModeSmall bg-lightBg"
                : ""
            } dark:bg-slate-900 border-b dark:border-gray-300/10 border-gray-800/10 bg-[#fcfefc]  px-3 md:px-0 left-0 w-full flex items-center justify-center  `}
          >
            <div className="md:w-[51.25rem] flex items-center justify-between md:px-14 w-full  ">
              <div>
                <button
                  onClick={() => {
                    setStartAnimation(false);
                    setShowScrollButtons(false);
                    if (location?.state?.isBackButtonNotClicked) {
                      navigate(-1);
                    }
                  }}
                  className=" text-xl rounded   text-center dark:text-gray-200 text-gray-500  cursor-pointer flex items-center justify-center "
                  aria-label="Back"
                  title="Back"
                >
                  <IoIosArrowBack className="lg:-ml-[0.15rem]" />{" "}
                  <p className="text-xs   ">Back</p>
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 ">
                <span
                  onClick={() => {
                    if (typingInProgress) {
                      setTypingInProgress(false);
                    }
                  }}
                >
                  <ThemeToggler ParentComponentName="FullScreenCardView" />
                </span>

                {!search_index && (
                  <button
                    onClick={() => {
                      localStorage.setItem(
                        "showTypewriterEffect",
                        JSON.stringify(!showTypewriterEffect)
                      );
                      setPageOpenCount(1);
                      setShowTypewriterEffect((pre) => !pre);
                      iRef.current = 0;
                      setDisplayResponse([]);
                      if (typingInProgress) {
                        setTypingInProgress(false);
                      }
                      handlePopUp();
                    }}
                    type="button"
                    className="text-blue-500  outline-none  text-center dark:hover:text-gray-300 hover:text-gray-200 dark:hover:bg-gray-700 hover:bg-gray-400 rounded-full p-[0.4rem] dark:text-sky-500 transition-all duration-300"
                    aria-label="Toggle typing effect"
                    title="Toggle typing effect"
                  >
                    {showTypewriterEffect ? (
                      <TbKeyboard className="text-[1.3rem]" />
                    ) : (
                      <TbKeyboardOff className="text-[1.3rem]" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    handleDelete(fullScreenCardData?.cardIndex!);
                    if (typingInProgress) {
                      setTypingInProgress(false);
                    }
                    setPageOpenCount(4);
                  }}
                  type="button"
                  className="text-blue-500 dark:text-sky-500 text-xl outline-none  transition-all duration-300  text-center dark:hover:bg-gray-700 hover:bg-gray-400 dark:hover:text-gray-300 hover:text-gray-200 rounded-full p-[0.4rem] "
                  aria-label="Delete Card"
                  title="Delete Card"
                >
                  <MdOutlineDeleteOutline />
                </button>

                <button
                  onClick={() => {
                    setPageOpenCount(3);
                    if (typingInProgress) {
                      setTypingInProgress(false);
                    }
                    handleEditCardButtonClick(fullScreenCardData);
                  }}
                  type="button"
                  className="text-blue-500 text-xl outline-none  text-center dark:hover:bg-gray-700 hover:bg-gray-400 dark:hover:text-gray-300 hover:text-gray-200 rounded-full p-[0.4rem] dark:text-sky-500 transition-all duration-300"
                  aria-label="Edit Card"
                  title="Edit Card"
                >
                  <BiEdit />
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem(
                      "toggleColor",
                      JSON.stringify(!toggle)
                    );
                    setToggle((pre) => !pre);
                    if (toggle) {
                      if (isPlayingAudioAllowed) {
                        setTimeout(() => {
                          handlePlayAudio("switchOnAudioSound");
                        }, 100);
                      }
                    } else {
                      if (isPlayingAudioAllowed) {
                        setTimeout(() => {
                          handlePlayAudio("switchOffAudioSound");
                        }, 100);
                      }
                    }
                  }}
                  type="button"
                  className="text-blue-500 text-2xl outline-none  text-center dark:hover:text-gray-300 hover:text-gray-200 dark:hover:bg-gray-700 hover:bg-gray-400 rounded-full p-[0.4rem] dark:text-sky-500 transition-all duration-300"
                  aria-label="Toggle Colors"
                  title="Toggle Colors"
                >
                  {toggle ? <LuToggleRight /> : <LuToggleLeft />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
      {showScrollButtons &&
        (showScrollToBottomButton || showScrollToTopButton) && (
          <div className="fixed lg:left-1/2 lg:translate-x-[20.5rem] lg:right-1/2 lg:bottom-8 bottom-7 right-5 z-[80] animate-opacityFadeIn">
            {showScrollToBottomButton && parsedNote && (
              <button
                className="  border-2 dark:border-gray-500 border-gray-400 rounded-full p-1 text-gray-600 dark:text-gray-300  "
                onClick={handleScrollToTheBottom}
              >
                <HiOutlineArrowSmDown />
              </button>
            )}
            {showScrollToTopButton && (
              <button
                className="  border-2 dark:border-gray-500 border-gray-400 rounded-full p-1 text-gray-600 dark:text-gray-300 "
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

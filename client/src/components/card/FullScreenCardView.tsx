import React, {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import NoteSection from "./NoteSection";
import Button from "../Button";
import { IoIosArrowBack } from "react-icons/io";
import { TbKeyboard, TbKeyboardOff } from "react-icons/tb";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { BiEdit } from "react-icons/bi";
import { LuToggleLeft, LuToggleRight } from "react-icons/lu";
import { HiOutlineArrowSmDown, HiOutlineArrowSmUp } from "react-icons/hi";
import ThemeToggler from "../ThemeToggler";
import { AudioContext } from "../../context/AudioContext";
import { Descendant } from "slate";

type ContentType = {
  note: Descendant[];
  cardId: string;
  createdAt: string;
};

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
  from?: string;
};

type ContentTypeForEdit = ContentType & {
  cardIndex: number | null;
};

type propType = {
  fullScreenCardData: ContentForFullScreen | null;
  setShowFullScreen: Dispatch<React.SetStateAction<boolean>>;
  setCloseFullScreenWithAnimation: Dispatch<React.SetStateAction<boolean>>;
  setShowScrollButtons: Dispatch<React.SetStateAction<boolean>>;
  showScrollButtons: boolean;
  closeFullScreenWithAnimation: boolean;
  handleEditCardButtonClick: (cardItem: ContentTypeForEdit) => void;
  handleDelete: (index: number) => void;
};

const FullScreenCardView = ({
  fullScreenCardData,
  setShowFullScreen,
  handleDelete,
  handleEditCardButtonClick,
  closeFullScreenWithAnimation,
  setCloseFullScreenWithAnimation,
  showScrollButtons,
  setShowScrollButtons,
}: propType) => {
  const { isPlayingAudioAllowed, handlePlayAudio } = useContext(AudioContext);

  const [toggleGradient, setToggleGradient] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("toggleColor") ?? "false")
  );
  const [showTypewriterEffect, setShowTypewriterEffect] = useState(() => {
    const storedValue = localStorage.getItem("showTypewriterEffect");
    return storedValue ? JSON.parse(storedValue) === true : false;
  });
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);
  const bottomElementRef = useRef<HTMLDivElement>(null);
  const topElementRef = useRef<HTMLDivElement>(null);
  const prevScrollPosition = useRef(0);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.addEventListener("scroll", handleScroll, true);

      return () => {
        divRef.current?.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, []);

  const handleScroll = () => {
    if (!divRef.current) return;

    const scrollTop = divRef.current.scrollTop;
    const scrollHeight = divRef.current.scrollHeight;
    const clientHeight = divRef.current.clientHeight;

    // Check if user is at the top
    const isAtTop = scrollTop === 0;
    // Check if user is at the bottom (allowing a small margin to avoid precision issues)
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if (isAtBottom) {
      setShowScrollToBottomButton(false);
      setShowScrollToTopButton(true);
    } else if (isAtTop) {
      setShowScrollToBottomButton(true);
      setShowScrollToTopButton(false);
    } else {
      if (scrollTop > prevScrollPosition.current) {
        // Scrolling down
        setShowScrollToBottomButton(true);
        setShowScrollToTopButton(false);
      } else {
        // Scrolling up
        setShowScrollToBottomButton(false);
        setShowScrollToTopButton(true);
      }
    }

    prevScrollPosition.current = scrollTop;
  };

  const handleBackButtonClick = useCallback(() => {
    setCloseFullScreenWithAnimation(true);
    setShowScrollButtons(false);
  }, []);

  const handleScrollToTheBottom = useCallback(() => {
    if (bottomElementRef.current) {
      bottomElementRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  const handleScrollToTop = useCallback(() => {
    if (topElementRef.current) {
      topElementRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleDeleteCard = useCallback(() => {
    if (
      fullScreenCardData &&
      fullScreenCardData.cardIndex !== undefined &&
      fullScreenCardData?.cardIndex !== null
    ) {
      handleDelete(fullScreenCardData.cardIndex);
    }
  }, [fullScreenCardData, handleDelete]);

  const handleEditCard = useCallback(() => {
    if (fullScreenCardData) handleEditCardButtonClick(fullScreenCardData);
  }, [fullScreenCardData, handleEditCardButtonClick]);

  const handleToggleBgColor = useCallback(() => {
    localStorage.setItem("toggleColor", JSON.stringify(!toggleGradient));
    setToggleGradient((pre) => !pre);
    if (toggleGradient) {
      if (isPlayingAudioAllowed) {
        handlePlayAudio("switchOnAudioSound");
      }
    } else {
      if (isPlayingAudioAllowed) {
        handlePlayAudio("switchOffAudioSound");
      }
    }
  }, [toggleGradient, isPlayingAudioAllowed, handlePlayAudio]);

  const handleOnAnimationEnd = () => {
    if (!showScrollButtons) {
      setShowScrollButtons(true);
    }
    if (closeFullScreenWithAnimation) {
      setShowFullScreen(false), setCloseFullScreenWithAnimation(false);
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
        onAnimationEnd={handleOnAnimationEnd}
        className={`transition-transform duration-500 fixed inset-0  bg-white    ${
          toggleGradient
            ? "dark:bg-BgDarkModeSmall bg-lightBg dark:lg:bg-BgForDarkMode"
            : ""
        }   dark:bg-slate-900  z-[80] flex flex-col items-center  ${
          !closeFullScreenWithAnimation
            ? "animate-translateFromLeftToRight  lg:animate-[opacity_0.2s_linear_1]  "
            : "animate-translateFromRightToLeft lg:animate-opacityFadeOut"
        } `}
      >
        <div className={` w-full flex flex-col items-center h-full  relative `}>
          {/* Buttons */}
          <div
            className={` w-full flex items-center
               justify-center md:w-[42rem] `}
          >
            <div className=" flex items-center justify-between  w-full md:w-[42rem] h-16  border-b dark:border-gray-300/10 border-gray-800/10 ">
              <div>
                <Button
                  variant="plain"
                  size="md"
                  aria-label="Go back"
                  type="button"
                  onClick={handleBackButtonClick}
                  className="font-semibold text-lg "
                >
                  {buttons.Back.label}
                </Button>
              </div>
              <div className="flex items-center justify-center gap-1 ">
                <div>
                  <ThemeToggler ParentComponentName="FullScreenCardView" />
                </div>

                <Button
                  variant="plain"
                  size="md"
                  aria-label="Toggle typing effect"
                  toolTipText="Toggle typing effect"
                  withTooltip
                  type="button"
                  className="text-blue-500 dark:text-sky-500 dark:hover:text-gray-300 hover:text-blue-600 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-full p-[0.4rem]  "
                  onClick={() => {
                    if (showTypewriterEffect) {
                      localStorage.setItem("showTypewriterEffect", "false");
                    } else {
                      localStorage.setItem("showTypewriterEffect", "true");
                    }
                    setShowTypewriterEffect((prev) => !prev);
                  }}
                >
                  {showTypewriterEffect
                    ? buttons.TypingEffect.label.on
                    : buttons.TypingEffect.label.off}
                </Button>

                <Button
                  variant="plain"
                  size="lg"
                  type="button"
                  aria-label="Delete Card"
                  toolTipText="Delete Card"
                  withTooltip
                  className="text-blue-500 dark:text-sky-500   dark:hover:bg-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 hover:text-blue-600 rounded-full p-[0.4rem] text-xl"
                  onClick={handleDeleteCard}
                >
                  {buttons.Delete.label}
                </Button>

                <Button
                  variant="plain"
                  size="lg"
                  type="button"
                  aria-label="Edit Card"
                  toolTipText="Edit Card"
                  withTooltip
                  className="text-blue-500  dark:hover:bg-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 hover:text-blue-600 rounded-full p-[0.4rem] dark:text-sky-500 text-xl"
                  onClick={handleEditCard}
                >
                  {buttons.Edit.label}
                </Button>

                <Button
                  variant="plain"
                  size="lg"
                  type="button"
                  aria-label="Toggle Background Color"
                  toolTipText="Toggle Background Color"
                  withTooltip
                  className="text-blue-500   dark:hover:text-gray-300 hover:text-blue-600 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-full p-[0.4rem] dark:text-sky-500 text-2xl "
                  onClick={handleToggleBgColor}
                >
                  {toggleGradient
                    ? buttons.ToggleBgColor.label.on
                    : buttons.ToggleBgColor.label.off}
                </Button>
              </div>
            </div>
          </div>
          {/*content */}
          <div
            ref={divRef}
            className=" w-full  flex  justify-center overflow-y-auto overflow-x-hidden dark:dark-scrollbar light-scrollbar scrollbar-gutter h-full "
          >
            <div className="w-full  md:w-[42rem] md:-mr-[10px] px-4 md:px-0">
              <div ref={topElementRef} />
              <div className={`flex-1`}>
                <NoteSection
                  note={fullScreenCardData?.note ?? []}
                  showTypewriterEffect={showTypewriterEffect}
                />
                <div ref={bottomElementRef} />
              </div>
            </div>
          </div>
          {showScrollButtons &&
            (showScrollToBottomButton || showScrollToTopButton) && (
              <div
                className="absolute  md:bottom-5 bottom-4  z-[80]  w-full  md:w-[42rem] animate-opacityFadeIn"
                onAnimationEnd={(event) => event.stopPropagation()}
              >
                <div className="absolute right-4 md:bottom-4 bottom-2">
                  {showScrollToBottomButton && (
                    <Button
                      variant="plain"
                      size="md"
                      aria-label="Scroll to bottom"
                      toolTipText="Scroll to bottom"
                      withTooltip
                      className="  border-2 dark:border-gray-500 border-gray-400 rounded-full p-1 text-gray-600 dark:text-gray-300  "
                      onClick={handleScrollToTheBottom}
                    >
                      {buttons.Scroll.label.Bottom}
                    </Button>
                  )}
                  {showScrollToTopButton && (
                    <Button
                      variant="plain"
                      size="md"
                      aria-label="Scroll to top"
                      toolTipText="Scroll to top"
                      withTooltip
                      className="  border-2 dark:border-gray-500 border-gray-400 rounded-full p-1 text-gray-600 dark:text-gray-300  "
                      onClick={handleScrollToTop}
                    >
                      {buttons.Scroll.label.Top}
                    </Button>
                  )}
                </div>
              </div>
            )}
        </div>
      </article>
    </>
  );
};

export default FullScreenCardView;

const buttons = {
  Back: {
    label: (
      <>
        <IoIosArrowBack className="md:-ml-[0.8rem] -ml-[0.5rem]" />
        <p className="text-xs">Back</p>
      </>
    ),
  },
  TypingEffect: {
    label: {
      on: <TbKeyboard className="text-[1.3rem]" />,
      off: <TbKeyboardOff className="text-[1.3rem]" />,
    },
  },
  Delete: {
    label: <MdOutlineDeleteOutline />,
  },
  Edit: {
    label: <BiEdit />,
  },
  ToggleBgColor: {
    label: {
      on: <LuToggleRight />,
      off: <LuToggleLeft />,
    },
  },
  Scroll: {
    label: {
      Bottom: <HiOutlineArrowSmDown />,
      Top: <HiOutlineArrowSmUp />,
    },
  },
};

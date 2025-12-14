import React, {
  Dispatch,
  useCallback,
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
import { useAudio } from "../../context/AudioContext";
import { Descendant } from "slate";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";
import { motion } from "motion/react";
import FullScreenHeaderButtons from "./FullScreenHeaderButtons";

type ContentType = {
  note: Descendant[];
  cardId: string;
  createdAt: string;
  order: number;
};

type ContentForFullScreen = ContentType & {
  from?: string;
};

type ContentTypeForEdit = ContentType;

type propType = {
  fullScreenCardData: ContentForFullScreen | null;
  setShowFullScreen: Dispatch<React.SetStateAction<boolean>>;
  setShowScrollButtons: Dispatch<React.SetStateAction<boolean>>;
  showScrollButtons: boolean;
  handleEditCardButtonClick: (cardItem: ContentTypeForEdit) => void;
  handleDelete: () => void;
  source: "deck" | "search";
};

const FullScreenCardView = ({
  fullScreenCardData,
  setShowFullScreen,
  handleDelete,
  handleEditCardButtonClick,
  showScrollButtons,
  setShowScrollButtons,
  source,
}: propType) => {
  const { handlePlayAudio } = useAudio();
  const [isLayoutAnimationComplete, setIsLayoutAnimationComplete] =
    useState(false);
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
  // skipTyping is used to stop the typing effect when the user opens the edit
  // or delete modal, since there's no reason for the typing animation to keep
  // running in the background.

  const [skipTyping, setSkipTyping] = useState(false);

  const divRef = useRef<HTMLDivElement>(null);
  const bottomElementRef = useRef<HTMLDivElement>(null);
  const fullScreenContainer = useRef<HTMLElement>(null);
  const topElementRef = useRef<HTMLDivElement>(null);
  const prevScrollPosition = useRef(0);

  const handleBackButtonClick = useCallback(() => {
    setShowFullScreen(false);
  }, []);

  useFocusTrap(fullScreenContainer, "tab", {
    enabled: true,
    onEscape: handleBackButtonClick,
  });

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
    if (fullScreenCardData) {
      handleDelete();
      setSkipTyping(true);
    }
  }, [fullScreenCardData, handleDelete]);

  const handleEditCard = useCallback(() => {
    if (fullScreenCardData) {
      handleEditCardButtonClick(fullScreenCardData);
      setSkipTyping(true);
    }
  }, [fullScreenCardData, handleEditCardButtonClick]);

  const handleToggleBgColor = useCallback(() => {
    setToggleGradient((pre) => !pre);
    if (toggleGradient) {
      handlePlayAudio("switchOnAudioSound");
    } else {
      handlePlayAudio("switchOffAudioSound");
    }
  }, [toggleGradient, handlePlayAudio]);

  const handleOnAnimationEnd = useCallback(() => {
    if (!showScrollButtons) {
      setShowScrollButtons(true);
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
  }, [showScrollButtons]);
  return (
    <>
      <motion.article
        layoutId={`${source}-card-${fullScreenCardData?.cardId}`}
        ref={fullScreenContainer}
        transition={{
          layout: {
            type: "spring",
            stiffness: 300,
            damping: 35,
          },
        }}
        onLayoutAnimationComplete={() => {
          handleOnAnimationEnd();
          setIsLayoutAnimationComplete(true);
        }}
        className={`fixed inset-0  ${
          toggleGradient
            ? "dark:bg-BgDarkModeSmall dark:lg:bg-BgForDarkMode lg:bg-lightBg  bg-lightBgSmall"
            : "dark:bg-slate-900 bg-white"
        }     z-[80] flex flex-col items-center outline-none `}
      >
        <div className={` w-full flex flex-col items-center h-full  relative `}>
          {/* Buttons */}
          <FullScreenHeaderButtons
            handleBackButtonClick={handleBackButtonClick}
            handleDeleteCard={handleDeleteCard}
            handleEditCard={handleEditCard}
            handleToggleBgColor={handleToggleBgColor}
            setShowTypewriterEffect={setShowTypewriterEffect}
            showTypewriterEffect={showTypewriterEffect}
            toggleGradient={toggleGradient}
          />
          {/*content */}
          <div
            ref={divRef}
            tabIndex={0}
            className=" w-full  flex  justify-center overflow-y-auto overflow-x-hidden dark:dark-scrollbar light-scrollbar scrollbar-gutter h-full outline-none focus-visible:ring-2 dark:ring-blue-500 ring-gray-600 ring-inset"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.25,
                  ease: "easeOut",
                  delay: 0.1,
                },
              }}
              className="w-full  md:w-[42rem] md:-mr-[10px] px-4 md:px-0"
            >
              <div ref={topElementRef} />
              <motion.div
                initial={{
                  filter: "blur(8px)",
                  opacity: 0.5,
                }}
                animate={{
                  filter: "blur(0px)",
                  opacity: 1,
                }}
                transition={{
                  delay: 0.15,
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className={`flex-1`}
              >
                <NoteSection
                  note={fullScreenCardData?.note ?? []}
                  showTypewriterEffect={showTypewriterEffect}
                  skipTyping={skipTyping}
                  setSkipTyping={setSkipTyping}
                  isLayoutAnimationComplete={isLayoutAnimationComplete}
                />
                <div ref={bottomElementRef} />
              </motion.div>
            </motion.div>
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
      </motion.article>
    </>
  );
};

export default FullScreenCardView;

const buttons = {
  Back: {
    label: (
      <>
        <IoIosArrowBack className="md:-ml-auto -ml-[0.3rem]" />
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

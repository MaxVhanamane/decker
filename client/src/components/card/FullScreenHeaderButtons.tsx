import { easeInOut, motion } from "motion/react";
import Button from "../Button";
import { IoIosArrowBack } from "react-icons/io";
import { TbKeyboard, TbKeyboardOff } from "react-icons/tb";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { BiEdit } from "react-icons/bi";
import { LuToggleLeft, LuToggleRight } from "react-icons/lu";
import { HiOutlineArrowSmDown, HiOutlineArrowSmUp } from "react-icons/hi";
import ThemeToggler from "../ThemeToggler";
import { Dispatch, memo, SetStateAction } from "react";

type FullScreenHeaderButtonsProps = {
  handleToggleBgColor: () => void;
  handleBackButtonClick: () => void;
  handleEditCard: () => void;
  handleDeleteCard: () => void;
  showTypewriterEffect: boolean;
  toggleGradient: boolean;
  setShowTypewriterEffect: Dispatch<SetStateAction<boolean>>;
};

function FullScreenHeaderButtons({
  handleToggleBgColor,
  handleBackButtonClick,
  setShowTypewriterEffect,
  showTypewriterEffect,
  handleDeleteCard,
  handleEditCard,
  toggleGradient,
}: FullScreenHeaderButtonsProps) {
  return (
    <div
      className={` w-full flex items-center
               justify-center md:w-[42rem] `}
    >
      <div className="flex items-center justify-between  w-full md:w-[42rem] h-16  border-b dark:border-gray-300/10 border-gray-800/10 px-1 md:px-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
            delay: 0.2, // slightly earlier than stagger
          }}
        >
          <Button
            variant="plain"
            size="md"
            aria-label="Go back"
            type="button"
            onClick={handleBackButtonClick}
            className=" text-lg md:-ml-3 rounded-md"
          >
            {buttons.Back.label}
          </Button>
        </motion.div>
        <motion.div
          variants={iconWrapperVariants}
          initial="initial"
          animate="animate"
          className="flex items-center justify-center gap-1 mr-[0.35rem] md:-mr-[0.35rem] "
        >
          <motion.div variants={iconVariants}>
            <Button
              variant="plain"
              size="md"
              aria-label="Toggle typing effect"
              toolTipText="Toggle typing effect"
              withTooltip
              type="button"
              className="text-gray-600 dark:text-gray-200  dark:hover:!text-gray-100 hover:text-gray-700  dark:hover:bg-gray-700 hover:bg-gray-100 rounded-full p-[0.4rem]  "
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
          </motion.div>
          <motion.div variants={iconVariants}>
            <Button
              variant="plain"
              size="lg"
              type="button"
              aria-label="Delete Card"
              toolTipText="Delete Card"
              withTooltip
              className="text-gray-600 dark:text-gray-200 dark:hover:!text-gray-100  hover:text-gray-700   dark:hover:bg-gray-700 hover:bg-gray-100 rounded-full p-[0.4rem] text-xl"
              onClick={handleDeleteCard}
            >
              {buttons.Delete.label}
            </Button>
          </motion.div>
          <motion.div variants={iconVariants}>
            <Button
              variant="plain"
              size="lg"
              type="button"
              aria-label="Edit Card"
              toolTipText="Edit Card"
              withTooltip
              className="text-gray-600 dark:text-gray-200  dark:hover:!text-gray-100  hover:text-gray-700  dark:hover:bg-gray-700 hover:bg-gray-100  rounded-full p-[0.4rem] text-xl"
              onClick={handleEditCard}
            >
              {buttons.Edit.label}
            </Button>
          </motion.div>
          <motion.div variants={iconVariants}>
            <Button
              variant="plain"
              size="lg"
              type="button"
              aria-label="Toggle Background Color"
              toolTipText="Toggle Background Color"
              withTooltip
              className="text-gray-600 dark:text-gray-200 dark:hover:!text-gray-100  hover:text-gray-700  dark:hover:bg-gray-700 hover:bg-gray-100 rounded-full p-[0.4rem]  text-2xl "
              onClick={handleToggleBgColor}
            >
              {toggleGradient
                ? buttons.ToggleBgColor.label.on
                : buttons.ToggleBgColor.label.off}
            </Button>
          </motion.div>
          <motion.div variants={iconVariants}>
            <ThemeToggler />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default memo(FullScreenHeaderButtons);
const iconWrapperVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1, // time between each icon animation
      delayChildren: 0.3, //  delay before the first icon
    },
  },
};

const iconVariants = {
  initial: { opacity: 0, x: -10, scale: 0.9 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: easeInOut,
    },
  },
};
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

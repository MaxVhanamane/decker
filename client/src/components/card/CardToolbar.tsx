import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  memo,
  useContext,
  useState,
} from "react";
import { AiOutlineBold, AiOutlineLink } from "react-icons/ai";
import { BiCodeCurly } from "react-icons/bi";
import { BsCheckLg, BsTypeUnderline } from "react-icons/bs";
import { FaExpand } from "react-icons/fa";
import { FiMinusSquare, FiPlusSquare } from "react-icons/fi";
import { TbBulbFilled } from "react-icons/tb";
import { MdOutlineClose } from "react-icons/md";
import Tooltip from "../Tooltip";
import { AudioContext } from "../../context/AudioContext";

type PropTypes = {
  addLinkWrapper: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => void;
  addCodeBlockWrapper: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => void;
  addUnderlineTextWrapper: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => void;
  addBoldTextWrapper: (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => void;
  setShowTips: Dispatch<SetStateAction<boolean>>;
  adjustTextareaHeightOnPasteAndExpand: () => void;
  increaseTextAreaHeight: () => void;
  decreaseTextAreaHeight: () => void;
  handleClose: () => void;
};
let hoverTimer: number;

const CardToolbar = ({
  addLinkWrapper,
  addBoldTextWrapper,
  addCodeBlockWrapper,
  addUnderlineTextWrapper,
  setShowTips,
  increaseTextAreaHeight,
  decreaseTextAreaHeight,
  adjustTextareaHeightOnPasteAndExpand,
  handleClose,
}: PropTypes) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { isPlayingAudioAllowed, handlePlayAudio } = useContext(AudioContext);

  const handleMouseEnter = () => {
    hoverTimer = window.setTimeout(() => {
      setShowTooltip(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer);
    setShowTooltip(false);
  };

  const handleTouchStart = () => {
    hoverTimer = window.setTimeout(() => {
      setShowTooltip(true);
    }, 1000);
  };

  const handleTouchEnd = () => {
    clearTimeout(hoverTimer);
    setShowTooltip(false);
  };

  return (
    <div className={`flex items-center justify-center`}>
      <div className="flex items-center justify-center gap-2">
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="dark:text-gray-200 relative group/tooltip dark:hover:text-gray-400   text-gray-500 hover:text-gray-900 text-xl transition-all duration-300"
          type="button"
          name="addLinkToAddCard"
          onClick={(e) => addLinkWrapper(e)}
        >
          {showTooltip && <Tooltip toolTipText="Add a link" />}

          <AiOutlineLink />
        </button>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="dark:text-gray-200 relative group/tooltip dark:hover:text-gray-400   text-gray-500 hover:text-gray-900 text-xl transition-all duration-300"
          type="button"
          name="addCodeSnippetToAddCard"
          onClick={(e) => addCodeBlockWrapper(e)}
        >
          {showTooltip && <Tooltip toolTipText="Add code sample" />}

          <BiCodeCurly />
        </button>

        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          name="addUnderlineTextToAddCard"
          className="dark:text-gray-200 relative group/tooltip dark:hover:text-gray-400  text-gray-500 hover:text-gray-900 text-xl transition-all duration-300 "
          type="button"
          onClick={(e) => addUnderlineTextWrapper(e)}
        >
          {showTooltip && <Tooltip toolTipText="Underline text" />}

          <BsTypeUnderline />
        </button>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          name="addBoldTextToAddCard"
          className="relative group/tooltip dark:text-gray-200 dark:hover:text-gray-400  text-gray-500 hover:text-gray-900 text-xl transition-all duration-300 "
          type="button"
          onClick={(e) => addBoldTextWrapper(e)}
        >
          {showTooltip && <Tooltip toolTipText="Bold text" />}

          <AiOutlineBold />
        </button>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative group/tooltip text-yellow-400 hover:text-yellow-500  text-xl transition-all duration-300"
          type="button"
          name="tips"
          onClick={() => setShowTips(true)}
        >
          {showTooltip && <Tooltip toolTipText="Tips" />}

          <TbBulbFilled />
        </button>

        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative group/tooltip text-orange-500 hover:text-orange-600 text-xl transition-all duration-300"
          type="button"
          onClick={decreaseTextAreaHeight}
        >
          {showTooltip && <Tooltip toolTipText="Decrease Textarea Height" />}

          <FiMinusSquare />
        </button>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative group/tooltip text-green-500 hover:text-green-600  text-xl transition-all duration-300"
          type="button"
          onClick={increaseTextAreaHeight}
        >
          {showTooltip && <Tooltip toolTipText="Increase Textarea Height" />}

          <FiPlusSquare />
        </button>

        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative group/tooltip text-green-500 hover:text-green-600  text-base transition-all duration-300 mr-1 "
          type="button"
          onClick={adjustTextareaHeightOnPasteAndExpand}
        >
          {showTooltip && <Tooltip toolTipText="Expand Textarea Fully" />}

          <FaExpand />
        </button>
      </div>
      <div className="border h-4 mx-3  dark:border-gray-50/20 border-gray-500/40 "></div>
      <div className="flex items-center justify-center gap-2">
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative group/tooltip text-red-500 hover:text-red-600  text-[1.2rem] transition-all duration-300 "
          type="button"
          onClick={() => {
            handleClose();
            if (showTooltip) {
              setShowTooltip(false);
            }
            if (isPlayingAudioAllowed) {
              setTimeout(() => {
                handlePlayAudio("close");
              }, 100);
            }
          }}
        >
          {showTooltip && <Tooltip toolTipText="Close" />}

          <MdOutlineClose />
        </button>
        <button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative group/tooltip text-cyan-500 hover:text-cyan-600 text-[1.2rem] transition-all duration-300 "
          type="submit"
        >
          {showTooltip && <Tooltip toolTipText="Create Card" />}

          <BsCheckLg />
        </button>
      </div>
    </div>
  );
};

export default memo(CardToolbar);

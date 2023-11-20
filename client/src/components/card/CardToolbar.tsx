import { Dispatch, MouseEvent, SetStateAction, memo } from "react";
import { AiOutlineBold, AiOutlineLink } from "react-icons/ai";
import { BiCodeCurly } from "react-icons/bi";
import { BsTypeUnderline } from "react-icons/bs";
import { FaExpand } from "react-icons/fa";
import { FiMinusSquare, FiPlusSquare } from "react-icons/fi";
import { GoEyeClosed } from "react-icons/go";
import { TbBulbFilled } from "react-icons/tb";

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
  return (
    <div className={`flex gap-2`}>
      <button
        title="Add a link"
        className="dark:text-gray-200 dark:hover:text-gray-400   text-gray-500 hover:text-gray-900 text-xl transition-all duration-300"
        type="button"
        name="addLinkToAddCard"
        onClick={(e) => addLinkWrapper(e)}
      >
        <AiOutlineLink />
      </button>
      <button
        title="Add code sample"
        className="dark:text-gray-200 dark:hover:text-gray-400   text-gray-500 hover:text-gray-900 text-xl transition-all duration-300"
        type="button"
        name="addCodeSnippetToAddCard"
        onClick={(e) => addCodeBlockWrapper(e)}
      >
        <BiCodeCurly />
      </button>
      <button
        name="addUnderlineTextToAddCard"
        title="Underline text"
        className="dark:text-gray-200 dark:hover:text-gray-400  text-gray-500 hover:text-gray-900 text-xl transition-all duration-300 "
        type="button"
        onClick={(e) => addUnderlineTextWrapper(e)}
      >
        <BsTypeUnderline />
      </button>
      <button
        name="addBoldTextToAddCard"
        title="Bold text"
        className="dark:text-gray-200 dark:hover:text-gray-400  text-gray-500 hover:text-gray-900 text-xl transition-all duration-300 "
        type="button"
        onClick={(e) => addBoldTextWrapper(e)}
      >
        <AiOutlineBold />
      </button>
      <button
        title="Tips"
        className="text-yellow-400 hover:text-yellow-500  text-xl transition-all duration-300"
        type="button"
        name="tips"
        onClick={() => setShowTips(true)}
      >
        <TbBulbFilled />
      </button>

      <button
        title="Decrease TextArea Height"
        className="text-orange-500 hover:text-orange-600 text-xl transition-all duration-300"
        type="button"
        onClick={decreaseTextAreaHeight}
      >
        <FiMinusSquare />
      </button>
      <button
        title="Increase TextArea Height"
        className="text-green-500 hover:text-green-600  text-xl transition-all duration-300"
        type="button"
        onClick={increaseTextAreaHeight}
      >
        <FiPlusSquare />
      </button>
      <button
        title="Expand TextArea Fully"
        className="text-green-500 hover:text-green-600  text-md transition-all duration-300 ml-6"
        type="button"
        onClick={adjustTextareaHeightOnPasteAndExpand}
      >
        <FaExpand />
      </button>
      <button
        title="Close"
        className="text-red-500 hover:text-red-600  text-[1.2rem] transition-all duration-300 ml-1"
        type="button"
        onClick={handleClose}
      >
        <GoEyeClosed />
      </button>
    </div>
  );
};

export default memo(CardToolbar);

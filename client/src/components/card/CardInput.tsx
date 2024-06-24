import React, {
  Dispatch,
  FormEvent,
  KeyboardEvent,
  ReactNode,
  RefObject,
  SetStateAction,
  memo,
  useContext,
} from "react";
import { BsChevronExpand } from "react-icons/bs";
import { AudioContext } from "../../context/AudioContext";
import { GetCardsResponseType } from "../../types/types";

type PropType = {
  expandTextarea: boolean;
  handleCreateCard: (e: FormEvent) => void;
  data: GetCardsResponseType | null | undefined;
  setIsTransitioning: Dispatch<SetStateAction<boolean>>;
  setExpandTextArea: Dispatch<SetStateAction<boolean>>;
  setTitle: Dispatch<SetStateAction<string>>;
  title: string;
  note: string;
  setNote: Dispatch<SetStateAction<string>>;
  adjustTextareaHeightOnPasteAndExpand: () => void;
  children: ReactNode;
  height: number;
  textareaRef: RefObject<HTMLTextAreaElement>;
  inputElementRef: RefObject<HTMLInputElement>;
};

const CardInput = ({
  expandTextarea,
  handleCreateCard,
  data,
  setIsTransitioning,
  setExpandTextArea,
  setTitle,
  title,
  note,
  setNote,
  adjustTextareaHeightOnPasteAndExpand,
  children,
  height,
  textareaRef,
  inputElementRef,
}: PropType) => {
  const { isPlayingAudioAllowed, handlePlayAudio } = useContext(AudioContext);
  return (
    <div
      className={`${
        expandTextarea ? "mt-4" : "mt-2"
      } w-full px-4  mx-auto transition-all duration-1000  `}
    >
      <form
        onSubmit={handleCreateCard}
        className="flex flex-col  gap-4 justify-center items-center  "
      >
        {/* <label htmlFor="title" className=" font-bold text-teal-600 dark:text-sky-400">
      Card details
    </label> */}
        <div className="flex flex-col ">
          <div
            onTransitionEnd={() => {
              if (data && "cards" in data && data?.cards?.length === 0) {
                setIsTransitioning(false);
              }
            }}
            className={`transition duration-1000 delay-1000 ${
              expandTextarea
                ? "h-8 p-1 border-t-2 opacity-100"
                : "h-8 p-0 translate-y-full border-t-2"
            } flex item-center justify-end pr-4 border-r-2 border-l-2 border-teal-500 dark:border-sky-400 rounded-t-md gap-2 lg:w-[40vw] md:w-[70vw] w-[95vw] dark:bg-slate-900`}
          >
            {children}
          </div>
          <div
            onClick={() => {
              setExpandTextArea(true);
              if (isPlayingAudioAllowed && !expandTextarea) {
                setTimeout(() => {
                  handlePlayAudio("open", "/cards");
                }, 100);
              }
            }}
            className="h-10 lg:max-w-[40vw] md:max-w-[70vw] max-w-[95vw] z-10 relative"
          >
            <input
              ref={inputElementRef}
              type="text"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
              }}
              //When the user hits 'Enter' in the input field, we will first prevent the form from submitting, as hitting 'Enter' in an input
              //field typically triggers form submission by default. Afterwards, we will shift the focus from the input field to the textarea.
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  textareaRef.current?.focus();
                }
              }}
              value={title}
              readOnly={!expandTextarea}
              className={`${
                expandTextarea
                  ? "border-b-0 rounded-none text-left border-t-2 rounded-t-md mt-0"
                  : "border-b-2 border-t-2 rounded-b-md rounded-t-md text-center cursor-pointer"
              } transition-[border-radius]  h-10 px-3 py-2  pb-2 w-full  bg-[#fcfefc]  border-r-2 border-l-2  border-teal-500 dark:border-sky-400   font-semibold outline-none text-base text-gray-800   dark:bg-slate-900 dark:text-gray-50 z-10 `}
              placeholder={`${
                expandTextarea ? "Title" : "Craft an Elegant Note"
              } `}
            />
            {!expandTextarea && (
              <div className="absolute  top-1/2 -translate-y-1/2 right-8 cursor-pointer  ">
                <BsChevronExpand className="dark:text-gray-100 text-teal-600 " />
              </div>
            )}
          </div>
          <textarea
            className={` ${
              expandTextarea
                ? " py-2 border-b-2 rounded-t-0 opacity-100"
                : "py-0 border-b-2"
            } lg:w-[40vw]  md:w-[70vw] bg-[#fcfefc] w-[95vw]  border-r-2 border-l-2  border-teal-500 dark:border-sky-400 rounded-b-md  outline-none  text-gray-800 px-3 text-base  dark:bg-slate-900 dark:text-gray-50 resize-none transition-[height,padding,border] duration-1000 overflow-hidden  -mt-1 overflow-y-auto `}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setNote(e.target.value);
            }}
            ref={textareaRef}
            style={{
              height: expandTextarea ? height + "px" : "0",
            }}
            value={note}
            onPaste={adjustTextareaHeightOnPasteAndExpand}
            placeholder="Note"
          ></textarea>
        </div>
      </form>
      {data && "cards" in data && data?.cards?.length > 0 ? (
        <h1 className="font-bold text-xl text-gray-800 mt-8 mb-6 dark:text-gray-50 ">
          {data?.title}
        </h1>
      ) : null}
    </div>
  );
};

export default memo(CardInput);

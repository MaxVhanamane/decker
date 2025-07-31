import { FormEvent, forwardRef, memo } from "react";
import { FaPlus } from "react-icons/fa";
import Button from "../Button";

type PropType = {
  handleSubmit: (e: FormEvent) => Promise<void>;
};

const DeckCreationForm = memo(
  forwardRef<HTMLInputElement, PropType>(({ handleSubmit }, inputRef) => {
    return (
      <form
        onSubmit={handleSubmit}
        className="w-full flex justify-center px-4 "
      >
        <div className="relative w-96 lg:w-[26rem] max-w-full">
          <label htmlFor="title" className="sr-only">
            Deck Title
          </label>

          <input
            ref={inputRef}
            id="title"
            type="text"
            placeholder="Enter deck title (e.g. Maths, Java)"
            className="w-full pl-3 pr-14 py-3 
  bg-white dark:bg-slate-800 
  border border-gray-300 dark:border-slate-700 
  text-gray-900 dark:text-white 
  placeholder:text-gray-400 dark:placeholder:text-slate-500 
  rounded-md 
  outline-none 
     focus:border-slate-400 dark:focus:border-slate-500
  focus:ring-1 focus:ring-slate-400 dark:ring-slate-500
  transition-all  duration-200
  shadow-sm dark:shadow-inner"
          />

          <Button
            variant="unstyled"
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 
  p-2 rounded-md 
  bg-gray-200 dark:bg-slate-700 
  text-gray-600 dark:text-slate-300 
  hover:text-gray-800 dark:hover:text-white 
  hover:bg-gray-300 dark:hover:bg-slate-600 
  transition-all duration-200"
            aria-label="Create deck"
            withTooltip
            toolTipText="Create deck"
          >
            <FaPlus className="text-lg" />
          </Button>
        </div>
      </form>
    );
  })
);

export default DeckCreationForm;

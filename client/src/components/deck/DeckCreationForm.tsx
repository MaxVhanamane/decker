import { FormEvent, forwardRef, memo } from "react";

type PropType = {
  handleSubmit: (e: FormEvent) => Promise<void>;
};

const DeckCreationForm = memo(
  forwardRef<HTMLInputElement, PropType>(
    ({ handleSubmit }, inputRefElement) => {
      return (
        <div className="w-full px-4 mx-auto z-30  pointer-events-none">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
          >
            <label
              htmlFor="title"
              className="font-bold text-teal-700 dark:text-sky-400 "
            >
              Deck title
            </label>

            <input
              ref={inputRefElement}
              className=" bg-transparent  dark:border-sky-400 dark:text-white lg:w-96 w-80 max-w-full py-1 border-2 border-teal-600 outline-none focus:border-teal-700 text-gray-700 px-2 mx-4 rounded-md pointer-events-auto"
              type="text"
              id="title"
            />
            <button
              className="bg-[#459C98] dark:bg-sky-600 dark:hover:bg-sky-700  hover:bg-[#378e8a] text-gray-50 font-semibold text-center py-1 px-2 rounded-md transition-[background-color] duration-300 pointer-events-auto"
              aria-label="Add Deck"
              type="submit"
            >
              Create Deck
            </button>
          </form>
        </div>
      );
    }
  )
);

export default DeckCreationForm;

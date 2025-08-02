const EmptySearchState = () => {
  return (
    <div className="relative flex items-center justify-center z-50 w-screen text-sm font-semibold  h-[var(--window-height)] bg-white  dark:bg-slate-900">
      <div className="relative flex items-center justify-center flex-col  gap-2 lg:-top-[4rem] -top-[7rem]">
        <img
          src="/illustrations/search.svg"
          alt="Image depicting a person searching through a library of card"
          className="lg:w-44 lg:h-44 w-40 h-40  "
        />
        <p className=" text-gray-700 dark:text-gray-200 px-8">
          Find relevant content across decks and cards. Start typing to locate.
        </p>
      </div>
    </div>
  );
};

export default EmptySearchState;

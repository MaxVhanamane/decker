import { FC, RefObject, memo } from "react";

type Prop = {
  message: string;
  showPopUp: RefObject<HTMLDivElement>;
};
const PopUpMessage: FC<Prop> = ({ message, showPopUp }) => {
  return (
    <div
      ref={showPopUp}
      className={`fixed bottom-10 lg:right-20 right-7 transition duration-500 ease-in-out scale-0  w-0 h-0 border-teal-500 bg-teal-200 shadow-teal-500 text-gray-800 font-semibold rounded-lg mx-[3rem] z-50 dark:text-gray-50 p-4 dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent border shadow dark:border-sky-500 dark:shadow-sky-500 `}
    >
      <div className="flex items-center justify-center ">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default memo(PopUpMessage);

import { FC, RefObject, forwardRef, memo } from "react";

type Prop = {
  message: string;
};
const PopUpMessage = forwardRef<HTMLDivElement, Prop>(
  ({ message }, showPopUpRef) => {
    return (
      <div
        ref={showPopUpRef}
        className={`fixed bottom-10  md:right-20 right-1/2 translate-x-1/2 md:translate-x-0 transition duration-500 ease-in-out scale-0  w-0 h-0 border-teal-500 bg-teal-200 shadow-teal-500 text-gray-800 font-semibold rounded-lg  z-[90] dark:text-gray-50 p-3 dark:bg-slate-900 border shadow dark:border-sky-500 dark:shadow-sky-500 `}
      >
        <div className="flex items-center justify-center ">
          <p>{message}</p>
        </div>
      </div>
    );
  }
);

export default memo(PopUpMessage);

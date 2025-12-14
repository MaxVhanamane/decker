import { twMerge } from "tailwind-merge";

const CardItemSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={twMerge(
        "relative border overflow-hidden group/card border-gray-400 dark:border-gray-500 shadow-4-sides rounded-md px-2 lg:pt-2 pt-[0.4rem] h-[9rem] lg:h-[9.5rem] text-justify transition-[background-color,border-color,box-shadow] duration-300 group",
        className
      )}
    >
      <div className="absolute top-0 -right-1 -z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute -right-4 -top-8 h-20 w-20 origin-top-right stroke-[0.5] duration-300 text-black/10 dark:text-white/10"
        >
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute -right-4 -top-8 h-28 w-28 origin-top-right stroke-[0.4] text-black/10 duration-500 dark:text-white/10"
        >
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 flex items-center justify-between w-full py-2 px-3">
        <div className="text-xs text-gray-400">
          <div className="shimmer-skeleton w-[60px] h-3 rounded"></div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="dark:bg-slate-800 bg-gray-200 rounded-full w-6 h-6 z-50 flex items-center justify-center group/drag">
            <div className="shimmer-skeleton w-4 h-4 rounded-full"></div>
          </div>
          <div className="dark:bg-slate-800 bg-gray-200 rounded-full w-6 h-6 z-50 flex items-center justify-center group/deleteCardBtn">
            <div className="shimmer-skeleton w-4 h-4 rounded-full"></div>
          </div>
          <div className="dark:bg-slate-800 bg-gray-200 rounded-full w-6 h-6 z-50 flex items-center justify-center group/editBtn">
            <div className="shimmer-skeleton w-4 h-4 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="text-base text-gray-700 dark:text-white mb-1 p-1 line-clamp-1 break-words break-all">
        <div className="shimmer-skeleton w-4/5 h-5 rounded"></div>
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-100 p-1 break-words break-all font-extralight">
        <div className="line-clamp-3 space-y-2">
          <div className="shimmer-skeleton w-full h-4 rounded"></div>
          <div className="shimmer-skeleton w-[90%] h-4 rounded"></div>
          <div className="shimmer-skeleton w-3/4 h-4 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CardItemSkeleton;

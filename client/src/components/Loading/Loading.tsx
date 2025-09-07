import { twMerge } from "tailwind-merge";

export type LoadingProps = {
  message?: string;
  subMessage?: string;
  inSearchSuspense?: boolean;
};

export default function Loading({
  message,
  subMessage,
  inSearchSuspense,
}: LoadingProps) {
  return (
    <div
      className={twMerge(
        "flex flex-col items-center justify-center gap-4",
        localStorage.getItem("theme") === "dark" ||
          localStorage.getItem("theme") === null
          ? "dark:bg-slate-900 "
          : "bg-white",
        inSearchSuspense ? "w-screen " : "w-full"
      )}
    >
      <div
        className={twMerge(
          "flex items-center justify-center flex-col gap-4 relative ",
          inSearchSuspense && "-top-[6rem] lg:top-auto"
        )}
      >
        <div
          className="relative w-[42px] h-[42px] m-auto"
          style={{ filter: "url(#uib-jelly-triangle-ooze)" }}
        >
          {/* Top Dot */}
          <div className="absolute top-[6%] left-[30%] w-1/3 h-1/3 dark:bg-gray-300 bg-gray-400 rounded-full animate-grow0" />

          {/* Bottom Right Dot */}
          <div className="absolute bottom-[6%] right-0 w-1/3 h-1/3 dark:bg-gray-300 bg-gray-400 rounded-full animate-grow0Delay1" />

          {/* Bottom Left Dot */}
          <div className="absolute bottom-[6%] left-0 w-1/3 h-1/3 dark:bg-gray-300 bg-gray-400 rounded-full animate-grow0Delay2" />

          {/* Traveler */}
          <div className="absolute top-[6%] left-[30%] w-1/3 h-1/3 dark:bg-gray-300 bg-gray-400 rounded-full animate-triangulate" />

          {/* Gooey Filter */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <filter id="uib-jelly-triangle-ooze">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="7.3"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  
                      0 1 0 0 0  
                      0 0 1 0 0  
                      0 0 0 18 -7"
                  result="ooze"
                />
                <feBlend in="SourceGraphic" in2="ooze" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* Message Section */}
        {(message || subMessage) && (
          <div className="flex flex-col items-center text-center px-4 w-full">
            {message && (
              <h2 className="text-sm text-gray-500 dark:text-gray-200">
                {message}
              </h2>
            )}
            {subMessage && (
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                {subMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

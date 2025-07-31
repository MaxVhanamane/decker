import { twMerge } from "tailwind-merge";

type LoadingProps = {
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
        " absolute top-0 left-0 h-full flex flex-col items-center justify-center gap-4",
        localStorage.getItem("theme") === "dark" ||
          localStorage.getItem("theme") === null
          ? "dark:bg-slate-900 bg-slate-900"
          : "bg-white",
        inSearchSuspense ? "w-screen " : "w-full"
      )}
    >
      <div
        className={twMerge(
          "flex items-center justify-center flex-col relative w-full",
          inSearchSuspense && "-top-[6rem] lg:-top-16"
        )}
      >
        {/* Loading GIF */}
        <img
          onError={(e) => {
            const element = e.target as HTMLImageElement;
            element.classList.add("!text-gray-700", "dark:!text-gray-200");
          }}
          onLoad={(e) => {
            const element = e.target as HTMLImageElement;
            element.classList.add("!text-gray-700", "dark:!text-gray-200");
          }}
          className="text-transparent"
          src="/loading_dark.gif"
          alt="loading"
          width={180}
          height={180}
        />

        {/* Message Section */}
        {(message || subMessage) && (
          <div className="flex flex-col items-center text-center px-4 -mt-12 w-full">
            {message && (
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {message}
              </h2>
            )}
            {subMessage && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

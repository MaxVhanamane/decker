import { twMerge } from "tailwind-merge";
import Loading, { LoadingProps } from "./Loading";

const LoadingCentered = ({
  inSearchSuspense,
  message,
  subMessage,
}: LoadingProps) => {
  return (
    <div
      className={twMerge(
        "flex items-center justify-center h-[calc(100vh-128px)]",
        localStorage.getItem("theme") === "dark" ||
          localStorage.getItem("theme") === null
          ? "dark:bg-slate-900 "
          : "bg-white"
      )}
    >
      <Loading
        inSearchSuspense={inSearchSuspense}
        message={message}
        subMessage={subMessage}
      />
    </div>
  );
};

export default LoadingCentered;

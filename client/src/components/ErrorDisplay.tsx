import { ReactNode } from "react";

interface ErrorDisplayProps {
  theme: string | null;
  message: string | undefined | null;
  children?: ReactNode;
  status: number | undefined;
}

const ErrorDisplay = ({
  theme,
  message,
  children,
  status,
}: ErrorDisplayProps) => {
  if (message === "No internet connection") {
    return (
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-800 dark:text-gray-50 gap-4 px-3">
        <img
          src={`${
            theme === "dark"
              ? "/illustrations/no_internet_dark.svg"
              : "/illustrations/no_internet_light.svg"
          }`}
          alt="No internet "
          className="w-28 h-28 "
        />
        <p className="font-semibold text-md"> No internet connection.</p>
        {children}
      </div>
    );
  } else if (status === 500) {
    return (
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-800 dark:text-gray-50 gap-2 px-3">
        <img
          src={`${
            theme === "dark"
              ? "/illustrations/server_down_dark.svg"
              : "/illustrations/server_down_light.svg"
          }`}
          alt="Server down "
          className=" w-40 h-36 "
        />
        <div className="font-semibold text-md">
          <p> An error occurred on the server.</p>
          <p> Please try again later.</p>
        </div>
        {children}
      </div>
    );
  } else {
    const errorMessage =
      message || "An error occurred. Please try again later.";
    return (
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-800 dark:text-gray-50 gap-2 px-3">
        <img
          src={`${
            theme === "dark"
              ? "/illustrations/error_dark.svg"
              : "/illustrations/error_light.svg"
          }`}
          alt="Error "
          className=" w-40 h-40 "
        />
        <p className="font-semibold text-md"> {errorMessage}</p>
        {children}
      </div>
    );
  }
};

export default ErrorDisplay;

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-gray-800 dark:text-gray-50 gap-2 px-3">
          <img
            src={`${
              localStorage.getItem("theme") === "dark" ||
              localStorage.getItem("theme") === null
                ? "/illustrations/server_down_dark.svg"
                : "/illustrations/server_down_light.svg"
            }`}
            alt="Connection Issue Illustration"
            className=" w-40 h-36 "
          />
          <div className="font-semibold text-md dark:text-gray-200 text-gray-700 flex items-center justify-center flex-col gap-1">
            <p> Failed to load the content. </p>
            <p>
              Please check your internet connection and try refreshing the page.
            </p>
            <p>
              If the issue persists, there may be a problem with the service.
              Try again later.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className=" mt-4  inline-block  py-2.5 font-medium text-sm leading-tight  rounded  active:shadow-lg text-gray-50   w-[7.3rem]  dark:bg-sky-600 bg-teal-600 hover:bg-teal-700 dark:hover:bg-sky-700 transition-colors duration-150 ease-in-out "
            type="button"
            aria-label="Refresh"
          >
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

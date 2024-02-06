import { memo } from "react";

const Tooltip = ({ toolTipText }: { toolTipText: string }) => {
  return (
    <div
      className={`absolute hidden top-7 ${
        toolTipText === "Create Card"
          ? "-translate-x-[4.5rem] md:left-1/2 md:-translate-x-1/2"
          : "left-1/2 -translate-x-1/2"
      } group-hover/tooltip:block group-active/tooltip:block whitespace-nowrap bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-50 px-3   text-sm rounded-md z-[1000] `}
    >
      <p className="mb-1 p-1 text-center ">{toolTipText}</p>
      <svg
        className={`absolute z-10 top-[-9.5px] ${
          toolTipText === "Create Card"
            ? "right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto"
            : "right-auto left-1/2 -translate-x-1/2"
        }`}
        width="16"
        height="10"
        viewBox="0 0 16 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 0L16 10H0L8 0Z"
          className="dark:fill-gray-600 fill-gray-200"
        />
      </svg>
    </div>
  );
};

export default memo(Tooltip);

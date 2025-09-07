import React from "react";

const ChaptersSkeleton = () => {
  return (
    <div className="mt-0.5  pb-12 pt-2 mr-2">
      <ul className=" text-gray-700 dark:text-gray-200 flex items-start justify-center flex-col gap-2 ">
        {Array.from({ length: 5 }).map((_, index) => {
          return (
            <li
              key={index}
              className="dark:bg-slate-800 bg-gray-100 rounded-lg w-full h-6 shimmer-skeleton"
            ></li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChaptersSkeleton;

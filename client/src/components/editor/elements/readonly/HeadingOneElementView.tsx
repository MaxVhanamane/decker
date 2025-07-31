import { memo } from "react";

const HeadingOneElementView = ({ children }: { children: any }) => {
  return (
    <h1 className="text-2xl font-semibold dark:text-white text-gray-800">
      {children}
    </h1>
  );
};

export default memo(HeadingOneElementView);

import { memo } from "react";

const HeadingTwoElementView = ({ children }: { children: any }) => {
  return (
    <h2 className="text-lg font-semibold dark:text-white text-gray-800">
      {children}
    </h2>
  );
};

export default memo(HeadingTwoElementView);

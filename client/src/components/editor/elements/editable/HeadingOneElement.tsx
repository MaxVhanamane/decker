import { memo } from "react";
import { RenderElementProps } from "slate-react";

const HeadingOneElement = (props: RenderElementProps) => {
  return (
    <h1
      {...props.attributes}
      className="text-2xl font-semibold dark:text-white text-gray-800"
    >
      {props.children}
    </h1>
  );
};

export default memo(HeadingOneElement);

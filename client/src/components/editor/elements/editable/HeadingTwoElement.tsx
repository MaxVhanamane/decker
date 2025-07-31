import { memo } from "react";
import { RenderElementProps } from "slate-react";

const HeadingTwoElement = (props: RenderElementProps) => {
  return (
    <h2
      {...props.attributes}
      className="text-lg font-semibold dark:text-white text-gray-800"
    >
      {props.children}
    </h2>
  );
};

export default memo(HeadingTwoElement);

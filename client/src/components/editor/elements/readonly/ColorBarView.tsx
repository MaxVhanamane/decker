import type {
  ColorBarColors,
  ColorBarElement,
} from "../../../../types/textEditorTypes";
import { indentMargin } from "../../../../utils/constants";

const colorMap: Record<ColorBarElement["color"], string> = {
  neutral: "dark:border-gray-200 border-gray-700",
  yellow: "border-yellow-500",
  blue: "border-blue-500",
  green: "border-green-500",
  red: "border-red-500",
  pink: "border-pink-500",
};

const ColorBarView = ({
  children,
  color,
  element,
}: {
  children: any;
  color: ColorBarColors;
  element: ColorBarElement;
}) => {
  const { indentLevel } = element;
  const colorClass = colorMap[color];
  return (
    <p
      style={{
        marginLeft: indentLevel ? indentMargin * indentLevel : 0,
      }}
      className={`border-l-[3px] pl-3 my-2 ${colorClass}`}
    >
      {children}
    </p>
  );
};

export default ColorBarView;

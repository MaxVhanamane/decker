import { RenderElementProps } from "slate-react";
import type { ColorBarElement } from "../../../../types/textEditorTypes";

const colorMap: Record<ColorBarElement["color"], string> = {
  neutral: "dark:border-gray-200 border-gray-700",
  yellow: "border-yellow-500",
  blue: "border-blue-500",
  green: "border-green-500",
  red: "border-red-500",
  pink: "border-pink-500",
};

const ColorBar = ({ attributes, children, element }: RenderElementProps) => {
  const { color: colorKey } = element as ColorBarElement;
  const color = colorMap[colorKey];
  return (
    <p {...attributes} className={`border-l-[3px] pl-3 my-2 ${color}`}>
      {children}
    </p>
  );
};

export default ColorBar;

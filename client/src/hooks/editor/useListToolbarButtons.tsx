import { useMemo, JSX } from "react";
import Button from "../../components/Button";
import type { ListType } from "../../types/textEditorTypes";
import { twMerge } from "tailwind-merge";

type ListToolbarItem = {
  label: ListType;
  icon: JSX.Element;
  category: string;
  onClickHandler: () => void;
};

type useListToolbarButtonsProps = {
  activeStyle?: ListType | null;
  onClick: (list: ListType) => void;
};

type useListToolbarButtonsReturn<T extends "toolbar" | "commandpalette"> =
  T extends "toolbar" ? JSX.Element[] : ListToolbarItem[];

export const useListToolbarButtons = <T extends "toolbar" | "commandpalette">(
  props: useListToolbarButtonsProps & { usage: T }
): useListToolbarButtonsReturn<T> => {
  const { usage, activeStyle, onClick } = props;
  const listStyleOptions: {
    type: ListType;
    toolTipPosition: "top" | "right" | "bottom" | "left";
  }[] = [
    { type: "bulleted-list", toolTipPosition: "left" },
    { type: "numbered-list", toolTipPosition: "top" },
    { type: "alpha-upper-list", toolTipPosition: "right" },
    { type: "alpha-lower-list", toolTipPosition: "left" },
    { type: "roman-upper-list", toolTipPosition: "bottom" },
    { type: "roman-lower-list", toolTipPosition: "right" },
  ];

  const listItems = useMemo(
    () =>
      listStyleOptions.map(({ type, toolTipPosition }) => {
        if (usage === "toolbar") {
          return (
            <Button
              key={type}
              toolTipText={
                usage === "toolbar" ? "Currently applied style" : undefined
              }
              toolTipPosition={
                usage === "toolbar" ? toolTipPosition : undefined
              }
              toolTipColor={usage === "toolbar" ? "light" : undefined}
              hideTooltip={
                usage === "toolbar" ? activeStyle !== type : undefined
              }
              withTooltip={usage === "toolbar" ? true : false}
              variant="unstyled"
              className={twMerge(
                "hover:bg-white dark:hover:bg-slate-700 transition duration-300 rounded text-sm shadow-md border border-gray-300 dark:border-slate-600 relative",
                activeStyle === type &&
                  usage === "toolbar" &&
                  "ring-1 dark:ring-slate-500 dark:bg-slate-600/80 dark:hover:bg-slate-600 ring-sky-200 bg-sky-200 hover:bg-blue-300/60",
                usage === "toolbar" ? "w-12 p-2" : "w-10 p-1"
              )}
              onClick={() => onClick(type)}
            >
              <ListTypeIcon type={type} />
            </Button>
          );
        } else {
          const ListButtonPreview = (
            <div
              className={twMerge(
                "hover:bg-white dark:hover:bg-slate-700 transition duration-300 rounded text-sm shadow-md border border-gray-300 dark:border-slate-600 relative w-10 p-1"
              )}
            >
              <ListTypeIcon type={type} />
            </div>
          );
          return {
            label: type,
            icon: ListButtonPreview,
            category: "List",
            onClickHandler: () => onClick(type),
          };
        }
      }),
    [activeStyle, onClick, usage]
  );

  return listItems as useListToolbarButtonsReturn<T>;
};

const ListTypeIcon = ({ type }: { type: ListType }) => {
  const getMarkers = () => {
    switch (type) {
      case "bulleted-list":
        return ["• —", "• —"];
      case "numbered-list":
        return ["1. —", "2. —"];
      case "alpha-upper-list":
        return ["A. —", "B. —"];
      case "alpha-lower-list":
        return ["a. —", "b. —"];
      case "roman-upper-list":
        return ["I. —", "II. —"];
      case "roman-lower-list":
        return ["i. —", "ii. —"];
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col text-xs font-medium text-gray-700 dark:text-gray-200 leading-tight">
      {getMarkers().map((line, i) => (
        <span key={i} className="tracking-tight">
          {line}
        </span>
      ))}
    </div>
  );
};

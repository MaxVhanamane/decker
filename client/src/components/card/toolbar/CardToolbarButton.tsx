import { forwardRef, memo, MouseEvent, useContext } from "react";
import { IconType } from "react-icons";
import Button, { ToolTipPositionType } from "../../Button";
import { ShowToastContext } from "../../../context/ToastNotificationContext";
import { twMerge } from "tailwind-merge";
import { RiArrowDropDownLine } from "react-icons/ri";

type eventType = MouseEvent<HTMLButtonElement, globalThis.MouseEvent>;
type HTMLButtonPropsWithoutRef = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "ref"
>;

type PropType = HTMLButtonPropsWithoutRef & {
  name: string;
  onClickHandler?: (e: eventType) => void;
  toolTipText: string;
  subTooltipText?: string;
  Icon: IconType;
  className: string;
  tabIndex: number;
  disabled?: boolean;
  hideTooltip?: boolean;
  withTooltip?: boolean;
  hasDropdown?: boolean;
  toolTipPosition?: ToolTipPositionType;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
  isActive?: boolean;
  iconClassName?: string;
};

const CardToolbarButton = forwardRef<HTMLButtonElement, PropType>(
  (
    {
      name,
      onClickHandler,
      toolTipText,
      subTooltipText,
      Icon,
      className,
      tabIndex,
      disabled,
      withTooltip = false,
      hideTooltip = false,
      hasDropdown,
      mode,
      toolbarPosition,
      isActive,
      iconClassName,
      ...props
    },
    ref
  ) => {
    const { showToast } = useContext(ShowToastContext);
    const getDropdownButtonArrow = () => {
      if (hasDropdown) {
        if (
          mode === "create" ||
          (mode === "edit" && toolbarPosition === "top")
        ) {
          return (
            <RiArrowDropDownLine
              className={twMerge(
                "-ml-1 absolute -right-1 -bottom-[.15rem] text-base -rotate-45 dark:text-slate-500 text-gray-300",
                mode === "edit" &&
                  isActive &&
                  "dark:text-slate-400 text-gray-400"
              )}
            />
          );
        } else {
          return (
            <RiArrowDropDownLine
              className={twMerge(
                "-ml-1 absolute -right-1 -top-[.15rem] text-base -rotate-[145deg] dark:text-slate-500 text-gray-300",
                mode === "edit" &&
                  isActive &&
                  "dark:text-slate-400 text-gray-400"
              )}
            />
          );
        }
      } else {
        return null;
      }
    };

    return (
      <Button
        variant="unstyled"
        className={twMerge(
          className,
          disabled && mode === "create"
            ? "dark:text-gray-600 dark:hover:text-gray-600 text-gray-300 hover:text-gray-300"
            : disabled && mode === "edit"
            ? "dark:text-gray-500 dark:hover:text-gray-500 text-gray-300 hover:text-gray-300"
            : "",
          "relative"
        )}
        toolTipText={toolTipText}
        subTooltipText={subTooltipText}
        withTooltip={withTooltip}
        type={name !== "Create Card" ? "button" : "submit"}
        name={name}
        onClick={(e) => {
          if (disabled) {
            showToast({
              message: `This formatting is not available in the title.`,
              severity: "warning",
              autoHideDuration: 2000,
              position: "top-center",
              animationStyle: "scale-up",
              theme: "auto",
              progressBar: "hide",
            });
            return;
          }
          if (onClickHandler) {
            onClickHandler(e);
          }
        }}
        tabIndex={tabIndex}
        ref={ref}
        hideTooltip={hideTooltip}
        {...props}
      >
        <Icon className={iconClassName} />
        {getDropdownButtonArrow()}
      </Button>
    );
  }
);

export default memo(CardToolbarButton);

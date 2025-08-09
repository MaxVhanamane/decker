import React, { ButtonHTMLAttributes, forwardRef, memo, useRef } from "react";
import Tooltip from "./Tooltip";
import { twMerge } from "tailwind-merge";
export type ToolTipPositionType = "top" | "bottom" | "left" | "right";

type ButtonProps = React.DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  variant:
    | "primary"
    | "secondary"
    | "danger"
    | "outline"
    | "plain"
    | "unstyled";
  size?: "sm" | "md" | "lg";
  withTooltip?: boolean;
  toolTipText?: string;
  subTooltipText?: string;
  toolTipPosition?: ToolTipPositionType;
  tooltipAutoHideDuration?: number | "infinity";
  hideTooltip?: boolean;
  toolTipColor?: "light" | "medium" | "dark";
};

const baseStyles =
  "font-medium  text-center flex items-center justify-center cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 dark:ring-blue-500 ring-gray-600 ";

const roundedStyles: Record<NonNullable<ButtonProps["rounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

const variantStyles: Record<ButtonProps["variant"], string> = {
  primary:
    "bg-sky-600 dark:bg-sky-700 dark:hover:bg-sky-800  hover:bg-sky-700 text-gray-50",
  secondary:
    "dark:bg-gray-600 dark:hover:bg-gray-700 bg-gray-200 text-gray-700 hover:bg-gray-300  dark:text-gray-50 ",
  danger:
    "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white ",
  outline:
    "border border-gray-300 text-gray-700 hover:border-gray-200 hover:text-gray-500 dark:border-gray-400 dark:text-gray-50 dark:hover:text-gray-300 dark:hover:border-gray-500",
  plain:
    "dark:text-gray-200 text-gray-600 dark:hover:text-gray-400 hover:text-gray-400 bg-transparent",
  unstyled: "",
};

const sizes = {
  sm: "text-sm px-2 py-1",
  md: "text-base px-3 py-2",
  lg: "text-base px-4 py-3",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      rounded,
      children,
      toolTipText,
      subTooltipText,
      size,
      variant,
      className,
      toolTipPosition,
      tooltipAutoHideDuration,
      disabled,
      hideTooltip,
      toolTipColor,
      withTooltip = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    return toolTipText && withTooltip ? (
      <Tooltip
        toolTipText={toolTipText}
        subTooltipText={subTooltipText}
        toolTipPosition={toolTipPosition}
        tooltipAutoHideDuration={tooltipAutoHideDuration}
        containerRef={buttonRef}
        hideTooltip={hideTooltip}
        disabled={disabled}
        toolTipColor={toolTipColor}
      >
        <button
          ref={(element) => {
            buttonRef.current = element;

            if (typeof ref === "function") {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
          }}
          className={twMerge(
            baseStyles,
            variantStyles[variant],
            size && sizes[size],
            rounded && roundedStyles[rounded],
            className
          )}
          disabled={disabled}
          type={type}
          {...props}
        >
          {children}
        </button>
      </Tooltip>
    ) : (
      <button
        ref={(element) => {
          buttonRef.current = element;

          if (typeof ref === "function") {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
        }}
        className={twMerge(
          baseStyles,
          variantStyles[variant],
          size && sizes[size],
          rounded && roundedStyles[rounded],
          className
        )}
        disabled={disabled}
        type={type}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export default memo(Button);

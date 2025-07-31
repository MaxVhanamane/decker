import { memo, ReactNode, useState, useRef, useEffect, RefObject } from "react";
import ReactDOM from "react-dom";
import { twMerge } from "tailwind-merge";

// Performance optimization: Define constants outside of component
type ToolTipPositionType = "top" | "bottom" | "left" | "right";
const tooltipColors = {
  light: {
    toolTipBackground: "dark:bg-slate-300 bg-white",
    toolTipBorder: "dark:border-slate-600 border-slate-300 dark:border-2",
    svgFill: "dark:fill-slate-300 fill-white",
    svgStroke: "dark:stroke-slate-600 stroke-slate-300 fill-none dark:stroke-1",
    toolTipTextColor: "dark:text-slate-900 text-gray-800",
  },
  medium: {
    toolTipBackground: "dark:bg-slate-700 bg-slate-200",
    toolTipBorder: "dark:border-slate-500  border-slate-300",
    svgFill: "dark:fill-slate-700 fill-slate-200",
    svgStroke: "dark:stroke-slate-500  stroke-slate-300 fill-none",
    toolTipTextColor: "dark:text-slate-50 text-gray-800",
  },
  dark: {
    toolTipBackground: "dark:bg-slate-800 bg-slate-500",
    toolTipBorder: "dark:border-slate-500 border-slate-400",
    svgFill: "dark:fill-slate-800 fill-slate-500",
    svgStroke: "dark:stroke-slate-500 stroke-slate-400 fill-none",
    toolTipTextColor: "dark:text-slate-50 text-gray-50",
  },
};

// Performance optimization: Pre-define arrow styles
const arrowStyles: { [key in ToolTipPositionType]: React.CSSProperties } = {
  top: {
    bottom: "-9.5px",
    left: "50%",
    transform: "translateX(-50%) rotate(180deg)",
  },
  bottom: {
    top: "-9.5px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  left: {
    right: "-13px",
    top: "50%",
    transform: "translateY(-50%) rotate(90deg)",
  },
  right: {
    left: "-14px",
    top: "50%",
    transform: "translateY(-50%) rotate(-90deg)",
  },
};

type TooltipProps = {
  toolTipText: string;
  children: ReactNode;
  toolTipPosition?: ToolTipPositionType;
  tooltipAutoHideDuration?: number | "infinity";
  containerRef: RefObject<HTMLButtonElement | null>;
  hideTooltip?: boolean;
  disabled?: boolean | undefined;
  toolTipColor?: "light" | "medium" | "dark";
};

// Performance optimization: Memoize the component
const Tooltip = memo(
  ({
    children,
    toolTipText,
    toolTipPosition = "bottom",
    tooltipAutoHideDuration = 3000,
    hideTooltip,
    containerRef,
    disabled,
    toolTipColor = "medium",
  }: TooltipProps) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [adjustedPosition, setAdjustedPosition] =
      useState<ToolTipPositionType>(toolTipPosition);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // Performance optimization: Use separate timeouts for different purposes
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Performance optimization: Memoize handlers to prevent recreation on each render
    const handleMouseEnter = () => {
      // Performance optimization: Clear any existing timeout before setting new one
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }

      showTimeoutRef.current = setTimeout(() => {
        if (!hideTooltip && !disabled) {
          setVisible(true);
        }
      }, 500);
    };

    const handleMouseLeave = () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      setVisible(false);
    };

    // Handle the hideTooltip prop
    useEffect(() => {
      if (hideTooltip || disabled) {
        setAdjustedPosition(toolTipPosition);
        setPosition({ top: 0, left: 0 });
        setVisible(false);
      }

      // Performance optimization: Proper cleanup
      return () => {
        if (showTimeoutRef.current) {
          clearTimeout(showTimeoutRef.current);
          showTimeoutRef.current = null;
        }
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      };
    }, [hideTooltip, disabled, toolTipPosition]);

    // Calculate tooltip position
    useEffect(() => {
      if (!visible || !containerRef.current || !tooltipRef.current) return;

      const targetRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const space = 16; // Gap between target and tooltip

      let bestFit = toolTipPosition;

      // Precompute tooltip positions relative to the target element
      const positions = {
        top: {
          top: targetRect.top - tooltipRect.height - space,
          left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
        },
        bottom: {
          top: targetRect.bottom + space,
          left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
        },
        left: {
          top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
          left: targetRect.left - tooltipRect.width - space,
        },
        right: {
          top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
          left: targetRect.right + space,
        },
      };

      // Function to check if a given tooltip position stays within the visible screen
      const isInsideViewport = (position: { top: number; left: number }) => {
        const tooltipBottom = position.top + tooltipRect.height;
        const tooltipRight = position.left + tooltipRect.width;

        return (
          position.top >= 0 && // Tooltip should not go above the screen
          position.left >= 0 && // Tooltip should not go beyond the left side
          tooltipBottom <= window.innerHeight && // Tooltip should not go below the screen
          tooltipRight <= window.innerWidth // Tooltip should not go beyond the right side
        );
      };

      // If the preferred tooltip position causes overflow, find an alternative
      if (!isInsideViewport(positions[toolTipPosition])) {
        // Performance optimization: Define positions array once
        const positionTypes: ToolTipPositionType[] = [
          "top",
          "bottom",
          "left",
          "right",
        ];

        for (const pos of positionTypes) {
          if (isInsideViewport(positions[pos])) {
            bestFit = pos; // Pick the first available position that fits within the screen
            break;
          }
        }
      }

      setAdjustedPosition(bestFit);
      setPosition(positions[bestFit]);
    }, [visible, toolTipPosition, containerRef.current]);

    // Automatically hide tooltip after duration
    useEffect(() => {
      if (visible && typeof tooltipAutoHideDuration !== "string") {
        // Performance optimization: Clear existing timeout before setting new one
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        hideTimeoutRef.current = setTimeout(() => {
          setAdjustedPosition(toolTipPosition);
          setPosition({ top: 0, left: 0 });
          setVisible(false);
        }, tooltipAutoHideDuration);

        return () => {
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
          }
        };
      }
    }, [visible, tooltipAutoHideDuration, toolTipPosition]);

    // Performance optimization: Select colors once
    const colorScheme = tooltipColors[toolTipColor];

    return (
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}

        {visible &&
          ReactDOM.createPortal(
            <div
              ref={tooltipRef}
              className={twMerge(
                "absolute text-sm p-2 rounded-md whitespace-nowrap animate-[opacity_0.2s_linear] border",
                colorScheme.toolTipBackground,
                colorScheme.toolTipTextColor,
                colorScheme.toolTipBorder
              )}
              style={{
                top: position.top + window.scrollY,
                left: position.left + window.scrollX,
                zIndex: 1000,
              }}
            >
              <p className="z-20 relative text-center">{toolTipText}</p>

              <div
                className={twMerge(
                  colorScheme.toolTipBackground,
                  "absolute inset-0 rounded-md z-10"
                )}
              ></div>
              <svg
                width="32"
                height="20"
                viewBox="0 0 16 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: "absolute",
                  ...arrowStyles[adjustedPosition],
                }}
              >
                {/* Filled triangle */}
                <path d="M8 0L16 10H0L8 0Z" className={colorScheme.svgFill} />

                {/* Main triangle stroke (slightly below the top) */}
                <path
                  d="M8 0.1L16 10H0L8 0.1"
                  className={colorScheme.svgStroke}
                  strokeWidth="0.5"
                />
              </svg>
            </div>,
            document.getElementById("tooltip-portal")!
          )}
      </div>
    );
  }
);

// Performance optimization: Add displayName for better debugging
Tooltip.displayName = "Tooltip";

export default Tooltip;

{
  /* <svg
              width="16"
              height="10"
              viewBox="0 0 16 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: "absolute",
                ...arrowStyles[adjustedPosition],
              }}
            >
              <path
                d="M8 0L16 10H0L8 0Z"
                className={`${tooltipColors[toolTipColor].svgFill}`}
              />
            </svg> */
}

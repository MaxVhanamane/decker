import { memo, ReactNode, useState, useRef, useEffect, RefObject } from "react";
import ReactDOM from "react-dom";
import { twMerge } from "tailwind-merge";

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
  subTooltipText?: string;
  children: ReactNode;
  toolTipPosition?: ToolTipPositionType;
  tooltipAutoHideDuration?: number | "infinity";
  containerRef: RefObject<HTMLElement | null>;
  hideTooltip?: boolean;
  disabled?: boolean | undefined;
  toolTipColor?: "light" | "medium" | "dark";
  // New prop to customize mobile behavior
  mobileHoldDuration?: number;
};

// Utility function to detect if device is mobile/touch
const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

const Tooltip = memo(
  ({
    children,
    toolTipText,
    subTooltipText,
    toolTipPosition = "bottom",
    tooltipAutoHideDuration = 3000,
    hideTooltip,
    containerRef,
    disabled,
    toolTipColor = "medium",
    mobileHoldDuration = 500, // Duration to hold on mobile before showing tooltip
  }: TooltipProps) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [adjustedPosition, setAdjustedPosition] =
      useState<ToolTipPositionType>(toolTipPosition);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isTouch = isTouchDevice();

    // Clear all timeouts helper
    const clearAllTimeouts = () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    };

    // Desktop mouse handlers
    const handleMouseEnter = () => {
      if (isTouch) return; // Skip mouse events on touch devices

      clearAllTimeouts();
      showTimeoutRef.current = setTimeout(() => {
        if (!hideTooltip && !disabled) {
          setVisible(true);
        }
      }, 500);
    };

    const handleMouseLeave = () => {
      if (isTouch) return; // Skip mouse events on touch devices

      clearAllTimeouts();
      setVisible(false);
    };

    // Mobile touch handlers
    const handleTouchStart = () => {
      if (!isTouch) return; // Skip touch events on non-touch devices

      clearAllTimeouts();

      touchTimeoutRef.current = setTimeout(() => {
        if (!hideTooltip && !disabled) {
          setVisible(true);
        }
      }, mobileHoldDuration);
    };

    const handleTouchEnd = () => {
      if (!isTouch) return; // Skip touch events on non-touch devices

      clearAllTimeouts();

      // Hide tooltip after a short delay on touch end
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 100);
    };

    const handleTouchMove = () => {
      if (!isTouch) return; // Skip touch events on non-touch devices

      // If user moves finger while holding, cancel the tooltip
      clearAllTimeouts();
      setVisible(false);
    };

    // Handle the hideTooltip prop
    useEffect(() => {
      if (hideTooltip || disabled) {
        setAdjustedPosition(toolTipPosition);
        setPosition({ top: 0, left: 0 });
        setVisible(false);
      }

      return () => {
        clearAllTimeouts();
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

    const colorScheme = tooltipColors[toolTipColor];

    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchCancel={handleTouchEnd} // Handle touch cancel same as touch end
        onFocus={(e) => {
          if (e.target.matches(":focus-visible")) {
            handleMouseEnter();
          }
        }}
        onBlur={handleMouseLeave}
        style={{
          // Prevent text selection on mobile during long press
          WebkitUserSelect: "none",
          userSelect: "none",
          // Prevent default touch behaviors
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {children}

        {visible &&
          ReactDOM.createPortal(
            <div
              ref={tooltipRef}
              className={twMerge(
                "absolute text-sm p-2 rounded-md whitespace-nowrap animate-[opacity_0.2s_linear] border pointer-events-none",
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
              <p className="z-20 relative text-center text-xs font-light">
                {subTooltipText}
              </p>

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

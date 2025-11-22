import {
  RefObject,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { useClickOutside } from "../../../hooks/utility/useClickOutside";
import { useFocusTrap } from "../../../hooks/utility/useFocusTrap";
import { useIsDeviceType } from "../../../hooks/utility/useIsDeviceType";
import { SidebarContex } from "../../../context/SidebarContext";

type FloatingDropdownProps = {
  buttonRef: RefObject<HTMLElement>;
  onClickOutside: () => void;
  children: React.ReactNode;
  labelledBy: string;
  className?: string;
  title?: string;
  mode: "create" | "edit";
  toolbarPosition: "top" | "bottom";
};

export const FloatingDropdown = ({
  buttonRef,
  onClickOutside,
  children,
  className,
  title,
  labelledBy,
  mode,
  toolbarPosition,
}: FloatingDropdownProps) => {
  const { isSidebarOpen } = useContext(SidebarContex);
  const belowTabDimension = useIsDeviceType("tablet");
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    arrowOffset: 0,
    placeAbove: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Only adjust for sidebar dimension when opening the dropdown while creating a card, not while editing, because the editing component’s position is not affected by the sidebar’s existence
  const sidebarDimensions =
    !belowTabDimension && mode === "create" ? (isSidebarOpen ? 256 : 52) : 0;

  useClickOutside(dropdownRef, true, onClickOutside, {
    excludeRefs: [buttonRef],
    eventType: "mousedown",
  });
  useFocusTrap(dropdownRef, "both", {
    onEscape: onClickOutside,
  });

  const calculatePosition = () => {
    const dropdownEl = dropdownRef.current;
    const buttonEl = buttonRef.current;
    if (!dropdownEl || !buttonEl) return;

    const dropdownWidth = dropdownEl.offsetWidth;
    const dropdownHeight = dropdownEl.offsetHeight;
    const buttonRect = buttonEl.getBoundingClientRect();

    const container = document.getElementById("cardsMainContainer");
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;

    const padding = 5; // distance to keep from screen edges

    // Calculate horizontal position and clamp it within viewport width
    let left =
      buttonRect.left +
      buttonRect.width / 2 -
      dropdownWidth / 2 -
      sidebarDimensions +
      scrollLeft;

    const minLeft = padding;
    const maxLeft = window.innerWidth - dropdownWidth - padding;
    left = Math.min(Math.max(left, minLeft), maxLeft);

    // Offset for arrow so it stays aligned with the button
    const arrowOffset =
      buttonRect.left + buttonRect.width / 2 - left - sidebarDimensions;

    // Available space above and below the button
    const spaceBelow = window.innerHeight - buttonRect.bottom - padding;
    const spaceAbove = buttonRect.top - padding;

    // Adjustments based on mode
    const scrollAdjust = mode === "edit" ? 0 : scrollTop;
    const svgArrowHeight = 30;
    const margin = 18;

    // Possible top positions for dropdown
    const topBelow =
      mode === "edit"
        ? buttonRect.bottom + margin
        : buttonRect.bottom + scrollAdjust;

    const topAbove =
      mode === "edit"
        ? buttonRect.top - dropdownHeight - margin
        : buttonRect.top + scrollTop - dropdownHeight - svgArrowHeight;

    const minTop = padding;
    const maxTop = window.innerHeight - dropdownHeight - padding;

    let top;
    let placeAbove = false;

    // 1. Prefer placing dropdown below if it fits fully within viewport height
    if (topBelow + dropdownHeight <= window.innerHeight - padding) {
      top = topBelow;
      placeAbove = false;

      // 2. Otherwise, place it above if it fits fully
    } else if (topAbove >= padding) {
      top = topAbove;
      placeAbove = true;

      // 3. If neither side fits fully, choose the side with more space
    } else {
      if (spaceBelow >= spaceAbove) {
        // Place below, but clamp to avoid overflow
        top = Math.min(topBelow, maxTop);
        placeAbove = false;
      } else {
        // Place above, but clamp to avoid overflow
        top = Math.max(topAbove, minTop);
        placeAbove = true;
      }
    }

    // Edge case: dropdown taller than viewport
    if (maxTop < minTop) {
      top = minTop; // anchor at the very top
    }

    setPosition({
      top: top,
      left,
      arrowOffset,
      placeAbove, // used for flipping arrow
    });
  };

  const throttledResizeHandler = () => {
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }
    throttleTimeoutRef.current = setTimeout(calculatePosition, 200);
  };

  useLayoutEffect(() => {
    calculatePosition();
    window.addEventListener("resize", throttledResizeHandler);
    return () => {
      window.removeEventListener("resize", throttledResizeHandler);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  const getTopValue = () => {
    if (mode === "create") {
      return -64;
    } else {
      return 0;
    }
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        top: `${position.top + getTopValue()}px`,
        left: `${position.left}px`,
      }}
      className={twMerge(
        "absolute dark:text-gray-50 rounded-md p-5 pt-4 shadow-lg dark:shadow-md border border-gray-300 dark:border-slate-600 dark:bg-slate-800 bg-gray-50 dark:shadow-slate-800 outline-none",
        className
      )}
      role="menu"
      aria-labelledby={labelledBy}
    >
      {title && (
        <p className="w-full text-sm font-semibold text-center z-20 dark:text-gray-300 text-gray-800">
          {title}
        </p>
      )}
      <div className="absolute top-0 left-0 w-full h-full bg-gray-50 dark:bg-slate-800 rounded-md z-10" />

      {/* Arrow positioning based on mode */}
      <div
        className={twMerge(
          "absolute z-0 transform -translate-x-1/2",
          (mode === "edit" && toolbarPosition === "bottom") ||
            position.placeAbove
            ? "-bottom-[16px] rotate-180"
            : "-top-[16px]"
        )}
        style={{
          left: `${position.arrowOffset}px`,
        }}
      >
        <svg width="32" height="20" viewBox="0 0 16 10" fill="none">
          <path
            d="M8 0L16 10H0L8 0Z"
            className="fill-gray-50 dark:fill-slate-800"
          />
          <path
            d="M8 0.1L16 10H0L8 0.1"
            className="stroke-gray-300 dark:stroke-slate-600 fill-none"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      <div className="z-20 relative">{children}</div>
    </div>
  );
};

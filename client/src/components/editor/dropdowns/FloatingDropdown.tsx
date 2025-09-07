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
  const [position, setPosition] = useState({ top: 0, left: 0, arrowOffset: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarDimensions = !belowTabDimension ? (isSidebarOpen ? 256 : 52) : 0;

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
    let parent;
    if (mode === "create") {
      parent = document.querySelector("[data-editor-parent-create]");
    } else {
      parent = document.querySelector("[data-editor-parent-edit]");
    }

    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const padding = 3;

    // Ideal centered position for dropdown
    let left =
      buttonRect.left +
      buttonRect.width / 2 -
      dropdownWidth / 2 -
      sidebarDimensions;

    // Clamp within parent with padding
    const minLeft = parentRect.left + padding;
    const maxLeft = parentRect.right - dropdownWidth - padding;

    // Ensure dropdown is within parent bounds
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;

    // Set the arrow offset (always aligned with the center of the button)
    const arrowOffset =
      buttonRect.left + buttonRect.width / 2 - left - sidebarDimensions;

    // For edit mode, position above the button with same gap as create mode
    const top =
      mode === "edit" && toolbarPosition === "bottom"
        ? buttonRect.top - dropdownHeight
        : buttonRect.bottom;

    setPosition({
      top,
      left,
      arrowOffset,
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
    if (mode === "edit" && toolbarPosition === "bottom") {
      return -20;
    } else if (mode === "edit" && toolbarPosition === "top") {
      return 18;
    } else {
      return -64;
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
        "absolute dark:text-gray-50 rounded-md p-5 pt-4 shadow-lg dark:shadow-md border border-gray-300 dark:border-slate-600 dark:bg-slate-800 bg-gray-100 dark:shadow-slate-800 outline-none",
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
      <div className="absolute top-0 left-0 w-full h-full bg-gray-100 dark:bg-slate-800 rounded-md z-10" />

      {/* Arrow positioning based on mode */}
      <div
        className={`absolute z-0 transform -translate-x-1/2 ${
          mode === "edit" && toolbarPosition === "bottom"
            ? "-bottom-[16px] rotate-180"
            : "-top-[16px]"
        }`}
        style={{
          left: `${position.arrowOffset}px`,
        }}
      >
        <svg width="32" height="20" viewBox="0 0 16 10" fill="none">
          <path
            d="M8 0L16 10H0L8 0Z"
            className="fill-gray-100 dark:fill-slate-800"
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

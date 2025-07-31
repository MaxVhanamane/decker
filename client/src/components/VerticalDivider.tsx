import { memo } from "react";
import { twMerge } from "tailwind-merge";

export const VerticalDivider = memo(
  ({ hide, mode }: { hide?: boolean; mode?: "edit" | "create" }) => {
    return (
      <div
        className={twMerge(
          "border h-4 mx-2  dark:border-gray-50/30 border-gray-500/40 ",
          hide ? "hidden" : "",
          mode === "edit" && "hidden md:block"
        )}
      ></div>
    );
  }
);

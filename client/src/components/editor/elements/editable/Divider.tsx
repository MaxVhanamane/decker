import { RenderElementProps, useSelected } from "slate-react";
import type { DividerElement } from "../../../../types/textEditorTypes";
import { twMerge } from "tailwind-merge";
import { memo } from "react";

const Divider = ({ attributes, children, element }: RenderElementProps) => {
  const divider = element as DividerElement;
  const selected = useSelected();

  if (divider.dividerStyle === "plain") {
    return (
      <div
        {...attributes}
        className={twMerge(
          "flex flex-col justify-center items-center h-4 w-full relative my-4",
          selected &&
            "before:content-[''] before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:h-2 before:w-full before:dark:bg-slate-500/20 before:bg-slate-400/20 before:rounded-md before:py-2  before:z-10 before:block"
        )}
        contentEditable={false}
      >
        <div className="w-full px-1">
          <div className="w-full h-px dark:bg-slate-600/50 bg-slate-300/60" />
        </div>
        {children}
      </div>
    );
  } else if (divider.dividerStyle === "dashed") {
    return (
      <div
        {...attributes}
        className={twMerge(
          "flex flex-col justify-center items-center h-4 w-full relative my-4",
          selected &&
            "before:content-[''] before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:h-2 before:w-full before:dark:bg-slate-500/20 before:bg-slate-400/20 before:rounded-md before:py-2  before:z-10 before:block"
        )}
        contentEditable={false}
      >
        <div className="w-full px-1">
          <div className="w-full h-px bg-[repeating-linear-gradient(to_right,theme(colors.slate.300)_0px,theme(colors.slate.300)_8px,transparent_8px,transparent_16px)] dark:bg-[repeating-linear-gradient(to_right,theme(colors.slate.600)_0px,theme(colors.slate.600)_8px,transparent_8px,transparent_16px)]" />
        </div>
        {children}
      </div>
    );
  } else {
    return (
      <div
        {...attributes}
        className={twMerge(
          "flex justify-center items-center gap-3 w-full h-4 relative my-4",
          selected &&
            "before:content-[''] before:absolute before:top-1/2 before:left-0 before:-translate-y-1/2 before:h-2 before:w-full before:dark:bg-slate-500/20 before:bg-slate-400/20 before:rounded-md before:py-2  before:z-10 before:block"
        )}
        contentEditable={false}
      >
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="w-1 h-1 dark:bg-slate-400 bg-slate-500 rounded-full"
          />
        ))}
        {children}
      </div>
    );
  }
};

export default memo(Divider);

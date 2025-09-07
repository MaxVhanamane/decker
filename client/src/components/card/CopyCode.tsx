import CopyToClipboard from "react-copy-to-clipboard";
import { CodeBlockElementType } from "../../types/textEditorTypes";
import { memo, useState } from "react";
import Button from "../Button";
import { BsCheckLg } from "react-icons/bs";
import { MdContentCopy } from "react-icons/md";
import { twMerge } from "tailwind-merge";

type Props = {
  code: CodeBlockElementType[];
  variant: "editor" | "preview";
};

const getCodeString = (code: CodeBlockElementType[]): string => {
  return code
    .map((line) =>
      (line.children || [])
        .map((child) =>
          typeof child === "object" && "text" in child ? child.text : ""
        )
        .join("")
    )
    .join("\n");
};

const CopyCode = ({ code, variant }: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <div
      contentEditable={false}
      className={twMerge(
        variant === "preview"
          ? "dark:bg-slate-800 bg-gray-300 w-full h-7 rounded-tl-md rounded-tr-md absolute top-0 left-0 flex items-center justify-end"
          : "absolute top-2 right-3 border border-gray-200  dark:bg-slate-900 dark:border-slate-600 bg-white  hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md"
      )}
    >
      <CopyToClipboard
        text={getCodeString(code)}
        onCopy={() => {
          setIsCopied(true);

          setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        }}
      >
        <Button
          variant="plain"
          title="Copy code"
          aria-label="Copy code"
          size="md"
          className={twMerge(
            "flex items-center justify-center gap-1 select-none rounded-md",
            variant === "preview" ? " mr-2 " : " mr-0 py-1.5"
          )}
          disabled={isCopied}
        >
          {isCopied ? (
            <>
              <BsCheckLg
                className={twMerge(
                  "text-gray-700 dark:text-gray-200",
                  variant === "preview" ? "  " : " text-sm"
                )}
              />
              <span
                className={twMerge("text-xs", variant === "editor" && "hidden")}
              >
                Copied!
              </span>
            </>
          ) : (
            <>
              <MdContentCopy
                className={twMerge(
                  "text-gray-700 dark:text-gray-200",
                  variant === "preview" ? "  " : " text-sm"
                )}
              />
              <span
                className={twMerge("text-xs", variant === "editor" && "hidden")}
              >
                {variant === "preview" ? "Copy code" : "Copy"}
              </span>
            </>
          )}
        </Button>
      </CopyToClipboard>
    </div>
  );
};

export default memo(CopyCode);

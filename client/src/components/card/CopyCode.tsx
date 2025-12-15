import CopyToClipboard from "react-copy-to-clipboard";
import { CodeLineElement } from "../../types/textEditorTypes";
import { memo, useState } from "react";
import Button from "../Button";
import { BsCheckLg } from "react-icons/bs";
import { MdContentCopy } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "motion/react";
type Props = {
  code: CodeLineElement[];
  variant: "editor" | "preview";
};

const getCodeString = (code: CodeLineElement[]): string => {
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
const copyVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 2 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: -2 },
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
            " select-none rounded-md",
            variant === "preview" ? " mr-2 " : " mr-0 py-1.5"
          )}
          disabled={isCopied}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isCopied ? (
              <motion.div
                key="copied"
                variants={copyVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.18 }}
                className="flex items-center justify-center gap-1"
              >
                <BsCheckLg
                  className={twMerge(
                    "text-gray-700 dark:text-gray-200",
                    variant === "preview" ? "  " : " text-sm"
                  )}
                />
                <span
                  className={twMerge(
                    "text-xs",
                    variant === "editor" && "hidden"
                  )}
                >
                  Copied!
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                variants={copyVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.18 }}
                className="flex items-center justify-center gap-1"
              >
                <MdContentCopy
                  className={twMerge(
                    "text-gray-700 dark:text-gray-200",
                    variant === "preview" ? "  " : " text-sm"
                  )}
                />
                <span
                  className={twMerge(
                    "text-xs",
                    variant === "editor" && "hidden"
                  )}
                >
                  {variant === "preview" ? "Copy code" : "Copy"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </CopyToClipboard>
    </div>
  );
};

export default memo(CopyCode);

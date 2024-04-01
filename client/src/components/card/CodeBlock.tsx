import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import { BsCheckLg } from "react-icons/bs";
import { useState } from "react";

type PropType = {
  language: string;
  showTypewriterEffect: boolean;
  codeBlockValue: string;
};

const CodeBlock = ({
  language,
  showTypewriterEffect,
  codeBlockValue,
}: PropType) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className="relative top-[1.3rem]">
      <SyntaxHighlighter
        className={`${
          showTypewriterEffect ? "animate-scaleUp" : ""
        } show-scrollbar`}
        language={language}
        style={
          localStorage.getItem("theme") === "dark" ||
          localStorage.getItem("theme") === null
            ? coldarkDark
            : prism
        }
        customStyle={{
          backgroundImage: `${
            localStorage.getItem("theme") === "dark" ||
            localStorage.getItem("theme") === null
              ? "linear-gradient(to right, rgb(2 6 23 / 0.5), rgb(2 6 23 / 0.5))"
              : "linear-gradient(to right, #e5e7eb,#e5e7eb)"
          }`,
          borderRadius: 10,
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
        }}
      >
        {codeBlockValue}
      </SyntaxHighlighter>
      <div
        className={`dark:bg-slate-800 bg-gray-300 w-full h-7 rounded-tl-md rounded-tr-md absolute -top-[1.3rem] flex items-center justify-end ${
          showTypewriterEffect ? "animate-scaleUp" : ""
        } `}
      >
        <CopyToClipboard
          text={codeBlockValue}
          onCopy={() => {
            setIsCopied(true);

            setTimeout(() => {
              setIsCopied(false);
            }, 2000);
          }}
        >
          <button
            className="flex items-center justify-center gap-1  mr-2 "
            disabled={isCopied}
          >
            {isCopied ? (
              <>
                <BsCheckLg className="text-gray-700 dark:text-gray-200" />
                <span className="text-xs">Copied!</span>
              </>
            ) : (
              <>
                <MdContentCopy className="text-gray-700 dark:text-gray-200" />
                <span className="text-xs">Copy code</span>
              </>
            )}
          </button>
        </CopyToClipboard>
      </div>
    </div>
  );
};

export default CodeBlock;

import { Dispatch, memo } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface propTypes {
  setShowTips: Dispatch<React.SetStateAction<boolean>>;
}
const theme = localStorage.getItem("theme");

const Tips = ({ setShowTips }: propTypes) => {
  return (
    <div
      className={` fixed inset-0 overflow-y-auto bg-white  dark:bg-slate-950  p-4 lg:px-96 flex  flex-col z-[80] items-center dark:text-gray-200 text-gray-800   ${
        theme === "dark" || theme === null ? "dark:bg-slate-950" : "bg-white"
      }`}
    >
      <div className=" absolute top-20 md:top-24 md:w-[90%]  lg:w-1/2 h-screen  ">
        <h1 className="font bold text-xl mb-6 lg:mb-8">
          Tips on How to Make Your Card Look Beautiful
        </h1>

        <ol className="list-inside list-decimal flex gap-3 flex-col text-justify  m-4">
          <li>
            To make your text bold, enclose it with double asterisks like this
            (e.g. **your content**).
            <span className="ml-1">
              This will result in something like this:
              <strong className="font-bold dark:text-sky-400  text-sky-600 ml-1">
                your content
              </strong>
            </span>
          </li>
          <li>
            To underline your text, enclose it with a single underscore like
            this (e.g. _your content_).
            <span className="ml-1">
              This will result in something like this:
              <u className="underline decoration-pink-500 text-gray-800 dark:text-gray-200 ml-1">
                your content
              </u>
            </span>
          </li>
          <li>
            When inserting an external link, follow this format: [link
            name](actual link). You are welcome to assign any name to your link,
            for example, [myLink], but ensure the actual link is accurate
            (https://example.com).
          </li>
          <li>
            To style your code blocks elegantly, wrap the code within triple
            backticks like this ```console.log("hello world")```.
            <br />
            <span>This will result in something like this:</span>
            <SyntaxHighlighter
              language={"javascript"}
              wrapLongLines={true}
              style={theme === "dark" || theme === null ? coldarkDark : prism}
              customStyle={{
                backgroundColor: `${
                  theme === "dark" || theme === null ? "#0f172a" : "auto"
                }`,
                borderRadius: 10,
              }}
            >
              console.log("hello world")
            </SyntaxHighlighter>
          </li>
        </ol>
        <div className=" m-4 pb-16 text-justify">
          <strong className="font-bold  text-yellow-500 mr-1">Note:</strong>
          <span>
            Remember, the outermost syntax takes precedence when styles are
            combined. Avoid combining styles for clarity.
          </span>
          <p className="mt-1">Examples:</p>
          <ul className="list-disc list-inside  mt-2 ">
            <li> _ **hello**_ will result in underlined text.</li>
            <li> **_hello_** will result in bold text.</li>
            <li> ```**hello**``` will result in a code block.</li>
          </ul>
          <p className="mt-4  ">
            You can achieve the desired effects using
            <u className="underline decoration-pink-500 text-gray-800 dark:text-gray-200 mr-1 ml-1">
              the provided buttons,
            </u>
            or if you prefer,
            <u className="underline decoration-pink-500 text-gray-800 dark:text-gray-200 mr-1 ml-1">
              manually type the required syntax
            </u>
            using your keyboard.
          </p>
        </div>

        <div className="fixed top-0  py-[0.875rem] dark:bg-slate-950 border-b dark:border-gray-300/10 border-gray-800/10 bg-white px-4 left-0 w-full flex items-center justify-between lg:px-96 ">
          <div>
            <button
              onClick={() => setShowTips(false)}
              className=" text-xl rounded px-1  text-center text-gray-50 cursor-pointer bg-red-500"
              aria-label="Back"
              title="Back"
            >
              <IoIosArrowRoundBack />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Tips);

import { Dispatch, memo, useContext } from "react";
import { IoIosArrowUp, IoIosArrowBack } from "react-icons/io";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { UserContext } from "../../context/UserContext";

interface propTypes {
  setShowTips: Dispatch<React.SetStateAction<boolean>>;
  closeTipsModal: boolean;
  setCloseTipsModal: Dispatch<React.SetStateAction<boolean>>;
}
const Tips = ({
  setShowTips,
  closeTipsModal,
  setCloseTipsModal,
}: propTypes) => {
  const { theme } = useContext(UserContext);
  return (
    <div
      onAnimationEnd={() => {
        if (closeTipsModal) {
          setShowTips(false);
          setCloseTipsModal(false);
        }
      }}
      className={` fixed inset-0 overflow-y-auto bg-[#fcfefc]  dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent  p-4 lg:px-96 flex  flex-col z-[80] items-center dark:text-gray-200 text-gray-800 ${
        closeTipsModal
          ? "animate-translateFromBottomToTop scale-0 lg:animate-opacityFadeOut lg:opacity-0 lg:scale-100"
          : "animate-translateFromTopToBottom  lg:animate-quickOpacity "
      }   ${
        theme === "dark" || theme === null
          ? "dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent"
          : "bg-[#fcfefc]"
      }`}
    >
      <div className=" absolute top-20 md:top-24 md:w-[90%]  lg:w-1/2 h-screen  ">
        <h1 className="font bold text-xl mb-6 lg:mb-8">
          Tips on How to Make Your Card Look Beautiful
        </h1>

        <ol className="list-inside list-decimal flex gap-3 flex-col text-left  m-4">
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
                backgroundImage: `${
                  theme === "dark" || theme === null
                    ? "linear-gradient(to right,#0f172a,#1e293b)"
                    : "auto"
                }`,
                borderRadius: 10,
              }}
            >
              console.log("hello world")
            </SyntaxHighlighter>
          </li>
        </ol>
        <div className=" m-4 pb-16 text-left">
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

        <div className="fixed top-0  py-[1.07rem] dark:bg-gradient-to-r dark:from-slate-950   dark:to-slate-900 dark:bg-transparent border-b dark:border-gray-300/10 border-gray-800/10 bg-[#fcfefc] px-4 left-0 w-full flex items-center justify-between lg:px-96 ">
          <div>
            <button
              onClick={() => setCloseTipsModal(true)}
              className=" text-xl rounded lg:px-1  text-center dark:text-gray-200 text-gray-500 cursor-pointer flex items-center justify-center"
              aria-label="Back"
              title="Back"
            >
              <IoIosArrowUp className="lg:hidden" />
              <IoIosArrowBack className="hidden lg:block" />
              <p className="text-xs  hidden lg:block ">Back</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Tips);

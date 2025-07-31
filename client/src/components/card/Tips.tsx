// import { Dispatch, memo, useContext } from "react";
// import { IoIosArrowUp, IoIosArrowBack } from "react-icons/io";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { ThemeContext } from "../../context/ThemeContext";

// interface propTypes {
//   setShowTips: Dispatch<React.SetStateAction<boolean>>;
//   closeTipsModal: boolean;
//   setCloseTipsModal: Dispatch<React.SetStateAction<boolean>>;
// }
// const Tips = ({
//   setShowTips,
//   closeTipsModal,
//   setCloseTipsModal,
// }: propTypes) => {
//   const { theme } = useContext(ThemeContext);

//   return (
//     <div
//       onAnimationEnd={() => {
//         if (closeTipsModal) {
//           setShowTips(false);
//           setCloseTipsModal(false);
//         }
//       }}
//       className={` fixed inset-0 overflow-y-auto dark:dark-scrollbar light-scrollbar bg-white  dark:bg-slate-900  z-[80]  dark:text-gray-200 text-gray-800  ${
//         closeTipsModal
//           ? "animate-translateFromBottomToTop scale-0 lg:animate-opacityFadeOut lg:opacity-0 lg:scale-100"
//           : "animate-translateFromTopToBottom  lg:animate-quickOpacity "
//       }   ${
//         theme === "dark" || theme === null ? "dark:bg-slate-900" : "bg-white"
//       }`}
//     >
//       <section className="w-full flex flex-col items-center justify-center">
//         <div className=" h-16 dark:bg-slate-900 border-b dark:border-gray-300/10 border-gray-800/10 bg-white   flex items-center justify-start md:w-[42rem]  w-full px-4 ">
//           <button
//             onClick={() => setCloseTipsModal(true)}
//             className=" text-xl rounded text-center dark:text-gray-200 text-gray-500 cursor-pointer flex items-center justify-center"
//             aria-label="Back"
//             title="Back"
//           >
//             <IoIosArrowUp className="lg:hidden" />
//             <IoIosArrowBack className="hidden lg:block" />
//             <p className="text-xs  hidden lg:block ">Back</p>
//           </button>
//         </div>
//         <div className=" md:w-[42rem] w-full h-screen p-4 ">
//           <h1 className=" text-xl mb-5 mt-3 md:mb-8 md:mt-6 font-semibold">
//             Tips on How to Make Your Card Look Beautiful
//           </h1>

//           <ol className="list-inside list-decimal flex gap-3 flex-col text-left ">
//             <li>
//               To make your text bold, enclose it with double asterisks like this
//               (e.g. **your content**).
//               <span className="ml-1">
//                 This will result in something like this:
//                 <strong className="font-bold dark:text-sky-400  text-sky-600 ml-1">
//                   your content
//                 </strong>
//               </span>
//             </li>
//             <li>
//               To underline your text, enclose it with a single underscore like
//               this (e.g. _your content_).
//               <span className="ml-1">
//                 This will result in something like this:
//                 <u className="underline dark:decoration-teal-400 decoration-sky-500 text-gray-800 dark:text-gray-200 ml-1">
//                   your content
//                 </u>
//               </span>
//             </li>
//             <li>
//               When inserting an external link, follow this format: [link
//               name](actual link). You are welcome to assign any name to your
//               link, for example, [myLink], but ensure the actual link is
//               accurate (https://example.com).
//             </li>
//             <li>
//               To style your code blocks elegantly, wrap the code within triple
//               backticks like this ```console.log("hello world")```.
//               <br />
//               <span>This will result in something like this:</span>
//               <SyntaxHighlighter
//                 language={"javascript"}
//                 wrapLongLines={true}
//                 style={theme === "dark" || theme === null ? coldarkDark : prism}
//                 customStyle={{
//                   backgroundImage: `${
//                     theme === "dark" || theme === null
//                       ? "linear-gradient(to right, rgb(2 6 23 / 0.5), rgb(2 6 23 / 0.5))"
//                       : "auto"
//                   }`,
//                   borderRadius: 10,
//                 }}
//               >
//                 console.log("hello world")
//               </SyntaxHighlighter>
//             </li>
//           </ol>
//           <div className=" pb-16 text-left">
//             <strong className="font-bold  text-yellow-500 mr-1">Note:</strong>
//             <span>
//               Remember, the outermost syntax takes precedence when styles are
//               combined. Avoid combining styles for clarity.
//             </span>
//             <p className="mt-1">Examples:</p>
//             <ul className="list-disc list-inside  mt-2 ">
//               <li> _ **hello**_ will result in underlined text.</li>
//               <li> **_hello_** will result in bold text.</li>
//               <li> ```**hello**``` will result in a code block.</li>
//             </ul>
//             <p className="mt-4  ">
//               You can achieve the desired effects using
//               <u className="underline dark:decoration-teal-400 decoration-sky-500 text-gray-800 dark:text-gray-200 mr-1 ml-1">
//                 the provided buttons,
//               </u>
//               or if you prefer,
//               <u className="underline dark:decoration-teal-400 decoration-sky-500 text-gray-800 dark:text-gray-200 mr-1 ml-1">
//                 manually type the required syntax
//               </u>
//               using your keyboard.
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default memo(Tips);

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import shortid from "shortid";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import css from "highlight.js/lib/languages/css";
import html from "highlight.js/lib/languages/xml"; // HTML language is defined under XML
import php from "highlight.js/lib/languages/php";
import go from "highlight.js/lib/languages/go";
import swift from "highlight.js/lib/languages/swift";
import csharp from "highlight.js/lib/languages/csharp";

// Register the languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", html);
hljs.registerLanguage("php", php);
hljs.registerLanguage("go", go);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("csharp", csharp);

const parseNote = (noteString: string) => {
  return new Promise<React.ReactNode[]>((resolve, reject) => {
    setTimeout(() => {
      try {
        // Regular expression to match code blocks, underlined text, links, and bold text
        const combinedRegex =
          /```([\s\S]+?)```|_([^_]+)_|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
        let currentIndex = 0;
        let result: React.ReactNode[] = [];
        let match;

        while ((match = combinedRegex.exec(noteString)) !== null) {
          const codeBlock = match[1]; // Extract the code block captured by group 1
          const underlineText = match[2]; // Extract the underlined text captured by group 2
          const linkName = match[3]; // Extract the link name captured by group 3
          const href = match[4]; // Extract the link URL captured by group 4
          const boldText = match[5]; // Extract the bold text captured by group 5
          const startIndex = match.index; // Starting index of the matched text
          const endIndex = startIndex + match[0].length; // Ending index of the matched text

          result.push(noteString.substring(currentIndex, startIndex)); // Push the normal text before the matched part

          if (codeBlock !== undefined) {
            const detectedLanguage = detectLanguage(codeBlock);
            const language = detectedLanguage || "javascript";
            // If a code block is matched
            result.push(
              <SyntaxHighlighter
                key={shortid.generate()}
                language={language}
                wrapLongLines={true}
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
                      : "auto"
                  }`,
                  borderRadius: 10,
                }}
              >
                {codeBlock}
              </SyntaxHighlighter>
            );
          } else if (underlineText !== undefined) {
            // If underlined text is matched
            result.push(
              <u
                className="underline dark:decoration-teal-400 decoration-sky-500 text-gray-800 dark:text-gray-200"
                key={shortid.generate()}
              >
                {underlineText}
              </u>
            );
          } else if (linkName !== undefined && href !== undefined) {
            // If a link is matched
            result.push(
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                key={shortid.generate()}
              >
                <p className="text-left text-blue-600 truncate">
                  <span
                    className="dark:text-gray-50 text-gray-800 cursor-text"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {linkName === "link name" ? "Link- " : `${linkName}- `}
                  </span>
                  <span className="underline underline-offset-2 text-blue-600 ">
                    {href}
                  </span>
                </p>
              </a>
            );
          } else if (boldText !== undefined) {
            // If bold text is matched
            result.push(
              <strong
                className="font-semibold dark:text-teal-400  text-sky-600 "
                key={shortid.generate()}
              >
                {boldText}
              </strong>
            );
          }

          currentIndex = endIndex;
        }

        result.push(noteString.substring(currentIndex)); // Push the remaining normal text after the last match
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 0);
  });
};

export default parseNote;

// Function to detect language based on code content using highlight.js
const detectLanguage = (codeBlock: string): string | undefined => {
  const { language } = hljs.highlightAuto(codeBlock); // Use highlight.js to detect the language
  return language;
};

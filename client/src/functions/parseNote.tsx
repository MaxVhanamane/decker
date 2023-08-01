import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import shortid from "shortid";
// The parseNote function separates code from the string and adds SyntaxHighlighter for improved syntax appearance.
const parseNote = (noteString: string) => {
  // in a string (noteString) the code will be always written in (quotes) ``` code ```. so we will use regular expression to
  // extract it from string.
  const codeBlockRegex = /```([\s\S]+?)```/g;
  let currentIndex = 0;
  let result = [];
  let match;
  // the line regex.exec will match the part in string that we defined (/```([\s\S]+?)```/g).
  // regex.exe returns the first match to get all the matched string we will use while loop.
  // once it doesn't finds the match it will return null. as soon as it returns null the while loop stops.
  while ((match = codeBlockRegex.exec(noteString)) !== null) {
    // here match[0] has exact string with quotes eg. ``` console.log("hello") ```
    // but match[1] has only the code without the quotes eg. console.log("hello"). so we will use match[1] to get code block and store it in codeBlock variable.
    const codeBlock = match[1];
    // match also has index property we will use that to find out on what index it found the code.
    // suppose my string looks like this noteString="hi max ```console.log("hello")```
    // here the codeblock starts at index 7 but we need normal text as well we can use the index to get that too
    // here if we use noteString.substring(currentIndex, startIndex) we will get "hi max" .noteString.substring(0,7)
    const startIndex = match.index;
    // here we will get the endIndex so that we use it later to get remaining string.
    // here I have used match[0].length because the original string has quotes ``` your code ```. and match[0] gives us actual string
    const endIndex = startIndex + match[0].length;
    // here we will pass normal text and code

    result.push(noteString.substring(currentIndex, startIndex));
    // best styles- atelierSulphurpoolDark nightOwl atelierPlateauLight atelierCaveLight
    // best prism styles- synthwave84,coldarkDark,oneLight

    result.push(
      <SyntaxHighlighter
        key={shortid.generate()}
        language="javascript"
        wrapLongLines={true}
        style={
          localStorage.getItem("theme") === "dark" ||
          localStorage.getItem("theme") === null
            ? coldarkDark
            : prism
        }
        customStyle={{
          backgroundColor: `${
            localStorage.getItem("theme") === "dark" ||
            localStorage.getItem("theme") === null
              ? "rgb(1, 22, 39)"
              : "auto"
          }`,
        }}
      >
        {codeBlock}
      </SyntaxHighlighter>
    );
    // when loop moves to next iteration we will set endIndex as currentIndex
    currentIndex = endIndex;
  }
  // This last result.push will push the remaining string.

  result.push(noteString.substring(currentIndex));

  // extracting bold text
  let finalResult: Array<string | React.ReactElement> = [];
  // I have added bold text in ** your bold text **. so we will use regular expression to extract it.
  const boldTextRegex = /\*\*([\s\S]+?)\*\*/g;
  // The 'result' is an array that we created above. We will map over each string in it and check if there is any bold text present in it
  result.forEach((item) => {
    if (typeof item === "string") {
      let text = item;
      let index = 0;
      let match;
      while ((match = boldTextRegex.exec(text)) !== null) {
        const boldText = match[1];
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;
        finalResult.push(text.substring(index, startIndex));
        finalResult.push(
          <strong
            className="font-bold dark:text-sky-400  text-sky-600 "
            key={shortid.generate()}
          >
            {boldText}
          </strong>
        );
        index = endIndex;
      }
      finalResult.push(text.substring(index));
    } else {
      finalResult.push(item);
    }
  });

  return finalResult;
};

export default parseNote;

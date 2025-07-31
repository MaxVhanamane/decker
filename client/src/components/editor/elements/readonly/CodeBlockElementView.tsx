import React, { JSX } from "react";
import { Grammar, languages, Token, tokenize } from "prismjs";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-php";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-json";

import type {
  CodeBlockElementType,
  CustomTextType,
} from "../../../../types/textEditorTypes";
import { renderLeaf } from "../../../RichTextRenderer";
import { GiFeather } from "react-icons/gi";
import CopyCode from "../../../card/CopyCode";

interface CodeBlockProps {
  code: CodeBlockElementType[];
  language: string;
  visibleChars?: number;
  showCursor?: boolean;
}

// Helper function to get total character count for a code line
const getCodeLineCharCount = (line: CodeBlockElementType): number => {
  return (line.children || []).reduce((total, child) => {
    if (typeof child === "object" && "text" in child) {
      return total + (child.text || "").length;
    }
    return total;
  }, 0);
};

export const CodeBlockElementView: React.FC<CodeBlockProps> = ({
  code,
  language,
  visibleChars,
  showCursor = false,
}) => {
  // If visibleChars is provided, filter the code to show only visible portion
  const { visibleCode, lastVisibleLineIndex } =
    visibleChars !== undefined
      ? getVisibleCodeLines(code, visibleChars)
      : { visibleCode: code, lastVisibleLineIndex: -1 };

  return (
    <div className="relative font-mono text-sm leading-5 !my-6  !pt-[52px] dark:bg-[#09101F] bg-gray-100 rounded-md !p-6 min-h-[5rem]">
      {visibleCode.map((line, idx) => (
        <div key={idx} className="relative">
          {renderHighlightedCodeLine(line, language)}
          {showCursor && idx === lastVisibleLineIndex && (
            <GiFeather className="inline-block text-lg ml-2 -translate-y-2  rotate-12 dark:text-gray-200 text-gray-700 " />
          )}
        </div>
      ))}
      <CopyCode code={code} variant="preview" />
    </div>
  );
};

// Helper function to get visible code lines based on character count
const getVisibleCodeLines = (
  code: CodeBlockElementType[],
  visibleChars: number
): { visibleCode: CodeBlockElementType[]; lastVisibleLineIndex: number } => {
  const result: CodeBlockElementType[] = [];
  let charCount = 0;
  let lastVisibleLineIndex = -1;

  for (let i = 0; i < code.length; i++) {
    const line = code[i];
    const lineChildren = line.children || [];
    const newLineChildren: CustomTextType[] = [];
    const lineCharCount = getCodeLineCharCount(line);

    // Check if this line should be visible at all
    if (charCount >= visibleChars) {
      break;
    }

    // Check if this is the last visible line (partially or fully)
    if (charCount + lineCharCount >= visibleChars) {
      lastVisibleLineIndex = i;
    }

    for (const child of lineChildren) {
      if (typeof child === "object" && "text" in child) {
        const childText = child.text;
        const remainingChars = visibleChars - charCount;

        if (remainingChars <= 0) {
          break;
        }

        if (childText.length <= remainingChars) {
          newLineChildren.push(child);
          charCount += childText.length;
        } else {
          // Partial text node
          newLineChildren.push({
            ...child,
            text: childText.substring(0, remainingChars),
          });
          charCount += remainingChars;
          break;
        }
      }
    }

    if (newLineChildren.length > 0) {
      result.push({
        ...line,
        children: newLineChildren,
      });
    }

    // Add newline character count
    charCount += 1;

    if (charCount >= visibleChars) {
      break;
    }
  }

  return { visibleCode: result, lastVisibleLineIndex };
};

// ROBUST RENDERING APPROACH - handles all edge cases
const renderHighlightedCodeLine = (
  line: CodeBlockElementType,
  language: string
) => {
  const textNodes = line.children as CustomTextType[];
  const fullLineText = textNodes.map((c) => c.text).join("");

  // Early return for empty lines
  if (!fullLineText.trim() && fullLineText.length === 0) {
    return <span></span>;
  }

  // Create style map for character positions
  const styleMap = createStyleMap(textNodes);

  // Get the appropriate grammar, fallback to plaintext if not available
  const grammar = getGrammarSafely(language);

  // If no grammar available, render without syntax highlighting
  if (!grammar) {
    return renderWithoutSyntaxHighlighting(textNodes);
  }

  try {
    // Tokenize with error handling
    const tokens = tokenize(fullLineText, grammar);

    // Verify token integrity
    const tokenText = reconstructTextFromTokens(tokens);

    // If tokenization corrupted the text, fallback to safe rendering
    if (tokenText !== fullLineText) {
      console.warn(
        `Tokenization mismatch for language ${language}. Expected length: ${fullLineText.length}, got: ${tokenText.length}`
      );
      return renderWithSafeTokenization(
        textNodes,
        fullLineText,
        tokens,
        styleMap
      );
    }

    // Render with full syntax highlighting
    return renderTokensWithStyles(tokens, styleMap, fullLineText);
  } catch (error) {
    console.error(`Error highlighting code with language ${language}:`, error);
    return renderWithoutSyntaxHighlighting(textNodes);
  }
};

// Safe grammar getter with fallbacks
const getGrammarSafely = (language: string): Grammar | null => {
  // Language aliases mapping
  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    yml: "yaml",
    md: "markdown",
    cs: "csharp",
    cpp: "cpp",
    "c++": "cpp",
    h: "c",
    hpp: "cpp",
  };

  const normalizedLang =
    aliases[language.toLowerCase()] || language.toLowerCase();

  // Try to get the grammar
  const grammar = languages[normalizedLang];

  if (!grammar) {
    // Try common fallbacks
    const fallbacks = ["javascript", "markup", "clike"];
    for (const fallback of fallbacks) {
      if (languages[fallback]) {
        return languages[fallback];
      }
    }
  }

  return grammar || null;
};

// Create a map of character positions to their styling
const createStyleMap = (
  textNodes: CustomTextType[]
): Map<number, CustomTextType> => {
  const styleMap = new Map<number, CustomTextType>();
  let position = 0;

  for (const node of textNodes) {
    const text = node.text || "";
    for (let i = 0; i < text.length; i++) {
      styleMap.set(position + i, node);
    }
    position += text.length;
  }

  return styleMap;
};

// Render without syntax highlighting (fallback)
const renderWithoutSyntaxHighlighting = (
  textNodes: CustomTextType[]
): JSX.Element[] => {
  return textNodes.map((node, index) => (
    <React.Fragment key={index}>{renderLeaf(node)}</React.Fragment>
  ));
};

// Safe tokenization with character-by-character verification
const renderWithSafeTokenization = (
  textNodes: CustomTextType[],
  fullText: string,
  tokens: (string | Token)[],
  styleMap: Map<number, CustomTextType>
): JSX.Element[] => {
  // If tokenization is problematic, fall back to character-by-character rendering
  const elements: JSX.Element[] = [];
  let currentStyle: CustomTextType | null = null;
  let currentText = "";
  let elementIndex = 0;

  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    const style = styleMap.get(i) || { text: "" };

    if (!currentStyle || !isSameStyle(currentStyle, style)) {
      if (currentText && currentStyle) {
        elements.push(
          <React.Fragment key={elementIndex}>
            {renderLeaf({ ...currentStyle, text: currentText })}
          </React.Fragment>
        );
        elementIndex++;
      }
      currentStyle = style;
      currentText = char;
    } else {
      currentText += char;
    }
  }

  if (currentText && currentStyle) {
    elements.push(
      <React.Fragment key={elementIndex}>
        {renderLeaf({ ...currentStyle, text: currentText })}
      </React.Fragment>
    );
  }

  return elements;
};

// Reconstruct text from tokens to verify integrity
const reconstructTextFromTokens = (tokens: (string | Token)[]): string => {
  return tokens.map((token) => getTokenContent(token)).join("");
};

// Robust token content extraction with deep nesting support
const getTokenContent = (token: string | Token): string => {
  if (typeof token === "string") {
    return token;
  }

  if (token.content == null) {
    return "";
  }

  if (typeof token.content === "string") {
    return token.content;
  }

  if (Array.isArray(token.content)) {
    return token.content.map(getTokenContent).join("");
  }

  // Handle other possible content types
  return String(token.content);
};

// Render tokens with proper styling
const renderTokensWithStyles = (
  tokens: (string | Token)[],
  styleMap: Map<number, CustomTextType>,
  fullText: string
): JSX.Element[] => {
  const elements: JSX.Element[] = [];
  let globalOffset = 0;

  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
    const token = tokens[tokenIndex];
    const tokenContent = getTokenContent(token);

    // Skip empty tokens
    if (tokenContent.length === 0) {
      continue;
    }

    // Ensure we don't go beyond the original text length
    if (globalOffset >= fullText.length) {
      break;
    }

    // Trim token content if it would exceed the original text
    const maxLength = fullText.length - globalOffset;
    const trimmedContent =
      tokenContent.length > maxLength
        ? tokenContent.substring(0, maxLength)
        : tokenContent;

    const className = getTokenClassName(token);
    const styledElements = renderStyledText(
      trimmedContent,
      globalOffset,
      styleMap
    );

    elements.push(
      <span key={tokenIndex} className={className}>
        {styledElements}
      </span>
    );

    globalOffset += trimmedContent.length;
  }

  // Handle any remaining characters that weren't covered by tokens
  if (globalOffset < fullText.length) {
    const remainingText = fullText.substring(globalOffset);
    const remainingElements = renderStyledText(
      remainingText,
      globalOffset,
      styleMap
    );
    elements.push(
      <span key="remaining" className="">
        {remainingElements}
      </span>
    );
  }

  return elements;
};

// Get token class name with nested type support
const getTokenClassName = (token: string | Token): string => {
  if (typeof token === "string") {
    return "";
  }

  // Handle nested token types
  const types = [];
  if (token.type) {
    if (Array.isArray(token.type)) {
      types.push(...token.type);
    } else {
      types.push(token.type);
    }
  }

  if (token.alias) {
    if (Array.isArray(token.alias)) {
      types.push(...token.alias);
    } else {
      types.push(token.alias);
    }
  }

  return types.length > 0 ? `token ${types.join(" ")}` : "";
};

// Render text with proper styling from style map
const renderStyledText = (
  text: string,
  startOffset: number,
  styleMap: Map<number, CustomTextType>
): JSX.Element[] => {
  const elements: JSX.Element[] = [];
  let currentStyle: CustomTextType | null = null;
  let currentText = "";
  let elementIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const position = startOffset + i;
    const style = styleMap.get(position) || { text: "" };

    if (!currentStyle || !isSameStyle(currentStyle, style)) {
      if (currentText && currentStyle) {
        elements.push(
          <React.Fragment key={elementIndex}>
            {renderLeaf({ ...currentStyle, text: currentText })}
          </React.Fragment>
        );
        elementIndex++;
      }
      currentStyle = style;
      currentText = char;
    } else {
      currentText += char;
    }
  }

  if (currentText && currentStyle) {
    elements.push(
      <React.Fragment key={elementIndex}>
        {renderLeaf({ ...currentStyle, text: currentText })}
      </React.Fragment>
    );
  }

  return elements;
};

// Helper function to compare if two styles are the same
const isSameStyle = (
  style1: CustomTextType,
  style2: CustomTextType
): boolean => {
  return (
    style1.bold === style2.bold &&
    style1.italic === style2.italic &&
    style1.underline === style2.underline
  );
};

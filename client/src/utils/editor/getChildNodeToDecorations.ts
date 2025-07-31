import { Node, NodeEntry, Range, Element as SlateElement } from "slate";
import type { CodeBlockElementType } from "../../types/textEditorTypes";
import { languages, tokenize } from "prismjs";
import { normalizeTokens } from "./normalizeTokens";
/**
 * Prism.js includes these languages by default, so we don't import them:
 * - javascript (core)
 * - markup (HTML/XML base)
 * - css (core)
 * - clike (C-like syntax base for Java/C#/C++ etc.)
 * 
 * We only manually import extensions and non-core languages.
 */
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

export interface TokenRange extends Range {
    token: boolean;
    [key: string]: unknown;
}
export const getChildNodeToDecorations = ([
    block,
    blockPath,
]: NodeEntry<CodeBlockElementType>): Map<SlateElement, TokenRange[]> => {
    const nodeToDecorations = new Map<SlateElement, TokenRange[]>();
    const text = block.children.map((line) => Node.string(line)).join("\n");
    const language = block.language;
    const tokens = tokenize(text, languages[language]);
    const normalizedTokens = normalizeTokens(tokens); // make tokens flat and grouped by line
    const blockChildren = block.children as SlateElement[];

    for (let index = 0; index < normalizedTokens.length; index++) {
        const tokens = normalizedTokens[index];
        const element = blockChildren[index];

        if (!nodeToDecorations.has(element)) {
            nodeToDecorations.set(element, []);
        }

        let start = 0;
        for (const token of tokens) {
            const length = token.content.length;
            if (!length) {
                continue;
            }

            const end = start + length;

            const path = [...blockPath, index, 0];
            const range = {
                anchor: { path, offset: start },
                focus: { path, offset: end },
                token: true,
                ...Object.fromEntries(token.types.map((type) => [type, true])),
            };

            nodeToDecorations.get(element)!.push(range);

            start = end;
        }
    }

    return nodeToDecorations;
};

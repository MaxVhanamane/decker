// type CodeDetectionResult = {
//     isCode: boolean;
//     language?: string;
//     confidence: number;
// };

// export const detectCodeAndLanguage = (
//     text: string,
//     threshold = 0.4
// ): CodeDetectionResult => {
//     // Early return for empty or very short texts
//     const trimmedText = text.trim();
//     if (!trimmedText || trimmedText.length < 10) {
//         return { isCode: false, confidence: 1.0 };
//     }

//     const lines = trimmedText.split('\n').filter(line => line.trim() !== '');

//     // Better handling for single-line cases - check for strong indicators
//     if (lines.length <= 1) {
//         // Check for single-line code patterns (function calls, assignments, etc.)
//         const strongSingleLineIndicators = /^(const|let|var|import|function|\$|public|private|class|def|package|using)\s+\w+|^[a-zA-Z_$][\w$]*\s*\([^)]*\)|^<\w+[^>]*>.*<\/\w+>$/;
//         if (strongSingleLineIndicators.test(trimmedText)) {
//             // Determine language from single line
//             const language = getSingleLineLanguage(trimmedText);
//             return { isCode: true, language, confidence: 0.75 };
//         }
//         return { isCode: false, confidence: 0.9 };
//     }

//     // Language signatures with more comprehensive patterns
//     const languageSignatures: Record<string, {
//         keywords: string[],
//         regexPatterns: RegExp[],
//         fileExtensions: string[],
//         syntaxPatterns: RegExp[],
//         weight: number
//     }> = {
//         javascript: {
//             keywords: [
//                 'const ', 'let ', 'var ', 'function ', '=>', 'console.', 'document.', 'window.',
//                 'Promise', 'async ', 'await ', 'typeof ', 'undefined', 'null', 'export ', 'import ',
//                 'module.exports', 'require(', 'addEventListener', '.then(', '.catch(', 'new Promise'
//             ],
//             regexPatterns: [
//                 /(?:const|let|var)\s+\w+\s*=/, // variable declarations
//                 /function\s+\w+\s*\([\w\s,]*\)/, // function declarations
//                 /\w+\s*=\s*function\s*\([\w\s,]*\)/, // function expressions
//                 /\w+\s*=\s*\([\w\s,]*\)\s*=>/, // arrow functions
//                 /export\s+(default\s+)?(function|class|const|let|var)/, // exports
//                 /import\s+[\w\s,{}*]+\s+from\s+['"][^'"]+['"]/, // imports
//             ],
//             fileExtensions: ['.js', '.mjs', '.cjs'],
//             syntaxPatterns: [
//                 /\/\/.*$/m, // comments
//                 /for\s*\([^)]*\)\s*\{/, // for loops
//                 /if\s*\([^)]*\)\s*\{/, // if statements
//                 /}\s*else\s*\{/, // else statements
//             ],
//             weight: 1.1,
//         },
//         typescript: {
//             keywords: [
//                 'interface ', 'type ', 'as ', ': string', ': number', '<T>', 'unknown', 'any',
//                 'readonly ', 'namespace ', 'enum ', 'implements ', 'extends ', 'keyof ', 'typeof ',
//                 'Record<', 'Partial<', 'Optional<', 'Pick<', 'Omit<', 'ReturnType<'
//             ],
//             regexPatterns: [
//                 /interface\s+\w+(\s*<[^>]+>)?\s*\{/, // interface declarations
//                 /type\s+\w+(\s*<[^>]+>)?\s*=/, // type aliases
//                 /\w+<[\w\s,]+>/, // generic type usage
//                 /\w+:\s*(?:string|number|boolean|any|unknown|object|Record|Array)/, // typed variables
//                 /function\s+\w+<[^>]+>/, // generic functions
//                 /:\s*(?:Promise<|Array<|Map<|Set<)/, // common generic return types
//             ],
//             fileExtensions: ['.ts', '.d.ts'],
//             syntaxPatterns: [
//                 /export\s+(default\s+)?(interface|type|class|enum)/, // typescript exports
//                 /import\s+(?:type\s+)?[\w\s,{}*]+\s+from/, // typescript imports with type
//                 /(?:private|public|protected)\s+\w+\s*:/, // class members with types
//             ],
//             weight: 1.2,
//         },
//         jsx: {
//             keywords: [
//                 '<div', '<span', 'return (', 'React', 'useState', 'useEffect', '={', ' />',
//                 'className=', 'onClick=', 'onChange=', 'props.', 'children', 'render(',
//                 'component', '<React.'
//             ],
//             regexPatterns: [
//                 /<[A-Z]\w*/, // React components
//                 /<\w+\s+[^>]*\/>/, // self-closing tags
//                 /\w+\s*=\s*\{[^}]+\}/, // JSX attributes with expressions
//                 /return\s*\(\s*<[\w\s.]+/, // return with JSX
//                 /import\s+.*\s+from\s+['"]react(-dom)?['"]/, // React imports
//             ],
//             fileExtensions: ['.jsx'],
//             syntaxPatterns: [
//                 /<>\s*.*?\s*<\/>/, // React fragments
//                 /\{[\w\s.?:]+\}/, // JSX expressions
//                 /\{\s*\w+\s*\.\s*map\s*\(\s*\([^)]*\)\s*=>\s*</, // map function returning JSX
//             ],
//             weight: 1.4,
//         },
//         tsx: {
//             keywords: [
//                 'React.FC', 'Props', 'FC<', 'React.Component', 'JSX.', '<Component',
//                 'React.ReactNode', 'React.useState', 'React.useEffect'
//             ],
//             regexPatterns: [
//                 /interface\s+\w+Props/, // Props interface
//                 /React\.FC<\w+Props>/, // React functional component with typed props
//                 /const\s+\w+:\s*React\.FC(\<[^>]+\>)?/, // TypeScript React components
//                 /type\s+Props\s*=\s*\{/, // Props type declaration
//             ],
//             fileExtensions: ['.tsx'],
//             syntaxPatterns: [
//                 /(?:<|React\.)<.*?>\s*\(\s*\{[^}]*\}\s*\)/, // TSX components with destructured props
//                 /(?:Props|State)<\{[^}]*\}>/, // Generic props/state
//             ],
//             weight: 1.5,
//         },
//         python: {
//             keywords: [
//                 'def ', 'import ', 'from ', 'as ', 'self', 'elif', 'except', 'lambda', 'with ',
//                 'class ', 'try:', 'except:', 'finally:', 'async def', 'await ', 'yield ',
//                 '__init__', '__main__', 'if __name__', 'return ', 'print(', 'None', 'True', 'False',
//                 '@property', '@staticmethod', '@classmethod', '@decorator'
//             ],
//             regexPatterns: [
//                 /def\s+\w+\s*\([^)]*\)\s*:/, // function definitions
//                 /class\s+\w+(\([\w\s,]*\))?\s*:/, // class definitions
//                 /from\s+[\w.]+\s+import\s+[\w*,\s]+/, // imports
//                 /import\s+[\w.,\s]+/, // simple imports
//                 /with\s+[\w\s().]+\s+as\s+\w+:/, // with statements
//             ],
//             fileExtensions: ['.py', '.pyx', '.pyi'],
//             syntaxPatterns: [
//                 /#.*$/m, // comments
//                 /"""\s*[\s\S]*?\s*"""/, // docstrings
//                 /if\s+[\w\s.()!=<>]+\s*:/, // if statements
//                 /for\s+\w+\s+in\s+[\w\s().[\]]+\s*:/, // for loops
//             ],
//             weight: 1.3,
//         },
//         java: {
//             keywords: [
//                 'public ', 'class ', 'implements ', 'extends ', 'void ', 'static ', 'new ',
//                 'private ', 'protected ', 'final ', 'abstract ', 'interface ', 'package ',
//                 'import ', 'throws ', 'try {', 'catch (', 'finally {', '@Override',
//                 'System.out.', 'return ', 'this.', 'super(', 'null', 'instanceof '
//             ],
//             regexPatterns: [
//                 /public\s+class\s+\w+(\s+extends\s+\w+)?(\s+implements\s+[\w,\s]+)?\s*\{/, // class definition
//                 /public\s+(static\s+)?\w+\s+\w+\s*\([^)]*\)\s*(\{|throws)/, // method definitions
//                 /private\s+\w+(\[\])?\s+\w+\s*;/, // field declarations
//                 /package\s+[\w.]+;/, // package declarations
//                 /import\s+[\w.]+(\.\*)?;/, // import statements
//             ],
//             fileExtensions: ['.java'],
//             syntaxPatterns: [
//                 /\/\/.*$/m, // single line comments
//                 /\/\*[\s\S]*?\*\//, // multi-line comments
//                 /try\s*\{[\s\S]*?\}\s*catch\s*\([\s\S]*?\)\s*\{/, // try-catch blocks
//                 /new\s+\w+(\[\])?\s*(\([^)]*\))?/, // object instantiations
//             ],
//             weight: 1.3,
//         },
//         php: {
//             keywords: [
//                 '<?php', '$', '->', '::', 'echo ', 'function ', 'namespace ', 'use ',
//                 'public ', 'private ', 'protected ', '$this->', 'new ', 'return ',
//                 'if(', 'else{', 'foreach(', 'as ', '=>', '?>', 'array(', '<?='
//             ],
//             regexPatterns: [
//                 /<\?php/, // PHP opening tag
//                 /\$\w+\s*=/, // variable assignments
//                 /function\s+\w+\s*\([^)]*\)\s*\{/, // function declarations
//                 /class\s+\w+(\s+extends\s+\w+)?(\s+implements\s+[\w,\s]+)?\s*\{/, // class declarations
//                 /namespace\s+[\w\\]+;/, // namespace declarations
//             ],
//             fileExtensions: ['.php'],
//             syntaxPatterns: [
//                 /\/\/.*$/m, // comments
//                 /\$\w+->[\w()]+/, // object property/method access
//                 /echo\s+['"][\s\S]*?['"];/, // echo statements
//                 /\$_(?:GET|POST|REQUEST|SESSION|COOKIE|SERVER)\[['"][\w-]+['"]]/i, // superglobals
//             ],
//             weight: 1.3,
//         },
//         sql: {
//             keywords: [
//                 'SELECT ', 'INSERT ', 'UPDATE ', 'DELETE ', 'FROM ', 'WHERE ', 'JOIN ', 'GROUP BY', 'LIMIT',
//                 'ORDER BY', 'HAVING ', 'UNION ', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
//                 'INDEX', 'CONSTRAINT', 'FOREIGN KEY', 'PRIMARY KEY', 'INNER JOIN', 'LEFT JOIN',
//                 'RIGHT JOIN', 'VALUES', 'SET ', 'IN (', 'CASE WHEN', 'END AS'
//             ],
//             regexPatterns: [
//                 /SELECT\s+[\w\s,.*()`]+\s+FROM\s+[\w.`[\]]+/i, // SELECT statements
//                 /INSERT\s+INTO\s+[\w.`[\]]+\s*\([^)]*\)\s*VALUES/i, // INSERT statements
//                 /UPDATE\s+[\w.`[\]]+\s+SET\s+[\w\s=,.`'"-]+/i, // UPDATE statements
//                 /CREATE\s+TABLE\s+[\w.`[\]]+\s*\(/i, // CREATE TABLE statements
//                 /ALTER\s+TABLE\s+[\w.`[\]]+\s+ADD/i, // ALTER TABLE statements
//             ],
//             fileExtensions: ['.sql'],
//             syntaxPatterns: [
//                 /--.*$/m, // SQL comments
//                 /\/\*[\s\S]*?\*\//, // Multi-line comments
//                 /GROUP\s+BY\s+[\w\s,.`[\]]+(\s+HAVING\s+[\w\s,.`'=><-]+)?/i, // GROUP BY clauses
//                 /ORDER\s+BY\s+[\w\s,.`[\]]+\s+(ASC|DESC)/i, // ORDER BY clauses
//             ],
//             weight: 1.3,
//         },
//         html: {
//             keywords: [
//                 '<div', '<p', '<a ', '<img', '<section', '</', '/>', '<html', '<!DOCTYPE',
//                 '<head', '<body', '<script', '<style', '<link', '<meta', '<title',
//                 '<h1', '<h2', '<h3', '<ul', '<ol', '<li', '<form', '<input', '<table',
//                 'class=', 'id=', 'href=', 'src=', 'rel=', 'type='
//             ],
//             regexPatterns: [
//                 /<!DOCTYPE\s+html>/i, // DOCTYPE declaration
//                 /<html[\s>]/, // html tag
//                 /<head>[\s\S]*?<\/head>/, // head section
//                 /<body[\s>][\s\S]*?<\/body>/, // body section
//                 /<\w+\s+[^>]*>/, // tags with attributes
//             ],
//             fileExtensions: ['.html', '.htm'],
//             syntaxPatterns: [
//                 /<!--[\s\S]*?-->/, // HTML comments
//                 /<script[\s>][\s\S]*?<\/script>/, // script tags
//                 /<style[\s>][\s\S]*?<\/style>/, // style tags
//                 /<\/\w+>/, // closing tags
//             ],
//             weight: 1.1,
//         },
//         css: {
//             keywords: [
//                 'body {', 'div {', '.class', '#id', 'margin:', 'padding:', 'color:',
//                 'background:', 'font-', 'border:', 'display:', 'position:', '@media',
//                 ':hover', ':before', ':after', 'width:', 'height:', 'text-align:',
//                 'flex', 'grid', 'animation:', '@keyframes'
//             ],
//             regexPatterns: [
//                 /[\w#.:][\w-]*\s*\{[^}]*\}/, // CSS rule blocks
//                 /(@media|@keyframes|@font-face|@import)\s*[\w\s]*\{/, // CSS at-rules
//                 /[\w-]+\s*:\s*[\w\s#.,()%-]+;/, // CSS property declarations
//                 /\/\*[\s\S]*?\*\//, // CSS comments
//             ],
//             fileExtensions: ['.css', '.scss', '.less'],
//             syntaxPatterns: [
//                 /#[\w-]+\s*\{/, // ID selectors
//                 /\.[\w-]+\s*\{/, // Class selectors
//                 /\[[\w-]+([~|^$*]?=)["'][\w-]+["']\]/, // Attribute selectors
//                 /:(hover|active|focus|visited|first-child|last-child|nth-child)/, // Pseudo-classes
//             ],
//             weight: 1.1,
//         },
//         ruby: {
//             keywords: [
//                 'def ', 'end', 'class ', 'module ', 'require ', 'include ', 'attr_',
//                 'initialize', 'if ', 'else', 'elsif ', 'unless ', 'case ', 'when ',
//                 '@', '@@', 'nil', 'true', 'false', 'yield', 'super', 'self.',
//                 'do |', '{ |', '=> ', '.each', '.map', '.select'
//             ],
//             regexPatterns: [
//                 /def\s+\w+(\s*\([^)]*\))?\s*\n/m, // Method definitions
//                 /class\s+\w+(\s*<\s*\w+)?\s*\n/m, // Class definitions
//                 /module\s+\w+\s*\n/m, // Module definitions
//                 /\w+\s*=\s*\w+\.new/, // Object instantiation
//                 /\w+\.each\s+do\s+\|[\w,\s]+\|/, // Iterators with blocks
//             ],
//             fileExtensions: ['.rb', '.rake'],
//             syntaxPatterns: [
//                 /#.*$/m, // Ruby comments
//                 /=begin[\s\S]*?=end/m, // Multi-line comments
//                 /["'](?:\\.|[^"'\\])*["']/, // String literals
//                 /\w+\s*=\s*\{[^}]*\}/, // Hash assignments
//             ],
//             weight: 1.2,
//         },
//         go: {
//             keywords: [
//                 'func ', 'package ', 'import ', 'type ', 'struct ', 'interface ',
//                 'const ', 'var ', 'return ', 'if err != nil', 'defer ', 'go ',
//                 ':=', '&', '*', 'make(', 'new(', 'append(', 'len(', 'map[',
//                 'fmt.', 'error', 'context', 'chan ', 'select ', 'case ', 'for '
//             ],
//             regexPatterns: [
//                 /func\s+\w+\s*\([^)]*\)(\s+\([^)]*\))?\s*\{/, // Function declarations
//                 /type\s+\w+\s+struct\s*\{[\s\S]*?\}/, // struct definitions
//                 /package\s+\w+/, // package declarations
//                 /import\s+(\([^)]*\)|"[\w./]+")/, // import statements
//                 /\w+\s*:=\s*[\w&*{]+/, // short variable declarations
//             ],
//             fileExtensions: ['.go'],
//             syntaxPatterns: [
//                 /\/\/.*$/m, // Go comments
//                 /\/\*[\s\S]*?\*\//, // Multi-line comments
//                 /if\s+err\s+!=\s+nil\s*\{[\s\S]*?return/, // Error handling pattern
//                 /for\s+\w+,\s*\w+\s*:=\s*range\s+\w+/, // Range iterations
//             ],
//             weight: 1.2,
//         },
//         rust: {
//             keywords: [
//                 'fn ', 'struct ', 'enum ', 'impl ', 'trait ', 'pub ',
//                 'let ', 'mut ', 'match ', 'Option<', 'Result<', 'Some(',
//                 'None', 'Ok(', 'Err(', '-> ', '::', '&mut ', '&str',
//                 'Vec<', 'use ', 'mod ', 'crate::', 'async ', 'await',
//                 '#[derive', '#[test', '#[macro'
//             ],
//             regexPatterns: [
//                 /fn\s+\w+\s*(<[^>]*>)?\s*\([^)]*\)(\s*->\s*[^{]+)?\s*\{/, // Function declarations
//                 /struct\s+\w+(\s*<[^>]*>)?\s*\{[\s\S]*?\}/, // Struct definitions
//                 /impl(\s+<[^>]*>)?\s+\w+(\s+for\s+\w+)?\s*\{/, // Implementations
//                 /let\s+mut\s+\w+\s*:\s*[\w<>:,\s]+\s*=/, // Mutable variable declarations
//                 /\w+::\w+(<[\w\s,:]+>)?/, // Path expressions
//             ],
//             fileExtensions: ['.rs'],
//             syntaxPatterns: [
//                 /\/\/.*$/m, // Rust comments
//                 /\/\*[\s\S]*?\*\//, // Multi-line comments
//                 /#\[[\w\s()"=,]+\]/, // Attributes
//                 /match\s+\w+\s*\{[\s\S]*?\}/, // Match expressions
//             ],
//             weight: 1.2,
//         },
//         c: {
//             keywords: [
//                 '#include', '#define', 'int ', 'char ', 'void ', 'struct ',
//                 'typedef', 'const ', 'static ', 'return ', 'if(', 'else{',
//                 'for(', 'while(', 'switch(', 'case ', 'break;', 'continue;',
//                 'malloc(', 'free(', 'printf(', 'scanf(', '*', '&', '->'
//             ],
//             regexPatterns: [
//                 /#include\s+[<"][\w./]+[>"]/, // Include directives
//                 /#define\s+\w+(\([^)]*\))?\s+[\w\s()+*/&|^-]+/, // Macro definitions
//                 /\w+\s+\w+\s*\([^)]*\)\s*\{/, // Function definitions
//                 /struct\s+\w+\s*\{[\s\S]*?\}\s*;/, // Struct definitions
//                 /typedef\s+struct(\s+\w+)?\s*\{[\s\S]*?\}\s*\w+\s*;/, // Typedef struct
//             ],
//             fileExtensions: ['.c', '.h'],
//             syntaxPatterns: [
//                 /\/\/.*$/m, // C comments
//                 /\/\*[\s\S]*?\*\//, // Multi-line comments
//                 /\w+\s*\*+\s*\w+/, // Pointer declarations
//                 /struct\s+\w+\s*\*\s*\w+/, // Struct pointer declarations
//             ],
//             weight: 1.2,
//         },
//         cpp: {
//             keywords: [
//                 '#include', 'class ', 'namespace ', 'template<', 'public:', 'private:',
//                 'protected:', 'virtual ', 'operator ', 'new ', 'delete ', 'const ',
//                 'std::', 'vector<', 'string ', 'using ', 'auto ', 'nullptr',
//                 'bool ', 'try {', 'catch (', 'throw ', '::~'
//             ],
//             regexPatterns: [
//                 /class\s+\w+(\s*:\s*(public|private|protected)\s+\w+)?\s*\{/, // Class definitions
//                 /namespace\s+\w+\s*\{/, // Namespace definitions
//                 /template\s*<[\w\s,]+>/, // Template declarations
//                 /std::\w+<[\w\s:,*&<>]+>/, // STL container usage
//                 /\w+::\w+(\([^)]*\))?/, // Scope resolution
//             ],
//             fileExtensions: ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
//             syntaxPatterns: [
//                 /\/\/.*$/m, // C++ comments
//                 /\/\*[\s\S]*?\*\//, // Multi-line comments
//                 /virtual\s+\w+\s+\w+\s*\([^)]*\)\s*(const\s*)?(=\s*0)?/, // Virtual methods
//                 /operator\s*[\w()]+\s*\([^)]*\)/, // Operator overloading
//             ],
//             weight: 1.3,
//         },
//         csharp: {
//             keywords: [
//                 'using ', 'namespace ', 'class ', 'public ', 'private ', 'protected ',
//                 'static ', 'void ', 'string ', 'int ', 'bool ', 'var ', 'async ',
//                 'await ', 'Task<', 'List<', 'Dictionary<', 'IEnumerable<',
//                 'get;', 'set;', '=> ', 'new ', 'override ', 'virtual ',
//                 'interface ', 'abstract ', 'sealed ', 'partial '
//             ],
//             regexPatterns: [
//                 /namespace\s+[\w.]+\s*\{/, // Namespace declarations
//                 /class\s+\w+(\s*:\s*[\w,\s]+)?\s*\{/, // Class declarations
//                 /public\s+(static\s+)?\w+(\s+\w+\s*\([^)]*\)|\s+\w+\s*\{\s*get;(\s*private\s*)?set;\s*\})/, // Public members
//                 /\[[\w]+(\s*\([^)]*\))?\]/, // Attributes
//                 /using\s+[\w.]+;/, // Using directives
//             ],
//             fileExtensions: ['.cs'],
//             syntaxPatterns: [
//                 /\/\/.*$/m, // C# comments
//                 /\/\*[\s\S]*?\*\//, // Multi-line comments
//                 /public\s+(abstract\s+|virtual\s+|override\s+)?\w+[\s\w<>,]+\s+\w+\s*\(/, // Method declarations
//                 /\w+\s*\?\s*\w+/, // Nullable types
//             ],
//             weight: 1.3,
//         },
//         shell: {
//             keywords: [
//                 '#!/bin', '#!/usr', 'export ', 'echo ', 'if [', 'then', 'else', 'fi', 'for ',
//                 'while ', 'do', 'done', 'case ', 'esac', 'function ', 'return ',
//                 'cd ', 'ls ', 'grep ', 'sed ', 'awk ', 'cat ', 'chmod ', 'mkdir ',
//                 '$', '${', '$(', '| ', '|| ', '&& ', '> ', '>> ', '< '
//             ],
//             regexPatterns: [
//                 /^#!\/bin\/(ba|z|k|c|tc)?sh/, // Shebang
//                 /\$\{[\w_]+\}/, // Variable expansions
//                 /\$\([\w\s\-.$|&;()<>]+\)/, // Command substitution
//                 /\w+=["']?[\w\s\-./${}*]+["']?/, // Variable assignments
//                 /if\s+\[\s+.+\s+\]\s*;\s*then/, // If statements
//             ],
//             fileExtensions: ['.sh', '.bash', '.zsh'],
//             syntaxPatterns: [
//                 /#.*$/m, // Shell comments
//                 /for\s+\w+\s+in\s+.+;\s*do/, // For loops
//                 /while\s+\[\s+.+\s+\]\s*;\s*do/, // While loops
//                 /case\s+\$\w+\s+in(\s+[\w*)]+)/, // Case statements
//             ],
//             weight: 1.1,
//         },
//         markdown: {
//             keywords: [
//                 '# ', '## ', '### ', '#### ', '- ', '* ', '1. ', '> ', '```',
//                 '**', '__', '[', '](', '![', '|', '<details>', '<summary>',
//                 '', '```js', '```python', '```bash', '```typescript'
//             ],
//             regexPatterns: [
//                 /^#+\s+.+$/m, // Headers
//                 /^(?:[*+-]|\d+\.)\s+.+$/m, // Lists
//                 /^>\s+.+$/m, // Blockquotes
//                 /!\[.*?\]\(.*?\)/, // Images
//                 /\[.*?\]\(.*?\)/, // Links
//             ],
//             fileExtensions: ['.md', '.markdown'],
//             syntaxPatterns: [
//                 /^\s*\n[\s\S]*?\n/, // YAML frontmatter
//                 /^```[\w]*\n[\s\S]*?\n```$/m, // Code blocks
//                 /\*\*[\s\S]*?\*\*/, // Bold text
//                 /`[^`]+`/, // Inline code
//             ],
//             weight: 0.9,
//         },
//         yaml: {
//             keywords: [
//                 '', 'name:', 'version:', 'description:', 'dependencies:', 'dev-dependencies:',
//                 'env:', 'services:', 'build:', 'image:', 'volumes:', 'ports:',
//                 'environment:', 'config:', 'apiVersion:', 'kind:', 'metadata:',
//                 'spec:', 'replicas:', 'containers:', '- name:', '- path:'
//             ],
//             regexPatterns: [
//                 /^$/m, // YAML document start
//                 /^\w+:\s*[\w\s."'-]+$/m, // Simple key-value pairs
//                 /^\w+:\s*$/m, // Keys with nested values
//                 /^\s+- \w+:/, // List items with keys
//                 /^\s+\w+:\s*[\w\s."'-]+$/m, // Indented key-value pairs
//             ],
//             fileExtensions: ['.yml', '.yaml'],
//             syntaxPatterns: [
//                 /#.*$/m, // YAML comments
//                 /^\s+- [\w\s."'-]+$/m, // Simple list items
//                 /\${[\w_]+}/, // Variable substitutions
//                 /\{\{[\s\S]*?\}\}/, // Template expressions
//             ],
//             weight: 1.0,
//         },
//         json: {
//             keywords: [
//                 '{"', '"}', '":"', '",', '":', '"}', '[]', '{}', 'null', 'true', 'false',
//                 '"name":', '"version":', '"description":', '"dependencies":', '"scripts":',
//                 '"main":', '"author":', '"license":', '"private":', '"type":'
//             ],
//             regexPatterns: [
//                 /\{\s*"[\w-]+"\s*:\s*(?:"[\w\s.,;:_-]+"|\d+|true|false|null|\{|\[)/, // Object start with common props
//                 /"[\w-]+"\s*:\s*"[\w\s.,;:_-]+"/, // Simple string key-value
//                 /"[\w-]+"\s*:\s*(?:\d+(?:\.\d+)?|true|false|null)/, // Non-string values
//                 /"[\w-]+"\s*:\s*\[(?:"[\w\s.,;:_-]+"|\d+|true|false|null|\{|\[)/, // Array values
//                 /"[\w-]+"\s*:\s*\{(?:"[\w\s.,;:_-]+"|\d+|true|false|null|\{|\[)/, // Nested objects
//             ],
//             fileExtensions: ['.json'],
//             syntaxPatterns: [
//                 /"[\w-]+"\s*:\s*\[\s*\]/, // Empty arrays
//                 /"[\w-]+"\s*:\s*\{\s*\}/, // Empty objects
//                 /\[\s*\d+(\s*,\s*\d+)*\s*\]/, // Number arrays
//                 /\[\s*"[\w\s.,;:_-]+"(\s*,\s*"[\w\s.,;:_-]+")*\s*\]/, // String arrays
//             ],
//             weight: 1.0,
//         },
//     };

//     // Function to determine language from a single line
//     function getSingleLineLanguage(line: string): string | undefined {
//         // Checking specific language patterns for single lines
//         if (/^(const|let|var|function|import|export)\s+\w+/.test(line)) return "javascript";
//         if (/^(interface|type|namespace)\s+\w+/.test(line)) return "typescript";
//         if (/^(class|def|import|from)\s+\w+/.test(line)) return "python";
//         if (/^(public|private|class)\s+\w+/.test(line)) return "java";
//         if (/^\$\w+\s*=/.test(line)) return "php";
//         if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE)\s+/i.test(line)) return "sql";
//         if (/^<\w+[^>]*>.*<\/\w+>$/.test(line)) return "html";
//         if (/^[\w#.][\w-]*\s*\{[\w\s:;-]+\}$/.test(line)) return "css";
//         if (/^def\s+\w+|^class\s+\w+/.test(line)) return "ruby";

//         // Default to unknown but still code
//         return undefined;
//     }

//     // Score code characteristics (structure, indentation, special characters)
//     let structureScore = 0;
//     let indentationConsistency = 0;
//     let codePatternHits = 0;
//     let previousIndentation = -1;
//     let indentationChanges = 0;

//     // Common code patterns - more robust checks
//     const codePatterns = [
//         /[\{\}]/, // Braces
//         /[\[\]]/, // Brackets
//         /[;]/, // Semicolons
//         /[()]/, // Parentheses
//         /^(\s{2,}|\t+)/, // Indentation
//         /\w+\s*=\s*/, // Assignments
//         /\w+\([^)]*\)/, // Function calls
//         /([<>]=?|===?|!==?|&&|\|\|)/, // Operators
//         /^\s*(if|for|while|switch|catch)\s*\(/, // Control structures
//         /^\s*(function|const|let|var|import|export|class|def|package|namespace)\s+\w+/, // Declarations
//         /^\s*(return|break|continue|throw)\s+/, // Flow control
//     ];

//     // Whitespace and indentation analysis
//     let lineIndentations: number[] = [];
//     let consistentIndentWidth = 0;

//     // Track language scoring
//     const languageScores: Record<string, {
//         keywordHits: number,
//         patternHits: number,
//         syntaxHits: number,
//         total: number
//     }> = {};

//     // Initialize language scores
//     Object.keys(languageSignatures).forEach(lang => {
//         languageScores[lang] = { keywordHits: 0, patternHits: 0, syntaxHits: 0, total: 0 };
//     });

//     // Process each line to gather code characteristics and language evidence
//     for (let i = 0; i < lines.length; i++) {
//         const line = lines[i];
//         const trimmedLine = line.trim();

//         // Skip empty lines
//         if (!trimmedLine) continue;

//         // Count indentation level
//         const indentMatch = line.match(/^(\s+)/);
//         const currentIndentation = indentMatch ? indentMatch[0].length : 0;
//         lineIndentations.push(currentIndentation);

//         // Detect indentation changes
//         if (previousIndentation !== -1 && currentIndentation !== previousIndentation) {
//             indentationChanges++;
//         }
//         previousIndentation = currentIndentation;

//         // Check for code patterns
//         for (const pattern of codePatterns) {
//             if (pattern.test(line)) {
//                 codePatternHits++;
//                 break;
//             }
//         }

//         // Score each language based on its signatures
//         for (const [lang, signature] of Object.entries(languageSignatures)) {
//             // Check keywords
//             for (const keyword of signature.keywords) {
//                 if (trimmedLine.includes(keyword)) {
//                     languageScores[lang].keywordHits++;
//                     break;
//                 }
//             }

//             // Check regex patterns
//             for (const pattern of signature.regexPatterns) {
//                 if (pattern.test(trimmedLine)) {
//                     languageScores[lang].patternHits += 2; // Stronger weight for specific patterns
//                     break;
//                 }
//             }

//             // Check syntax patterns
//             for (const pattern of signature.syntaxPatterns) {
//                 if (pattern.test(trimmedLine)) {
//                     languageScores[lang].syntaxHits += 1.5;
//                     break;
//                 }
//             }

//             // Add additional whole-text pattern checks for multi-line patterns
//             if (i === 0) { // Only do this once per analysis
//                 const fullText = lines.join('\n');
//                 for (const pattern of signature.syntaxPatterns) {
//                     const matches = fullText.match(new RegExp(pattern, 'g')) || [];
//                     if (matches.length > 0) {
//                         languageScores[lang].syntaxHits += Math.min(matches.length, 3) * 1.2;
//                     }
//                 }
//             }
//         }
//     }

//     // Analyze indentation consistency
//     if (lineIndentations.length > 1) {
//         // Find the most common non-zero indentation width
//         const indentFrequency: Record<number, number> = {};
//         for (let i = 1; i < lineIndentations.length; i++) {
//             const diff = Math.abs(lineIndentations[i] - lineIndentations[i - 1]);
//             if (diff > 0) {
//                 indentFrequency[diff] = (indentFrequency[diff] || 0) + 1;
//             }
//         }

//         let mostFrequentIndent = 0;
//         let maxFrequency = 0;

//         for (const [indent, freq] of Object.entries(indentFrequency)) {
//             if (freq > maxFrequency) {
//                 maxFrequency = freq;
//                 mostFrequentIndent = Number(indent);
//             }
//         }

//         consistentIndentWidth = mostFrequentIndent;

//         // Calculate indentation consistency score
//         if (consistentIndentWidth > 0) {
//             const consistentIndents = lineIndentations.filter(i => i % consistentIndentWidth === 0).length;
//             indentationConsistency = consistentIndents / lineIndentations.length;
//         }
//     }

//     // Calculate combined language scores with weighting
//     for (const lang in languageScores) {
//         const { keywordHits, patternHits, syntaxHits } = languageScores[lang];
//         const weight = languageSignatures[lang].weight;

//         // Calculate weighted total
//         languageScores[lang].total = (
//             (keywordHits * 1.0) +
//             (patternHits * 2.0) +
//             (syntaxHits * 1.5)
//         ) * weight;
//     }

//     // Overall code structure score (0-1)
//     structureScore = Math.min(1.0, (
//         (codePatternHits / (lines.length * 0.7)) +
//         (indentationChanges / lines.length) +
//         (indentationConsistency * 0.5)
//     ) / 2.5);

//     // Determine if it's code based on combined factors
//     const isCode = structureScore >= threshold ||
//         Object.values(languageScores).some(score => score.total >= lines.length * 0.4);

//     if (!isCode) return { isCode: false, confidence: Math.max(0.7, 1 - structureScore) };

//     // Choose the best language match
//     const bestMatches = Object.entries(languageScores)
//         .sort((a, b) => b[1].total - a[1].total);

//     const bestMatch = bestMatches[0];
//     const secondBestMatch = bestMatches[1] || { total: 0 };

//     // Calculate confidence based on the difference between top matches
//     let confidence = 0.7; // Base confidence

//     if (bestMatch) {
//         const [language, score] = bestMatch;
//         const scoreRatio = lines.length > 0 ? score.total / lines.length : 0;

//         // Higher confidence with higher score ratio
//         if (scoreRatio > 0.7) confidence = 0.9;
//         else if (scoreRatio > 0.4) confidence = 0.8;

//         // Higher confidence when there's a clear winner
//         const margin = bestMatches[0][1].total - bestMatches[1]?.[1].total || 0;
//         if (margin > bestMatches[0][1].total * 0.5) confidence += 0.1;

//         return {
//             isCode: true,
//             language: language,
//             confidence: Math.min(1.0, confidence)
//         };
//     }

//     return { isCode: true, confidence: 0.7 }; // Generic code detection with moderate confidence
// };

// // Helper function to analyze file extensions when available
// export const detectLanguageFromFileName = (filename: string): string | undefined => {
//     if (!filename) return undefined;

//     const extension = filename.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
//     if (!extension) return undefined;

//     const extensionMap: Record<string, string> = {
//         'js': 'javascript',
//         'mjs': 'javascript',
//         'cjs': 'javascript',
//         'ts': 'typescript',
//         'jsx': 'jsx',
//         'tsx': 'tsx',
//         'py': 'python',
//         'java': 'java',
//         'php': 'php',
//         'sql': 'sql',
//         'html': 'html',
//         'htm': 'html',
//         'css': 'css',
//         'scss': 'css',
//         'less': 'css',
//         'rb': 'ruby',
//         'go': 'go',
//         'rs': 'rust',
//         'c': 'c',
//         'cpp': 'cpp',
//         'cc': 'cpp',
//         'cxx': 'cpp',
//         'h': 'c',
//         'hpp': 'cpp',
//         'cs': 'csharp',
//         'sh': 'shell',
//         'bash': 'shell',
//         'zsh': 'shell',
//         'md': 'markdown',
//         'markdown': 'markdown',
//         'yml': 'yaml',
//         'yaml': 'yaml',
//         'json': 'json',
//     };

//     return extensionMap[extension];
// };

// // Combine all detection methods for maximum accuracy
// export const smartCodeDetection = (
//     text: string,
//     filename?: string,
//     threshold = 0.4
// ): CodeDetectionResult => {
//     // First check filename if available
//     const filenameLanguage = filename ? detectLanguageFromFileName(filename) : undefined;

//     // If we have a strong filename match, use that with high confidence
//     if (filenameLanguage) {
//         // Still verify it's actually code
//         const { isCode } = detectCodeAndLanguage(text, threshold);
//         if (isCode) {
//             return { isCode: true, language: filenameLanguage, confidence: 0.95 };
//         }
//     }

//     // Otherwise use content-based detection
//     return detectCodeAndLanguage(text, threshold);
// };

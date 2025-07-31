import { memo, useRef, useState } from "react";
import { useClickOutside } from "../../../hooks/utility/useClickOutside";
import { useFocusTrap } from "../../../hooks/utility/useFocusTrap";
import Button from "../../Button";
import { twMerge } from "tailwind-merge";

type CodeLanguageDropdownProps = {
  value?: string;
  onChange: (language: string) => void;
};

const languages = [
  { value: "javascript", label: "JavaScript", icon: "🟨" },
  { value: "typescript", label: "TypeScript", icon: "🔷" },
  { value: "python", label: "Python", icon: "🐍" },
  { value: "java", label: "Java", icon: "☕" },
  { value: "csharp", label: "C#", icon: "🔵" },
  { value: "php", label: "PHP", icon: "🐘" },
  { value: "html", label: "HTML", icon: "📄" },
  { value: "css", label: "CSS", icon: "🎨" },
  { value: "sql", label: "SQL", icon: "🗃️" },
  { value: "jsx", label: "JSX", icon: "⚛️" },
  { value: "tsx", label: "TSX", icon: "⚛️" },
  { value: "bash", label: "Bash", icon: "💻" },
  { value: "json", label: "JSON", icon: "📋" },
  { value: "markdown", label: "Markdown", icon: "📝" },
  { value: "yaml", label: "YAML", icon: "⚙️" },
  { value: "c", label: "C", icon: "🔧" },
  { value: "cpp", label: "C++", icon: "⚡" },
  { value: "go", label: "Go", icon: "🐹" },
  { value: "ruby", label: "Ruby", icon: "💎" },
  { value: "rust", label: "Rust", icon: "🦀" },
];

export const CodeLanguageDropdown = memo((props: CodeLanguageDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredLanguages = languages.filter((lang) =>
    lang.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLang =
    languages.find((lang) => lang.value === props.value) || languages[0];

  useClickOutside(dropdownRef, isOpen, () => {
    setIsOpen(false), setSearch("");
  });

  const { isUsingKeyboard } = useFocusTrap(dropdownRef, "arrow", {
    enabled: isOpen,
    trackInputMethod: true,
  });
  const handleCodeLanguageDropdown = (languageValue: string) => {
    props.onChange(languageValue);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div
      className="absolute top-2 right-16 z-[1]"
      ref={containerRef}
      contentEditable={false}
    >
      <Button
        variant="unstyled"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-1 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 outline-none   text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800"
      >
        <span className="opacity-80">{selectedLang.icon}</span>
        <span>{selectedLang.label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-2 border-b border-gray-200 dark:border-slate-600">
            <input
              autoComplete="off"
              name="language-search"
              type="text"
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border  border-gray-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1  focus:border-slate-400 dark:focus:border-slate-500
 focus:ring-slate-400 dark:ring-slate-500 text-gray-700 dark:text-gray-200"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto dark:dark-scrollbar light-scrollbar scrollbar-gutter flex items-center py-3  flex-col px-2 gap-1">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <Button
                  variant="unstyled"
                  type="button"
                  key={lang.value}
                  onClick={() => handleCodeLanguageDropdown(lang.value)}
                  className={twMerge(
                    "w-full flex items-center justify-start gap-2 px-1 py-2 text-xs text-left  transition-colors text-gray-700 dark:text-gray-200 rounded-md dark:focus:bg-slate-700 focus:bg-blue-50 dark:focus-visible:ring-0 focus-visible:ring-0",
                    !isUsingKeyboard
                      ? "hover:bg-blue-50 dark:hover:bg-slate-700"
                      : ""
                  )}
                >
                  <span>{lang.icon}</span>
                  <span>{lang.label}</span>
                </Button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

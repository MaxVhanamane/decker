export function highlightText(
  text: string,
  searchQuery: string,
  theme: "light" | "dark"
) {
  if (!searchQuery.trim()) return <>{text.slice(0, 300)}</>;

  // Escape regex special characters
  const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create a case-insensitive regex
  const regex = new RegExp(`(${escapedSearchQuery})`, "gi");

  let isFirstMatch = false;

  const highlighted = text
    .slice(0, 300)
    .split(regex)
    .map((part, index) => {
      if (regex.test(part) && !isFirstMatch) {
        isFirstMatch = true;
        return (
          <span
            key={index}
            className={theme === "dark" ? "bg-red-500" : "bg-yellow-300"}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });

  return <>{highlighted}</>;
}

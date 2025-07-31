export const NonBreakingSpace = () => (
  <span
    contentEditable={false}
    aria-hidden="true"
    style={{
      display: "inline-block",
      width: "0",
      height: "0",
      overflow: "hidden",
      verticalAlign: "baseline",
    }}
  >
    {"\u00A0"}
  </span>
);

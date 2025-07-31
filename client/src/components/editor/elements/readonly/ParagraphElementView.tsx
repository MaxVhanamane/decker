import { memo } from "react";

const ParagraphElementView = memo(({ children }: { children: any }) => {
  return <p className="relative outline-none">{children}</p>;
});

export default memo(ParagraphElementView);

import { memo } from "react";

type LinkElementViewProps = {
  children: any;
  url: string;
};

const LinkElementView = ({ children, url }: LinkElementViewProps) => {
  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative text-blue-600 underline cursor-pointer"
      >
        {children}
      </a>
    </>
  );
};

export default memo(LinkElementView);

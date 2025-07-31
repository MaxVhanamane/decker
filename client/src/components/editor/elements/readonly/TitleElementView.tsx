import { memo } from "react";

type TitleElementViewProps = {
  children: any;
  isTitleEmpty: boolean;
};

const TitleElementView = ({
  children,
  isTitleEmpty,
}: TitleElementViewProps) => {
  return (
    <h1 className="text-lg font-bold outline-none relative ">
      {isTitleEmpty && (
        <span
          contentEditable={false}
          className="absolute left-0 top-0 text-gray-400 pointer-events-none select-none text-base font-light"
          style={{
            padding: "0.125rem 0",
          }}
        >
          You have not added Title to this note
        </span>
      )}
      {children}
    </h1>
  );
};

export default memo(TitleElementView);

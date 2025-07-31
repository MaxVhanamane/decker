import { memo } from "react";

type PropType = {
  imageSource: string;
  imageAltText: string;
  heading: string;
  subheading?: string;
  onButtonClick?: () => void;
  buttonLabel?: string;
  imageClassNames?: string;
};

const NoContent = ({
  imageSource,
  heading,
  imageAltText,
  subheading,
  onButtonClick,
  buttonLabel,
  imageClassNames = "w-44 h-44",
}: PropType) => {
  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 font-semibold dark:text-gray-50 text-gray-800 px-1 flex items-center justify-center flex-col w-full mt-6 md:mt-0 animate-quickOpacity`}
    >
      <img src={imageSource} alt={imageAltText} className={imageClassNames} />
      <p className="p-1 mt-1 text-base">{heading}</p>
      {subheading && <p className="p-1 mt-1 text-base">{subheading}</p>}
      {onButtonClick && buttonLabel && (
        <button
          onClick={onButtonClick}
          className=" mt-4  inline-block  py-2 lg:py-2.5 font-medium text-sm leading-tight  rounded-md  active:shadow-lg text-gray-50   w-fit px-2  bg-sky-600 hover:bg-sky-700 transition-colors duration-150 ease-in-out  "
          type="button"
          aria-label={buttonLabel}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default memo(NoContent);

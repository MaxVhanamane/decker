import { twMerge } from "tailwind-merge";
import Button from "../Button";
import { BsFillPinFill, BsThreeDotsVertical, BsPin } from "react-icons/bs";
import type { DeckType } from "../../types/types";
import { formatDate } from "../../functions/formatDate";

type DeckItemPresentationalPropType = {
  deck: DeckType & {
    cards?:
      | []
      | {
          title: string;
          note: string;
          _id: string;
          cardId: string;
          createdAt: string;
        }[];
  };
  isDragging: boolean;
  isDraggingOverDeleteArea: boolean;
};

const DeckItemPresentational = ({
  deck,
  isDragging,
  isDraggingOverDeleteArea,
}: DeckItemPresentationalPropType) => {
  return (
    <div
      className={twMerge(
        "relative border border-gray-400  text-gray-700 dark:text-gray-50 rounded-md w-[10.5rem] xs:w-[10.9rem] ms:w-[12rem] sm:w-[10.9rem] px-2  min-h-[7rem]  flex  justify-center items-center  text-justify transition-[border-color,box-shadow,background-color] duration-300   before:absolute before:opacity-0 before:transition-all before:duration-300 hover:shadow-4-sides group overflow-hidden",
        isDragging && deck?.pinned
          ? ` !border-fuchsia-600 animate-pulse  !shadow-2xl !shadow-fuchsia-600 dark:bg-slate-900 bg-gray-100 before:content-[''] before:absolute before:w-[3rem] before:py-[60%]  before:bg-gradient-to-r before:from-fuchsia-600 before:to-fuchsia-500 before:animate-rotate after:content-[''] before:!transition-all before:duration-300 after:absolute after:inset-[0.15rem]  after:bg-gray-100 dark:after:bg-slate-900 before:!opacity-100 dark:!text-fuchsia-600 !text-fuchsia-600 `
          : "border-gray-400",

        isDragging && !deck?.pinned
          ? ` !border-lime-500 animate-pulse  !shadow-2xl !shadow-lime-500 dark:bg-slate-900 bg-gray-100 before:content-[''] before:absolute before:w-[3rem] before:py-[60%]  before:bg-gradient-to-r before:from-lime-500 before:to-lime-500 before:animate-rotate after:content-[''] before:!transition-all before:duration-300 after:absolute after:inset-[0.15rem]  after:bg-gray-100 dark:after:bg-slate-900 before:!opacity-100 dark:!text-lime-500 !text-lime-500`
          : "border-gray-400",

        isDraggingOverDeleteArea
          ? "!border-red-500 !shadow-red-500  before:!from-red-500 before:!to-red-400   dark:!text-red-500 !text-red-500"
          : ""
      )}
    >
      <div
        className={twMerge(
          "absolute w-full h-full bg-[url('/hexagongrid.svg')] bg-center bg-cover after:absolute  after:inset-0 after:m-auto  after:w-[40%] after:aspect-square  after:blur-[40px] after:rounded-full after:opacity-0  z-50 group-hover:after:bg-radialGradient group-hover:after:opacity-100 after:transition-all after:duration-300 pointer-events-none",
          isDragging && deck?.pinned
            ? "after:!bg-[radial-gradient(#c026d3,#0c7bb3e6)] after:!opacity-100"
            : "after:bg-radialGradient",
          isDragging && !deck?.pinned
            ? "after:!bg-[radial-gradient(#84cc16,#0c7bb3e6)] after:!opacity-100"
            : "after:bg-radialGradient",
          isDraggingOverDeleteArea
            ? "after:!bg-[radial-gradient(#ef4444,#0c7bb3e6)] after:!opacity-100"
            : ""
        )}
      ></div>

      <Button
        variant="plain"
        size="md"
        className="absolute  dark:bg-slate-800 bg-gray-200 rounded-full w-6 h-6 z-50 top-2 left-2 flex items-center justify-center group/Btn"
      >
        <p className=" rounded-tr text-sm px-1  text-center text-gray-600 dark:text-slate-500  group-hover/Btn:scale-95">
          {deck.pinned ? (
            <BsFillPinFill className="text-[0.9rem]" />
          ) : (
            <BsPin />
          )}
        </p>
      </Button>

      <div>
        <Button
          variant="plain"
          size="md"
          className="absolute z-50 right-2 top-2 hover:scale-95 rounded-full p-[0.1rem]  "
        >
          <BsThreeDotsVertical className="dark:text-slate-400 text-gray-600" />
        </Button>
      </div>

      <div className="z-40 w-full flex items-center justify-center ">
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 dark:text-gray-400/80 flex items-center justify-center gap-1 select-none">
          <span>{formatDate(deck.createdAt)}</span>{" "}
          <span className="inline-block w-1 h-1 bg-gray-400 dark:bg-gray-400/80 rounded-full"></span>
          <span>
            {(deck.cardsCount ?? deck?.cards?.length) || 0}{" "}
            {((deck.cardsCount ?? deck?.cards?.length) || 0) === 1
              ? "entry"
              : "entries"}
          </span>
        </div>
        <p className=" break-all font-bold  line-clamp-1 h-7 text-center  w-full select-none ">
          {deck.title}
        </p>
      </div>
    </div>
  );
};

export default DeckItemPresentational;

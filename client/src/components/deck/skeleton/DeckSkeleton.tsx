import DeckItemSkeleton from "./DeckItemSkeleton";

const DeckSkeleton = ({
  skeletonCount,
  title,
  maxCount = 15,
}: {
  skeletonCount: number;
  title: "Pinned" | "Others";
  maxCount?: number;
}) => {
  const optimalCount = Math.min(skeletonCount, maxCount);
  return (
    <section
      className={` ${
        title !== "Pinned" ? "mb-24" : "lg:mb-10"
      } mx-1 animate-opacity_page_transition w-full`}
    >
      <div className="w-full flex items-center justify-center flex-col">
        <h2 className="text-left  text-base font-semibold text-gray-800 dark:text-gray-50  my-4 mx-2  px-4 lg:w-[80rem]">
          {title}
        </h2>
        <div className=" flex flex-row flex-wrap gap-2  justify-center items-center py-2 sm:px-1 lg:w-[80rem] transition-all duration-1000">
          {Array.from({ length: optimalCount }).map((_, index) => {
            return <DeckItemSkeleton key={index} />;
          })}
        </div>
      </div>
    </section>
  );
};

export default DeckSkeleton;

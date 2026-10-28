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
      className={`${
        title !== "Pinned" ? "mb-24" : "lg:mb-10"
      } animate-[opacity_2s_ease-in_forwards] [animation-delay:300ms] w-full`}
    >
      <div className="w-full flex items-center justify-center flex-col">
        <h2 className="text-left w-full text-sm text-gray-800 dark:text-gray-50 my-4 mx-2 px-4 2xl:w-[80rem]">
          {title}
        </h2>

        <div className="flex flex-row flex-wrap gap-2 justify-center items-center py-2 sm:px-1 2xl:w-[80rem] transition-all duration-1000">
          {Array.from({ length: optimalCount }).map((_, index) => (
            <DeckItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeckSkeleton;

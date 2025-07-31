import CardItemSkeleton from "./CardItemSkeleton";

const CardsSkeleton = ({ skeletonCount }: { skeletonCount: number }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 items-center mx-2 justify-center w-full lg:w-[65rem] md:w-[40rem] mb-12 animate-opacity_page_transition">
      {Array.from({ length: skeletonCount }).map((_, idx) => (
        <CardItemSkeleton key={idx} />
      ))}
    </div>
  );
};

export default CardsSkeleton;

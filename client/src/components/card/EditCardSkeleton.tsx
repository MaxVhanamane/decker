import { motion } from "motion/react";
function EditCardSkeleton() {
  return (
    <motion.div
      key="skeleton"
      className="w-full py-6 "
      initial={{ opacity: 0.6, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {/* Title skeleton */}
      <div className="shimmer-skeleton h-7 w-[60%] rounded-md mb-4"></div>

      {/* Body paragraphs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="shimmer-skeleton h-4 w-full rounded-md"></div>
          <div className="shimmer-skeleton h-4 w-[85%] rounded-md"></div>
          <div className="shimmer-skeleton h-4 w-[70%] rounded-md"></div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="shimmer-skeleton h-4 w-full rounded-md"></div>
          <div className="shimmer-skeleton h-4 w-[90%] rounded-md"></div>
          <div className="shimmer-skeleton h-4 w-[65%] rounded-md"></div>
        </div>
        {/* Code Block Skeleton */}
        <div className="rounded-md mt-3 mb-3 p-4 bg-gray-200/30 dark:bg-white/5 border border-gray-300/40 dark:border-white/10">
          <div className="flex flex-col gap-2">
            <div className="shimmer-skeleton h-3 w-[90%] rounded-md" />
            <div className="shimmer-skeleton h-3 w-[70%] rounded-md" />
            <div className="shimmer-skeleton h-3 w-[80%] rounded-md" />
            <div className="shimmer-skeleton h-3 w-[60%] rounded-md" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="shimmer-skeleton h-4 w-full rounded-md"></div>
          <div className="shimmer-skeleton h-4 w-[90%] rounded-md"></div>
          <div className="shimmer-skeleton h-4 w-[65%] rounded-md"></div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="shimmer-skeleton h-4 w-full rounded-md"></div>
          <div className="shimmer-skeleton h-4 w-[80%] rounded-md"></div>
        </div>
      </div>
    </motion.div>
  );
}

export default EditCardSkeleton;

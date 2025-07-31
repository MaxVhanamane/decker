const DeckItemSkeleton = () => {
  return (
    <div className="relative border dark:border-slate-700 border-slate-400 text-gray-700 dark:text-gray-50 rounded-md w-[10.5rem] xs:w-[10.9rem] ms:w-[12rem] sm:w-[10.9rem] px-2 min-h-[7rem] flex justify-center items-center text-justify shadow-4-sides z-30">
      {/* Hexagon background grid */}
      <div className="absolute w-full h-full bg-[url('/hexagongrid.svg')] bg-center bg-cover pointer-events-none z-10"></div>

      {/* Pinned button placeholder */}
      <div className="absolute top-2 left-2 w-6 h-6 rounded-full shimmer-skeleton z-50"></div>

      {/* More options button placeholder */}
      <div className="absolute top-2 right-2 w-5 h-5 rounded-full shimmer-skeleton z-50"></div>

      {/* Content shimmer */}
      <div className="z-40 w-full flex flex-col items-center justify-center gap-4">
        {/* Simulated title */}
        <div className="shimmer-skeleton h-6 w-4/5 rounded-md"></div>

        {/* Simulated metadata */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 flex items-center justify-center gap-1 select-none">
          <div className="shimmer-skeleton w-20 h-3 rounded"></div>
          <span className="inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
          <div className="shimmer-skeleton w-14 h-3 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default DeckItemSkeleton;

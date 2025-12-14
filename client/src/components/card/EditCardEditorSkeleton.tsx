import EditCardSkeleton from "./EditCardSkeleton";

export const EditCardEditorSkeleton = ({ toolbarPosition = "top" }) => {
  return (
    <div className="relative w-full h-full bg-white dark:bg-slate-900">
      {/* Toolbar Skeleton */}
      <div
        className={`
          w-full xl:h-14 h-10  dark:bg-slate-700 flex justify-between items-center px-4 gap-3 
          ${toolbarPosition === "bottom" ? "absolute bottom-0" : ""}
        `}
      >
        <div className="flex xl:justify-between justify-end items-center w-full">
          <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded xl:block hidden" />
          <div className="flex items-center gap-3">
            <div className="ml-6 w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded " />
            <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-16 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
          </div>
        </div>
      </div>
      <div
        className={`
          w-full h-10  dark:bg-slate-700 flex justify-between items-center px-4 gap-3 xl:hidden
          ${toolbarPosition === "bottom" ? "absolute bottom-0" : ""}
        `}
      >
        <div className="flex justify-end items-center w-full">
          <div className="flex items-center gap-3">
            <div className="ml-6 w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-7 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
            <div className="w-16 h-8 bg-gray-200 dark:bg-slate-500 rounded" />
          </div>
        </div>
      </div>

      {/* Editor content skeleton */}
      <div
        className={`
          px-4  pb-32 overflow-y-auto 
        
        `}
      >
        <EditCardSkeleton />
      </div>
    </div>
  );
};

export default function Loading() {
  return (
    <div
      className={` absolute top-0 left-0  w-full h-full flex items-center justify-center   ${
        localStorage.getItem("theme") === "dark" ||
        localStorage.getItem("theme") === null
          ? "dark:bg-slate-900"
          : "bg-[#fcfefc]"
      }`}
    >
      <img
        onError={(e) => {
          // In Firefox, the alt text is displayed while loading the actual image, which may not look aesthetically pleasing. To address this, I initially set the text color to transparent. Once the image has loaded, I dynamically change the text color. This ensures that even if the image fails to load, the user will see the alt text.
          const element = e.target as HTMLImageElement;
          element.classList.add("!text-gray-700", "dark:!text-gray-200");
        }}
        onLoad={(e) => {
          const element = e.target as HTMLImageElement;
          element.classList.add("!text-gray-700", "dark:!text-gray-200");
        }}
        className="text-transparent"
        src={
          localStorage.getItem("theme") === "dark" ||
          localStorage.getItem("theme") === null
            ? "/loading_dark.gif"
            : "/loading_light.gif"
        }
        alt="loading"
        width={200}
        height={200}
      />
    </div>
  );
}

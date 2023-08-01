export default function Loading() {
  return (
    <div
      className={` absolute top-0 left-0  w-full h-full flex items-center justify-center ${
        localStorage.getItem("theme") === "dark" ||
        localStorage.getItem("theme") === null
          ? "dark:bg-slate-950"
          : "bg-white"
      }`}
    >
      <img
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

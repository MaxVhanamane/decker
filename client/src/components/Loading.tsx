
export default function Loading() {
  return (
    <div className={` absolute top-0 left-0  w-full h-full flex items-center justify-center ${localStorage.getItem("theme")==="dark"&&"bg-slate-900"}`}>
        <img src={localStorage.getItem("theme")==="dark"?"/loadingblock.gif":"/loadinggif.gif"} alt="loading_image" width={200} height={200}/>
        </div>
  )
}

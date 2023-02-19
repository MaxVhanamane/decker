
export default function Loading() {
  return (
    <div className={` absolute top-0 left-0  w-full h-full flex items-center justify-center ${localStorage.getItem("theme")==="dark"&&"bg-[#0c1221]"}`}>
        <img src={localStorage.getItem("theme")==="dark"?"/loadingfinal.gif":"/loadinggif.gif"} alt="loading_image" width={200} height={200}/>
        </div>
  )
}

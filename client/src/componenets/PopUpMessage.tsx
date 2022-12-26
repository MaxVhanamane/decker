import React, { FC, useRef ,RefObject} from 'react'

type Prop={
    message:string,
    showPopUp:RefObject<HTMLDivElement>
}
const PopUpMessage:FC<Prop> = ({message,showPopUp}) => {
  return (
    <div ref={showPopUp} className={`fixed bottom-10 lg:right-20 right-7 transition duration-1000 delay-300 ease-in-out scale-0  w-0 h-0 bg-teal-600 rounded-lg mx-[3rem] z-50 text-gray-50 p-4 dark:bg-slate-900 border shadow dark:border-sky-500 dark:shadow-sky-500 `}>
    <div className="flex items-center justify-center ">

<p>{message}</p>
    </div>

</div>
  )
}

export default PopUpMessage

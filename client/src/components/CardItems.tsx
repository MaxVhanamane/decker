import { Droppable } from 'react-beautiful-dnd';
import { Draggable } from 'react-beautiful-dnd';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { useRef, memo } from 'react';
import { BiEdit } from 'react-icons/bi';
type CardType={
title:string;
note:string;
_id:string
}
const CardItems = ({handleDelete,handleEdit,handleShowFullScreen,data}:any) => {
    const { deck_id } = useParams();
  const changeColorWhileDragging = useRef<HTMLDivElement | null>(null);

  return (
    <Droppable droppableId="cardDropableArea">
      {/* You can't use Draggable directly you have to use it inside Dropable component  */}
          {(provided, snapshot) => {
            return (
              <div
                className="flex flex-row flex-wrap gap-4 justify-center items-center  mx-2 lg:mx-52 mb-48  "
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {data?.cards?.map((card:CardType, index:number) => {
                  return (
                    <Draggable
                      draggableId={`${deck_id!}-${index}`}
                      index={index}
                      key={card._id+index}
                    >
                      {(provided, snapshot) => {
                        if (snapshot.isDragging) {
                          changeColorWhileDragging.current?.classList.add(
                            "!lg:w-[90vw]"
                          );
                        }
                        return (
                          <div
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            key={index}
                          >
                            <div
                              ref={changeColorWhileDragging}
                              onClick={() =>
                                handleShowFullScreen({
                                  ...card,
                                  _id: deck_id!,
                                  cardIndex: index,
                                })
                              }
                              className={`relative border   ${snapshot.isDragging
                                ? "shadow-2xl  shadow-violet-600 border-violet-600  animate-pulse dark:bg-[#0c1221] bg-white"
                                : "border-gray-400 "
                                } ${snapshot.draggingOver === "cardDeleteArea"
                                  ? "shadow-2xl !shadow-red-500 !border-red-500 !bg-transparent"
                                  : null
                                }   flex flex-col text-gray-800
                rounded-md px-2 py-4  h-[9rem] lg:h-44  text-justify lg:w-[50vw] w-[95vw] transition-[background-color,border-color] duration-300  dark:hover:bg-slate-900 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 group`}
                            >
                              <div className="absolute bottom-0 right-0 ">
                                {/* If I don't use event.stopPropagation() then when I click on delete button or edit button it will first use the onClick that is added on parent i.e div onClick={()=>handleShowFullScreen({...card,_id:deck_id!})} then it will use the onClick that is defined on buttons. which is a problem in this case to avoid that I have used event.stopPropagation() */}
                                <button
                                  onClick={(event) => {
                                    event.stopPropagation(),
                                      handleDelete(index);
                                  }}
                                  type="button"
                                  className="text-red-500 text-lg outline-none  rounded-tr  px-1  text-center  lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 hover:text-red-600 "
                                  aria-label="Delete Card"
                                >
                                  <MdOutlineDeleteOutline />
                                </button>

                                <button
                                  onClick={(event) => {
                                    event.stopPropagation(),
                                      handleEdit({
                                        ...card,
                                        _id: deck_id!,
                                        cardIndex: index,
                                      });
                                  }}
                                  type="button"
                                  className="text-blue-500 dark:hover:text-sky-600 hover:text-blue-600 text-lg outline-none rounded-tr px-1  text-center dark:text-sky-400 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500"
                                  aria-label="Edit Card"
                                >
                                  <BiEdit />
                                </button>
                              </div>
                              <p className="font-bold text-md lg:text-lg text-gray-800 dark:text-gray-50 mb-1 p-1 line-clamp-1 break-words break-all -ml-1">
                                {card.title}
                              </p>
                              {/* line-clamp-3 helps to truncate characters after 3 lines */}
                              <p className="text-sm lg:text-base text-gray-800 dark:text-gray-100 px-1 line-clamp-3 break-words break-all -ml-1 ">
                                {card.note}
                              </p>
                            </div>
                          </div>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
  )
}

export default memo(CardItems)

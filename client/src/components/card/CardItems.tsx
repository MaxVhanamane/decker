import { Droppable } from "react-beautiful-dnd";
import { Draggable } from "react-beautiful-dnd";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useParams } from "react-router-dom";
import { useRef, memo } from "react";
import { BiEdit } from "react-icons/bi";
import { UserContext } from "../../context/UserContext";
import { useContext } from "react";
import { AlertContext } from "../../context/AlertContext";
import { OfflineContext } from "../../context/OfflineContext";
import {
  AlertData,
  ContentType,
  ContentTypeForEdit,
  Data,
} from "../../types/types";

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
};

interface DeckResponse {
  title: string;
  cards: { title: string; note: string; cardId: string; _id: string }[];
}

type PropTypes = {
  handleDelete: (index: number) => void;
  handleEdit: (cardItem: ContentTypeForEdit) => void;
  handleShowFullScreen: (card: ContentForFullScreen) => void;
  data: Data | DeckResponse;
};
const CardItems = ({
  handleDelete,
  handleEdit,
  handleShowFullScreen,
  data,
}: PropTypes) => {
  const { divRefForUserSettings, handleShowUserInfomation } =
    useContext(UserContext);
  const { deck_id } = useParams();
  const changeColorWhileDragging = useRef<HTMLDivElement | null>(null);
  const { setAlert } = useContext(AlertContext);
  const { isOnline } = useContext(OfflineContext);
  return (
    <Droppable droppableId="cardDropableArea">
      {/* You can't use Draggable directly you have to use it inside Dropable component  */}
      {(provided, snapshot) => {
        return (
          <div
            className="flex flex-row flex-wrap gap-4 justify-center items-center  mx-2 lg:mx-52 mb-48 animate-opacity_page_transition  "
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {data?.cards?.map((card, index: number) => {
              return (
                <Draggable
                  draggableId={`${deck_id!}-${card.cardId}`}
                  index={index}
                  key={card.cardId}
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
                      >
                        <div
                          ref={changeColorWhileDragging}
                          onClick={() => {
                            if (
                              divRefForUserSettings.current?.classList.contains(
                                "scale-100"
                              )
                            ) {
                              handleShowUserInfomation();
                            }
                            handleShowFullScreen({
                              ...card,
                              _id: deck_id!,
                              cardIndex: index,
                            });
                          }}
                          className={`relative border   ${
                            snapshot.isDragging
                              ? "shadow-2xl ring-1 ring-cyan-500 shadow-cyan-500 border-cyan-500  animate-pulse dark:bg-slate-900 bg-[#fcfefc]"
                              : "border-gray-400 "
                          } ${
                            snapshot.draggingOver === "cardDeleteArea"
                              ? "shadow-2xl !shadow-red-500 !border-red-500 !bg-transparent !ring-red-500"
                              : null
                          }   flex flex-col text-gray-800
                rounded-md px-2 lg:pt-2 pt-[0.4rem] h-[8.5rem] lg:h-[9.4rem]  text-justify lg:w-[50vw] w-[95vw] transition-[background-color,border-color] duration-300  dark:hover:bg-slate-800/50 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 group`}
                        >
                          <div className="absolute bottom-0 right-0 ">
                            {/* If I don't use event.stopPropagation() then when I click on delete button or edit button it will first use the onClick that is added on parent i.e div onClick={()=>handleShowFullScreen({...card,_id:deck_id!})} then it will use the onClick that is defined on buttons. which is a problem in this case to avoid that I have used event.stopPropagation() */}
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                if (!isOnline) {
                                  setAlert((preval: AlertData) => ({
                                    ...preval,
                                    severity: "error",
                                    show: true,
                                    message: "No internet connection",
                                    autoHideDuration: 5000,
                                  }));
                                  return;
                                }
                                handleDelete(index);
                                if (
                                  divRefForUserSettings.current?.classList.contains(
                                    "scale-100"
                                  )
                                ) {
                                  handleShowUserInfomation();
                                }
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
                                if (
                                  divRefForUserSettings.current?.classList.contains(
                                    "scale-100"
                                  )
                                ) {
                                  handleShowUserInfomation();
                                }
                              }}
                              type="button"
                              className="text-blue-500 dark:hover:text-sky-600 hover:text-blue-600 text-lg outline-none rounded-tr px-1  text-center dark:text-sky-400 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500"
                              aria-label="Edit Card"
                            >
                              <BiEdit />
                            </button>
                          </div>
                          <p className="font-bold text-md lg:text-lg text-gray-800 dark:text-gray-50 mb-1 p-1 line-clamp-1 break-words break-all -ml-1 ">
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
  );
};

export default memo(CardItems);

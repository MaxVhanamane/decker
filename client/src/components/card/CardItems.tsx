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
import { AlertData, ContentType, ContentTypeForEdit } from "../../types/types";

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
};

type Data = {
  _id: string;
  title: string;
  cards: { title: string; note: string; cardId: string; _id: string }[];
};

interface DeckResponse {
  title: string;
  cards: { title: string; note: string; cardId: string; _id: string }[];
}

type PropTypes = {
  handleDelete: (index: number) => void;
  handleEditCardButtonClick: (cardItem: ContentTypeForEdit) => void;
  handleShowFullScreen: (card: ContentForFullScreen) => void;
  data: Data | DeckResponse;
};
const CardItems = ({
  handleDelete,
  handleEditCardButtonClick,
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
      {(provided) => {
        return (
          <div
            className="grid grid-cols-1 gap-4 items-center justify-center  mx-2 lg:mx-52 mb-48 animate-opacity_page_transition "
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
                        className={`mx-auto ${
                          snapshot.isDragging &&
                          "dark:bg-slate-900 bg-[#fcfefc]"
                        }`}
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
                              cardIndex: index,
                            });
                          }}
                          className={`relative border overflow-hidden group-card  group/card ${
                            snapshot.isDragging
                              ? "shadow-4-sides ring-1 ring-sky-500 shadow-sky-500 border-sky-500 dark:border-emerald-500 dark:ring-emerald-500 dark:shadow-emerald-500 animate-[pulse_3s_linear_infinite] dark:bg-slate-900 bg-[#fcfefc]"
                              : "border-gray-400 "
                          } ${
                            snapshot.draggingOver === "cardDeleteArea"
                              ? "shadow-4-sides !shadow-red-500 !border-red-500  !ring-red-500 "
                              : null
                          }   flex flex-col 
                rounded-md px-2 lg:pt-2 pt-[0.4rem] h-[8.5rem] lg:h-[9.4rem]  text-justify lg:w-[50vw] w-[95vw] transition-[background-color,border-color,box-shadow] duration-300   dark:hover:border-cyan-500 shadow-4-sides dark:hover:shadow-cyan-500   hover:border-emerald-600 hover:shadow-emerald-600 group`}
                        >
                          <div
                            className={`absolute  top-0 -right-1 -z-10 ${
                              snapshot.isDragging && "z-10"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={` ${
                                snapshot.isDragging &&
                                !(snapshot.draggingOver === "cardDeleteArea")
                                  ? "!text-sky-500 dark:!text-emerald-500"
                                  : "group-hover/card:text-emerald-500  dark:group-hover/card:text-sky-500"
                              } ${
                                snapshot.draggingOver === "cardDeleteArea" &&
                                "dark:!text-red-500 !text-red-500 "
                              } ${
                                snapshot.isDragging
                                  ? " animate-scaleUpDown"
                                  : ""
                              } absolute -right-4 -top-8 h-20 w-20 origin-top-right stroke-[0.5] text-black/10 duration-300 group-hover/card:scale-90 dark:text-white/10`}
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`   absolute -right-4 -top-8 h-28 w-28 origin-top-right stroke-[0.4] text-black/10 duration-500 group-hover/card:scale-90 dark:text-white/10 
                              ${
                                snapshot.isDragging &&
                                !(snapshot.draggingOver === "cardDeleteArea")
                                  ? "!text-sky-500 dark:!text-emerald-500 "
                                  : "group-hover/card:text-emerald-500  dark:group-hover/card:text-sky-500"
                              }

                              ${
                                snapshot.draggingOver === "cardDeleteArea" &&
                                "dark:!text-red-500 !text-red-500"
                              }
                              ${
                                snapshot.isDragging
                                  ? " animate-scaleUpDown"
                                  : ""
                              }
                              `}
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                            </svg>
                          </div>
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
                                  handleEditCardButtonClick({
                                    ...card,
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

                          <p className="font-bold text-base lg:text-lg text-gray-800 dark:text-gray-50 mb-1 p-1 line-clamp-1 break-words break-all -ml-1 ">
                            {card.title ? (
                              card.title
                            ) : (
                              <span className="lg:text-base dark:text-gray-500 text-gray-400">
                                You have not added title to this card.
                              </span>
                            )}
                          </p>

                          {/* line-clamp-3 helps to truncate characters after 3 lines */}
                          <p className="text-sm lg:text-base text-gray-800 dark:text-gray-100 px-1 line-clamp-3 break-words break-all -ml-1 ">
                            {card.note ? (
                              card.note
                            ) : (
                              <span className=" dark:text-gray-500 text-gray-400">
                                You have not added a note to this card.
                              </span>
                            )}
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

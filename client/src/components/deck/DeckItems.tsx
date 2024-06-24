import { RefObject, useContext, memo } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { BiEdit } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { BsFillPinFill, BsPin } from "react-icons/bs";
import { ChangeBulbColor } from "../Bulb";
import { DeckType } from "../../types/types";

type PropTypes = {
  bulbRef: RefObject<ChangeBulbColor>;
  allDecks: DeckType[] | undefined;
  handleEditDeck: (deck_id: string, title: string) => void;
  handlePin: (id: string, pinned: boolean) => Promise<void>;
  heading: string;
  radialGradientOverlayRef?: RefObject<HTMLDivElement | null>;
  isCreatingDeck?: boolean;
};

const DeckItems = memo(
  ({
    bulbRef,
    allDecks,
    handleEditDeck,
    handlePin,
    heading,
    radialGradientOverlayRef,
    isCreatingDeck,
  }: PropTypes) => {
    const { handleShowUserInfomation, divRefForUserSettings } =
      useContext(UserContext);
    const navigate = useNavigate();
    return (
      <section
        className={`mt-4 ${
          heading !== "Pinned" ? "mb-24" : "lg:mb-10"
        } mx-1  animate-opacity_page_transition`}
      >
        <h2 className="text-left  text-base font-semibold text-gray-800 dark:text-gray-50  my-4 mx-2 ">
          {heading}
        </h2>

        <Droppable
          droppableId={heading === "Pinned" ? "pinnedArea" : "othersDeckArea"}
          isDropDisabled={true}
        >
          {(provided) => {
            return (
              <div
                className=" flex flex-row flex-wrap gap-2  justify-center items-center py-2 px-1 lg:mx-16 "
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {allDecks
                  ?.filter((deck) => {
                    if (heading === "Pinned") {
                      return deck.pinned === true;
                    } else {
                      return deck.pinned === false;
                    }
                  })
                  .map((deck, index) => {
                    return (
                      <Draggable
                        draggableId={deck._id}
                        index={index}
                        key={deck._id}
                        shouldRespectForcePress
                      >
                        {(provided, snapshot) => {
                          if (heading === "Pinned") {
                            if (snapshot.draggingOver === "DeckDeleteArea") {
                              if (bulbRef?.current?.colorName !== "red") {
                                bulbRef?.current?.resetBulbColor(
                                  "fuchsia",
                                  true
                                );
                              }
                            } else if (snapshot.isDragging) {
                              if (bulbRef?.current?.colorName !== "fuchsia") {
                                bulbRef?.current?.setBulbColor("fuchsia");
                              }
                            }
                          } else {
                            if (snapshot.draggingOver === "DeckDeleteArea") {
                              if (bulbRef?.current?.colorName !== "red") {
                                bulbRef?.current?.resetBulbColor("lime", true);
                              }
                            } else if (snapshot.isDragging) {
                              if (bulbRef?.current?.colorName !== "lime") {
                                bulbRef?.current?.setBulbColor("lime");
                              }
                            }
                          }

                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              className={` ${
                                snapshot.isDragging &&
                                "dark:bg-gray-900 bg-gray-100 rounded-md"
                              }`}
                            >
                              {heading === "Pinned" ? (
                                <div
                                  className={`relative border  ${
                                    snapshot.isDragging
                                      ? ` border-fuchsia-600 animate-pulse shadow-2xl shadow-fuchsia-600 dark:bg-slate-900 bg-gray-100 before:content-[''] before:absolute before:w-[3rem] before:py-[60%]  before:bg-gradient-to-r before:from-fuchsia-600 before:to-fuchsia-500 before:animate-rotate after:content-[''] before:!transition-all before:duration-300 after:absolute after:inset-[0.15rem]  after:bg-gray-100 dark:after:bg-slate-900 ${
                                          !(
                                            snapshot.draggingOver ===
                                            "DeckDeleteArea"
                                          )
                                            ? "dark:!text-fuchsia-600 !text-fuchsia-60"
                                            : ""
                                        } 0 before:!opacity-100 `
                                      : "border-gray-400 "
                                  } ${
                                    snapshot.draggingOver === "DeckDeleteArea"
                                      ? "!border-red-500 !shadow-red-500   before:!from-red-500 before:!to-red-400   dark:!text-red-500 !text-red-500"
                                      : ""
                                  } 
text-gray-800 dark:text-gray-50  
             rounded-md w-[10.5rem] xs:w-[10.9rem] ms:w-[11.8rem] sm:w-[10.9rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify  
             transition-[border-color,box-shadow,background-color] duration-300 hover:shadow-4-sides  dark:hover:bg-gray-900 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500  overflow-hidden  z-30  dark:hover:shadow-sky-500 hover:shadow-teal-500 before:opacity-0 group`}
                                >
                                  <div
                                    className={`absolute w-full h-full bg-[url('/hexagongrid.svg')] bg-center bg-cover after:absolute  after:inset-0 after:m-auto  after:w-[40%] after:aspect-square  after:blur-[40px] after:rounded-full after:opacity-0  z-50 group-hover:after:bg-radialGradient group-hover:after:opacity-100 after:transition-all after:duration-300 pointer-events-none ${
                                      snapshot.isDragging
                                        ? "after:bg-[radial-gradient(#c026d3,#0c7bb3e6)] after:opacity-100"
                                        : "after:bg-radialGradient"
                                    }  ${
                                      snapshot.draggingOver === "DeckDeleteArea"
                                        ? "after:bg-[radial-gradient(#ef4444,#0c7bb3e6)] after:opacity-100"
                                        : ""
                                    }`}
                                  ></div>
                                  <div className="z-40 w-full ">
                                    <div className="absolute bottom-0 right-0">
                                      {/* <button onClick={()=>{handleDelete(deck._id)}} type="button" className="text-red-500 text-lg outline-none   rounded-tr  text-center hover:scale-105"><MdOutlineDeleteOutline/></button> */}

                                      <button
                                        onClick={() => {
                                          handleEditDeck(deck._id, deck.title);
                                          if (
                                            divRefForUserSettings.current?.classList.contains(
                                              "scale-100"
                                            )
                                          ) {
                                            handleShowUserInfomation();
                                          }
                                        }}
                                        type="button"
                                        className=" text-lg outline-none  rounded-tr px-1  text-center hover:scale-95 text-sky-600 dark:text-sky-400"
                                        aria-label="Edit Deck"
                                      >
                                        <BiEdit />
                                      </button>
                                      <button
                                        onClick={() => {
                                          handlePin(deck._id, deck.pinned);
                                          if (
                                            divRefForUserSettings.current?.classList.contains(
                                              "scale-100"
                                            )
                                          ) {
                                            handleShowUserInfomation();
                                          }
                                        }}
                                        type="button"
                                        className="  outline-none   rounded-tr text-sm px-1  text-center  text-red-500 hover:scale-95"
                                        aria-label="Pin Deck"
                                      >
                                        <BsFillPinFill className="text-[0.9rem]" />
                                      </button>
                                    </div>
                                    <Link to={`cards/${deck._id}`}>
                                      <p
                                        onClick={() => {
                                          if (
                                            divRefForUserSettings.current?.classList.contains(
                                              "scale-100"
                                            )
                                          ) {
                                            handleShowUserInfomation();
                                          }
                                        }}
                                        className=" break-all font-bold  line-clamp-1 h-7 text-center  w-full  "
                                      >
                                        {deck.title}
                                      </p>
                                    </Link>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  id={deck._id}
                                  className={`relative border  ${
                                    snapshot.isDragging
                                      ? " border-lime-500 animate-pulse  shadow-2xl shadow-lime-500 dark:bg-slate-900 bg-gray-100 before:content-[''] before:absolute before:w-[3rem] before:py-[60%]  before:bg-gradient-to-r before:from-lime-500 before:to-lime-500 before:animate-rotate after:content-[''] after:absolute after:inset-[0.15rem]  after:bg-gray-100 dark:after:bg-slate-900 dark:text-lime-500 text-lime-500 before:!opacity-100 "
                                      : "border-gray-400 "
                                  } ${
                                    snapshot.draggingOver === "DeckDeleteArea"
                                      ? " !border-red-500  !shadow-red-500 before:!from-red-500 before:!to-red-400   dark:!text-red-500 !text-red-500"
                                      : ""
                                  } 
        text-gray-800 dark:text-gray-50  
                     rounded-md w-[10.5rem] xs:w-[10.9rem] ms:w-[12rem] sm:w-[10.9rem] px-2  min-h-[5.5rem]  flex  justify-center items-center text-justify 
                     transition-[border-color,box-shadow,background-color] duration-300   overflow-hidden  before:absolute before:opacity-0 before:transition-all before:duration-300 z-30 hover:shadow-4-sides group  ${
                       deck.isProcessing
                         ? "cursor-not-allowed"
                         : " dark:hover:shadow-sky-500 hover:shadow-teal-500 dark:hover:bg-gray-900 dark:hover:border-sky-500 hover:bg-gray-100 hover:border-teal-500 "
                     }  `}
                                >
                                  <div
                                    ref={
                                      radialGradientOverlayRef
                                        ? (radialGradientOverlayRef as RefObject<HTMLDivElement>)
                                        : null
                                    }
                                    className={`absolute w-full h-full bg-[url('/hexagongrid.svg')] bg-center bg-cover after:absolute  after:inset-0 after:m-auto  after:w-[40%] after:aspect-square  after:blur-[40px] after:rounded-full after:opacity-0  z-50 group-hover:after:bg-radialGradient group-hover:after:opacity-100 after:transition-all after:duration-300 pointer-events-none  ${
                                      snapshot.isDragging
                                        ? "after:bg-[radial-gradient(#84cc16,#0c7bb3e6)] after:opacity-100"
                                        : "after:bg-radialGradient"
                                    }  ${
                                      snapshot.draggingOver === "DeckDeleteArea"
                                        ? "after:bg-[radial-gradient(#ef4444,#0c7bb3e6)] after:opacity-100"
                                        : ""
                                    }`}
                                  ></div>
                                  <div className="z-40 flex w-full">
                                    {!deck.isProcessing && (
                                      <div className="absolute bottom-0 right-0 ">
                                        <button
                                          onClick={() => {
                                            handleEditDeck(
                                              deck._id,
                                              deck.title
                                            );
                                            if (
                                              divRefForUserSettings.current?.classList.contains(
                                                "scale-100"
                                              )
                                            ) {
                                              handleShowUserInfomation();
                                            }
                                          }}
                                          type="button"
                                          className=" text-lg outline-none  rounded-tr px-1  text-center hover:scale-95 text-sky-600 dark:text-sky-400"
                                          aria-label="Edit Deck"
                                        >
                                          <BiEdit />
                                        </button>

                                        <button
                                          onClick={() => {
                                            handlePin(deck._id, deck.pinned);
                                            if (
                                              divRefForUserSettings.current?.classList.contains(
                                                "scale-100"
                                              )
                                            ) {
                                              handleShowUserInfomation();
                                            }
                                          }}
                                          type="button"
                                          className="  outline-none   rounded-tr text-sm px-1  text-center  text-red-600 dark:text-red-500 hover:scale-95"
                                          aria-label="Pin Deck"
                                        >
                                          <BsPin className="text-[0.9rem]" />
                                        </button>
                                      </div>
                                    )}

                                    <div
                                      onClick={() => {
                                        if (
                                          !isCreatingDeck &&
                                          !deck.isProcessing
                                        ) {
                                          navigate(`cards/${deck._id}`);
                                        }
                                        if (
                                          divRefForUserSettings.current?.classList.contains(
                                            "scale-100"
                                          )
                                        ) {
                                          handleShowUserInfomation();
                                        }
                                      }}
                                      className={`  h-7  w-full flex items-center justify-center`}
                                    >
                                      {deck.isProcessing ? (
                                        <svg
                                          className="animate-spin h-5 w-5 text-gray-400 dark:text-gray-100"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                      ) : (
                                        <p
                                          className={`text-center transition-opacity duration-700  cursor-pointer w-full break-all font-bold  line-clamp-1  ${
                                            deck.isProcessing
                                              ? "opacity-0"
                                              : "opacity-100"
                                          }`}
                                        >
                                          {deck.title}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
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
      </section>
    );
  }
);

export default DeckItems;

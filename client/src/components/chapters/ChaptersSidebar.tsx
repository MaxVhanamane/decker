import {
  memo,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "../Button";
import { ThemeContext } from "../../context/ThemeContext";
import { BsLayoutSidebar } from "react-icons/bs";
import CreateChapterModal from "./CreateChapterModal";
import useGetChapters from "../../hooks/react-query/useGetChapters";
import { useStableParams } from "../../context/stableParamsContext";
import { twMerge } from "tailwind-merge";
import { SidebarContex } from "../../context/SidebarContext";
import Spinner from "../Spinner";
import { useIsDeviceType } from "../../hooks/utility/useIsDeviceType";
import EditChapter from "./EditChapter";
import ConfirmationModal from "../ConfirmationModal";
import { IoWarning } from "react-icons/io5";
import { ChapterDetails } from "../../types/types";
import useDeleteChapter from "../../hooks/react-query/useDeleteChapter";
import { useModalBackNavigationHandler } from "../../hooks/utility/useModalBackNavigationHandler";
import ChapterSidebarActions from "./ChapterSidebarActions";
import { searchContext } from "../../context/SearchContext";
import ChapterContainer from "./ChapterContainer";
import {
  DndSettersContext,
  DndStateContext,
} from "../../context/DndItemContext";
import { getDeckInfo, storeDeckInfo } from "../../functions/deckDataManager";

const ChaptersSidebar = () => {
  const { deckId } = useStableParams();
  const [modalState, setModalState] = useState({
    confirmDeleteCardModal: {
      show: false,
      startClosingModalAnimation: false,
    },
    showEditChapterModal: {
      show: false,
      startClosingModalAnimation: false,
    },
    showCreateChapterModal: {
      show: false,
      startClosingModalAnimation: false,
    },
  });
  const [currentChapterName, setCurrentChapterName] = useState("");
  const [currentChapterId, setCurrentChapterId] = useState("");
  const isMobileOrTablet = useIsDeviceType("tablet");
  const { theme } = useContext(ThemeContext);
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContex);
  const { setAllChaptersState } = useContext(DndSettersContext);
  const { allChaptersState } = useContext(DndStateContext);
  const { animateSearchBar } = useContext(searchContext);
  const { data, isLoading, isError, refetch } = useGetChapters(deckId);
  const { mutate: deleteChapter } = useDeleteChapter();
  const chapterToDeleteRef = useRef<null | ChapterDetails>(null);
  // Store the deck title so that I can display it when a chapter is deleted and the user is navigated to the top-level decks page.
  const deckTitle = useRef(getDeckInfo().deckTitle);

  useEffect(() => {
    if (data) {
      setAllChaptersState(data);
    }
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "/") {
        event.preventDefault();

        if (isSidebarOpen) {
          toggleSidebar(false);
        } else {
          toggleSidebar(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen, toggleSidebar]);

  useModalBackNavigationHandler({
    isOpen: modalState.confirmDeleteCardModal.show,
    modalKey: "confirmDeleteModalForChapter",
    closeModal: () =>
      setModalState((prev) => ({
        ...prev,
        confirmDeleteCardModal: {
          show: true,
          startClosingModalAnimation: true,
        },
      })),
  });
  useModalBackNavigationHandler({
    isOpen: modalState.showEditChapterModal.show,
    modalKey: "showEditChapterModal",
    closeModal: () =>
      setModalState((prev) => ({
        ...prev,
        showEditChapterModal: {
          show: true,
          startClosingModalAnimation: true,
        },
      })),
  });
  const handleAnimateCloseChapterModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      showCreateChapterModal: {
        startClosingModalAnimation: true,
        show: true,
      },
    }));
  }, []);
  useModalBackNavigationHandler({
    isOpen: modalState.showCreateChapterModal.show,
    modalKey: "showCreateChapterModal",
    closeModal: handleAnimateCloseChapterModal,
  });

  const handleCloseChapterModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      showCreateChapterModal: {
        startClosingModalAnimation: false,
        show: false,
      },
    }));
  }, []);

  const handleOnCancelDeleteCard = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      confirmDeleteCardModal: {
        startClosingModalAnimation: false,
        show: false,
      },
    }));
  }, []);

  const handleOpenSidebar = (e: MouseEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (!isSidebarOpen) toggleSidebar(true);
  };

  const handleCloseEditChapterModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      showEditChapterModal: {
        show: false,
        startClosingModalAnimation: false,
      },
    }));
  }, []);

  const handleShowEditChapterModal = useCallback(
    (currentChapterName: string, chapterId: string) => {
      setCurrentChapterName(currentChapterName);
      setCurrentChapterId(chapterId);
      setModalState((prev) => ({
        ...prev,
        showEditChapterModal: {
          show: true,
          startClosingModalAnimation: false,
        },
      }));
    },
    []
  );
  const handleDeleteChapterButtonClick = useCallback(
    (chapter: ChapterDetails) => {
      chapterToDeleteRef.current = chapter;
      setModalState((prev) => ({
        ...prev,
        confirmDeleteCardModal: {
          show: true,
          startClosingModalAnimation: false,
        },
      }));
    },
    []
  );

  const handleOnConfirmDelete = useCallback(() => {
    if (chapterToDeleteRef.current) {
      deleteChapter({ chapterInfo: chapterToDeleteRef.current });
      if (deckTitle) {
        storeDeckInfo(deckTitle.current, "");
      }
      chapterToDeleteRef.current = null;
      setModalState((prev) => ({
        ...prev,
        confirmDeleteCardModal: {
          show: false,
          startClosingModalAnimation: false,
        },
      }));
    }
  }, [deleteChapter]);

  return (
    <>
      <aside
        onClick={(e) => handleOpenSidebar(e)}
        className={twMerge(
          "h-screen bg-gray-50 dark:bg-slate-900 dark:border-slate-300/10  border-slate-900/10 border-r top-0 bottom-0",
          isSidebarOpen ? "xl:w-64 w-64" : "xl:w-[3.25rem] w-64 cursor-pointer",
          isMobileOrTablet
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "",
          isMobileOrTablet &&
            "transition-[transform] duration-200 z-[100] fixed",
          animateSearchBar && "border-r-0"
        )}
      >
        <div
          className={twMerge(
            "flex items-center justify-between flex-row gap-8 h-16 cursor-auto",
            animateSearchBar &&
              "border-b dark:border-slate-300/10  border-slate-900/10"
          )}
        >
          <Button
            onClick={() => {
              if (!isSidebarOpen) toggleSidebar(true);
            }}
            variant="unstyled"
            aria-label="Open Sidebar"
            withTooltip
            hideTooltip={isSidebarOpen}
            toolTipPosition="right"
            toolTipText="Open Sidebar"
            subTooltipText="ctrl+/"
            type="button"
            className="flex items-center justify-center rounded gap-2 ml-3 lg:ml-[5px] p-1"
          >
            <img
              src="/decker_logo.png"
              className={twMerge(
                "w-7 h-7 lg:w-8 lg:h-8 object-contain flex-shrink-0 select-none "
              )}
              alt="decker logo"
            />
            {(isSidebarOpen || isMobileOrTablet) && (
              <span
                className={twMerge(
                  "h-8 w-auto select-none font-bold text-lg sm:text-xl leading-7 sm:leading-normal whitespace-nowrap",
                  theme === "dark" || theme === null
                    ? "text-gray-50"
                    : "text-gray-700"
                )}
              >
                {"Decker".split("").map((char, index) => {
                  return (
                    <span
                      key={index}
                      className="inline-block transform hover:-translate-y-1 active:-translate-y-1 duration-300 "
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            )}
          </Button>

          {(isSidebarOpen || isMobileOrTablet) && (
            <Button
              withTooltip
              toolTipText="Close Sidebar"
              subTooltipText="ctrl+/"
              toolTipPosition="right"
              onClick={() => toggleSidebar(!isSidebarOpen)}
              variant="unstyled"
              className={twMerge(
                "dark:text-gray-50 text-gray-600 cursor-pointer  font-semibold transition-[background-color] duration-300 dark:hover:bg-gray-700 hover:bg-gray-100 rounded-lg p-2 mr-1 lg:mr-2",
                animateSearchBar && "opacity-0"
              )}
            >
              <BsLayoutSidebar />
            </Button>
          )}
        </div>
        <ChapterSidebarActions setModalState={setModalState} />
        {(isSidebarOpen || isMobileOrTablet) && (
          <div className="mt-4">
            <p className="dark:text-gray-500 text-gray-400 text-left pl-[18px] font-light text-sm">
              Chapters
            </p>

            {!isLoading ? (
              !isError ? (
                <div className="mt-0.5 overflow-y-auto scrollbar-extra-small h-[calc(100vh-212px)] pb-12 pt-2 light-scrollbar scrollbar-gutter dark:dark-scrollbar">
                  {data?.chapters?.length && allChaptersState ? (
                    <ChapterContainer
                      data={allChaptersState}
                      handleDeleteChapterButtonClick={
                        handleDeleteChapterButtonClick
                      }
                      handleShowEditChapterModal={handleShowEditChapterModal}
                    />
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 mt-2 text-xs pl-[18px] text-left">
                      Chapters will appear here once created
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4 px-2 gap-2 flex items-center justify-center flex-col">
                  <IoWarning className="text-3xl text-red-500" />
                  <p className="dark:text-gray-200 text-gray-700 text-sm">
                    Something went wrong while fetching chapters
                  </p>
                  <Button
                    variant="unstyled"
                    onClick={() => refetch()}
                    className="
    px-4 py-1 rounded-lg 
    border border-gray-300 dark:border-gray-600
    text-gray-700 dark:text-gray-200 
    hover:bg-gray-100 dark:hover:bg-gray-800
    transition-colors mt-1
  "
                  >
                    Try again
                  </Button>
                </div>
              )
            ) : (
              <div className="mt-10 flex  justify-center">
                <Spinner size="small" message="Fetching chapters..." />
              </div>
            )}
          </div>
        )}
      </aside>
      {isMobileOrTablet && isSidebarOpen && (
        <div
          className="fixed inset-0 dark:bg-black/50 bg-gray-900/40 z-[99]"
          onClick={() => toggleSidebar(false)}
        />
      )}
      {modalState.showCreateChapterModal.show && (
        <CreateChapterModal
          handleCloseChapterModal={handleCloseChapterModal}
          startClosingModalAnimation={
            modalState.showCreateChapterModal.startClosingModalAnimation
          }
          handleAnimateCloseChapterModal={handleAnimateCloseChapterModal}
          maxOrder={data?.maxOrder ?? 0}
        />
      )}
      {modalState.showEditChapterModal.show && (
        <EditChapter
          handleCloseEditChapterModal={handleCloseEditChapterModal}
          currentChapterName={currentChapterName}
          chapterId={currentChapterId}
          showEditChapterModal={modalState.showEditChapterModal.show}
          startClosingModalAnimation={
            modalState.showEditChapterModal.startClosingModalAnimation
          }
        />
      )}
      {modalState.confirmDeleteCardModal.show && (
        <ConfirmationModal
          message="Are you sure you want to delete this chapter?"
          onCancel={handleOnCancelDeleteCard}
          onConfirm={handleOnConfirmDelete}
          showConfirmationModal={modalState.confirmDeleteCardModal.show}
          startClosingModalAnimation={
            modalState.confirmDeleteCardModal.startClosingModalAnimation
          }
        />
      )}
    </>
  );
};

export default memo(ChaptersSidebar);

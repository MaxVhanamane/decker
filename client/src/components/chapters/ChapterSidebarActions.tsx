import { Dispatch, memo, SetStateAction, useContext, useRef } from "react";
import Button from "../Button";
import { PiCards, PiNotePencil } from "react-icons/pi";
import Tooltip from "../Tooltip";
import { Link } from "react-router-dom";
import { GoStack } from "react-icons/go";
import { SidebarContex } from "../../context/SidebarContext";
import { twMerge } from "tailwind-merge";
import { useIsDeviceType } from "../../hooks/utility/useIsDeviceType";
import { useStableParams } from "../../context/stableParamsContext";
import { getDeckInfo, storeDeckInfo } from "../../functions/deckDataManager";
import { ShowToastContext } from "../../context/ToastNotificationContext";

type ChapterSidebarActionsProps = {
  setShowCreateChapterModal: Dispatch<SetStateAction<boolean>>;
};

const ChapterSidebarActions = ({
  setShowCreateChapterModal,
}: ChapterSidebarActionsProps) => {
  const { deckId, chapterId } = useStableParams();
  const { showToast } = useContext(ShowToastContext);
  const { isSidebarOpen } = useContext(SidebarContex);
  const isMobileOrTablet = useIsDeviceType("tablet");
  const goToDecksButtonRef = useRef<HTMLAnchorElement>(null);
  const backToDeckCardsRef = useRef<HTMLAnchorElement>(null);

  const handleDisabledLinkClick = () => {
    showToast({
      message: "You are already inside deck cards",
      severity: "info",
      position: "top-left",
      theme: "auto",
      animationStyle: "scale-up",
    });
  };

  return (
    <div className="mt-1 px-[10px] cursor-auto text-sm lg:text-base">
      <Button
        withTooltip
        toolTipText="Create new chapter"
        hideTooltip={isSidebarOpen}
        onClick={() => setShowCreateChapterModal(true)}
        variant="unstyled"
        className={twMerge(
          "flex items-center transition-[background-color] duration-200 justify-start h-9 w-full text-gray-700 dark:text-gray-200  rounded-lg",
          isSidebarOpen && "hover:bg-gray-100 dark:hover:bg-slate-800"
        )}
      >
        <div className="flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 justify-center w-8 h-8  ">
          <PiNotePencil className="text-lg lg:text-xl " />
        </div>

        {(isSidebarOpen || isMobileOrTablet) && (
          <span className=" select-none overflow-hidden whitespace-nowrap text-sm">
            Create new chapter
          </span>
        )}
      </Button>
      <Tooltip
        toolTipText={" Go to decks"}
        toolTipPosition="right"
        containerRef={goToDecksButtonRef}
        hideTooltip={isSidebarOpen}
      >
        <Link
          ref={goToDecksButtonRef}
          to="/"
          className={twMerge(
            "flex items-center transition-[background-color] duration-200 justify-start h-9 w-full text-gray-700 dark:text-gray-200 rounded-lg focus-visible:ring-2 dark:ring-blue-500 ring-gray-600 outline-none mt-[1px]",
            isSidebarOpen && "hover:bg-gray-100 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 justify-center w-8 h-8  ">
            <GoStack className="text-lg lg:text-xl" />
          </div>

          {(isSidebarOpen || isMobileOrTablet) && (
            <span className="select-none overflow-hidden whitespace-nowrap text-sm">
              Go to decks
            </span>
          )}
        </Link>
      </Tooltip>
      <Tooltip
        toolTipText={"Back to deck cards"}
        toolTipPosition="right"
        containerRef={backToDeckCardsRef}
        hideTooltip={isSidebarOpen}
      >
        <Link
          ref={backToDeckCardsRef}
          to={`/cards/${deckId}`}
          onClick={() => {
            const deckInfo = getDeckInfo();
            storeDeckInfo(deckInfo.deckTitle, "");
            if (!chapterId) handleDisabledLinkClick();
          }}
          className={twMerge(
            "flex items-center transition-[background-color] duration-200 justify-start h-9 w-full text-gray-700 dark:text-gray-200 rounded-lg focus-visible:ring-2 dark:ring-blue-500 ring-gray-600 outline-none mt-[1px]",
            isSidebarOpen && "hover:bg-gray-100 dark:hover:bg-slate-800",
            !chapterId &&
              " dark:text-gray-500 text-gray-400 dark:bg-slate-800 bg-gray-100"
          )}
        >
          <div className="flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 justify-center w-8 h-8  ">
            <PiCards className="text-lg lg:text-xl" />
          </div>

          {(isSidebarOpen || isMobileOrTablet) && (
            <span className="select-none overflow-hidden whitespace-nowrap text-sm">
              Back to deck cards
            </span>
          )}
        </Link>
      </Tooltip>
    </div>
  );
};

export default memo(ChapterSidebarActions);

import { Dispatch, memo, SetStateAction, useCallback } from "react";
import CardToolbar from "./toolbar/CardToolbar";
import { RiArrowUpSLine } from "react-icons/ri";
import Button from "../Button";

type EditCardToolbarPropType = {
  setShowHyperlinkModal: Dispatch<SetStateAction<boolean>>;
  setCloseEditModalWithAnimation: Dispatch<SetStateAction<boolean>>;
  handleSaveEdit: () => void;
  setToolbarPosition: Dispatch<SetStateAction<"top" | "bottom">>;
  toolbarPosition: "top" | "bottom";
};

const EditCardToolbar = ({
  handleSaveEdit,
  setCloseEditModalWithAnimation,
  setShowHyperlinkModal,
  setToolbarPosition,
  toolbarPosition,
}: EditCardToolbarPropType) => {
  const toggleToolbarPosition = useCallback(() => {
    setToolbarPosition((prev) => {
      if (prev === "bottom") {
        return "top";
      } else {
        return "bottom";
      }
    });
    if (toolbarPosition === "top") {
      localStorage.setItem("editToolbarPosition", "bottom");
    } else {
      localStorage.setItem("editToolbarPosition", "top");
    }
  }, [toolbarPosition]);
  return (
    <div
      className={`w-full xl:h-14 h-20 dark:md:bg-slate-700 dark:bg-slate-900  bg-white  flex items-center justify-center   border-gray-400/40 dark:border-gray-300/10 md:bg-gray-100 flex-shrink-0 z-10 ${
        toolbarPosition === "top"
          ? "md:rounded-t-md border-b"
          : "md:rounded-b-md border-t"
      }`}
    >
      <div className="flex items-center justify-between xl:justify-center w-full xl:px-2 h-full">
        <Button
          variant="unstyled"
          withTooltip
          toolTipText={
            toolbarPosition === "top" ? "Move toolbar down" : "Move toolbar up"
          }
          toolTipPosition={toolbarPosition === "top" ? "bottom" : "top"}
          className="dark:text-gray-50 dark:hover:bg-gray-600 hover:bg-gray-200 hover:rounded-md xl:p-2 p-1 text-sm  dark:hover:text-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-300 rounded-md hidden xl:block"
          type="button"
          onClick={toggleToolbarPosition}
        >
          <RiArrowUpSLine
            className={`text-2xl ${
              toolbarPosition === "top" ? "rotate-180" : ""
            }`}
          />
        </Button>
        <CardToolbar
          mode="edit"
          tabbable
          setShowHyperlinkModal={setShowHyperlinkModal}
          handleSaveEdit={handleSaveEdit}
          setCloseEditModalWithAnimation={setCloseEditModalWithAnimation}
          toolbarPosition={toolbarPosition}
          toggleToolbarPosition={toggleToolbarPosition}
        />
      </div>
    </div>
  );
};

export default memo(EditCardToolbar);

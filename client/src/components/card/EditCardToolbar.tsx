import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import CardToolbar from "./toolbar/CardToolbar";
import Button from "../Button";
import { ExtendedToolbar } from "./toolbar/ExtendedToolbar";
import { twMerge } from "tailwind-merge";
import { BsArrowDownShort } from "react-icons/bs";
import { useClickOutside } from "../../hooks/utility/useClickOutside";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";

type EditCardToolbarPropType = {
  setShowHyperlinkModal: Dispatch<SetStateAction<boolean>>;
  handleSaveEdit: () => void;
  handleCloseEditTextEditor: () => void;
  setToolbarPosition: Dispatch<SetStateAction<"top" | "bottom">>;
  toolbarPosition: "top" | "bottom";
};

const EditCardToolbar = ({
  handleSaveEdit,
  setShowHyperlinkModal,
  setToolbarPosition,
  toolbarPosition,
  handleCloseEditTextEditor,
}: EditCardToolbarPropType) => {
  const extendedToolbarRefEdit = useRef<HTMLDivElement>(null);
  const [isEditCardMoreMenuOpen, setIsEditCardMoreMenuOpen] = useState(false);

  const handleOpenMoreEditFormattingMenu = useCallback(() => {
    setIsEditCardMoreMenuOpen((prev) => !prev);
  }, []);

  useClickOutside(
    extendedToolbarRefEdit,
    isEditCardMoreMenuOpen,
    handleOpenMoreEditFormattingMenu,
    { excludeSelectors: ["[data-click-outside-ignore-more-options-edit]"] }
  );

  useFocusTrap(extendedToolbarRefEdit, "both", {
    enabled: isEditCardMoreMenuOpen,
  });

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
      <div className="flex items-center justify-between xl:justify-center w-full xl:px-2 h-full relative">
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
          <BsArrowDownShort
            className={`text-2xl ${
              toolbarPosition === "top" ? "" : "rotate-180"
            }`}
          />
        </Button>
        <div className="w-full h-full dark:md:bg-slate-700 dark:bg-slate-900  bg-white relative ">
          <CardToolbar
            mode="edit"
            tabbable
            setShowHyperlinkModal={setShowHyperlinkModal}
            handleSaveEdit={handleSaveEdit}
            toolbarPosition={toolbarPosition}
            toggleToolbarPosition={toggleToolbarPosition}
            handleCloseEditTextEditor={handleCloseEditTextEditor}
            handleOpenMoreEditFormattingMenu={handleOpenMoreEditFormattingMenu}
          />
          <div
            ref={extendedToolbarRefEdit}
            className={twMerge(
              "border-gray-400/40 dark:border-gray-300/10 flex items-center justify-center dark:bg-slate-900  dark:md:bg-slate-700 bg-white md:bg-gray-100 p-2 border h-10 w-20 absolute  transition-transform  duration-200 ease-out transform-gpu -z-10",
              isEditCardMoreMenuOpen &&
                toolbarPosition === "top" &&
                "-translate-y-0",

              !isEditCardMoreMenuOpen &&
                toolbarPosition === "top" &&
                "-translate-y-full",
              isEditCardMoreMenuOpen &&
                toolbarPosition === "bottom" &&
                "translate-y-0",

              !isEditCardMoreMenuOpen &&
                toolbarPosition === "bottom" &&
                "translate-y-full",

              toolbarPosition === "bottom"
                ? " bottom-full md:right-4 right-0 rounded-tl-md md:rounded-tr-md "
                : " top-full md:right-4 right-0 rounded-bl-md md:rounded-br-md "
            )}
          >
            <ExtendedToolbar mode="create" toolbarPosition="top" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(EditCardToolbar);

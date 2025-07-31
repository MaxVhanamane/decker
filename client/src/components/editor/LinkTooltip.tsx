import Button from "../Button";
import { FiExternalLink } from "react-icons/fi";
import { MdModeEdit, MdOutlineDeleteOutline } from "react-icons/md";
import { useEditorActions } from "../../hooks/editor/useEditorActions";
import {
  Dispatch,
  memo,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CustomEditor } from "../../utils/editor/customEditor";
import { ReactEditor, useSlateStatic } from "slate-react";
import { useClickOutside } from "../../hooks/utility/useClickOutside";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";
import { Range, Transforms } from "slate";

type LinkTooltipProps = {
  mode: "create" | "edit";
  selectedLinkDetails: { title: string; url: string; linkPosition: Range };
  setSelectedLinkDetails: Dispatch<
    SetStateAction<{
      title: string;
      url: string;
      linkPosition: Range;
    } | null>
  >;
};

const LinkTooltip = ({
  selectedLinkDetails,
  setSelectedLinkDetails,
  mode,
}: LinkTooltipProps) => {
  const editor = useSlateStatic();
  const toolTipRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const { handleLink } = useEditorActions();
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [newLinkDetails, setNewLinkDetails] = useState({ title: "", url: "" });
  const { showToast } = useContext(ShowToastContext);

  useClickOutside(toolTipRef, !showEditLinkModal, () =>
    setSelectedLinkDetails(null)
  );
  useClickOutside(editModalRef, showEditLinkModal, () =>
    setShowEditLinkModal(false)
  );
  useFocusTrap(toolTipRef, "both", {
    enabled: !showEditLinkModal,
    onEscape: () => setSelectedLinkDetails(null),
  });
  useFocusTrap(editModalRef, "both", {
    enabled: showEditLinkModal,
    onEscape: () => setShowEditLinkModal(false),
  });

  useEffect(() => {
    const positionElement = (elementRef: React.RefObject<HTMLDivElement>) => {
      if (selectedLinkDetails.linkPosition && elementRef.current) {
        const domRange = ReactEditor.toDOMRange(
          editor,
          selectedLinkDetails.linkPosition
        );
        const rect = domRange.getBoundingClientRect();
        const element = elementRef.current;
        const elementWidth = element.offsetWidth;
        const elementHeight = element.offsetHeight;

        const OFFSET_Y = 20;

        // Consider closest scrollable container if needed
        let relativeParent;
        if (mode === "create") {
          relativeParent = domRange.startContainer.parentElement?.closest(
            "[data-editor-parent-create]"
          );
        } else {
          relativeParent = domRange.startContainer.parentElement?.closest(
            "[data-editor-parent-edit]"
          );
        }

        const scrollContainer = relativeParent || document.body;
        const parentRect = scrollContainer.getBoundingClientRect();

        let relativeLeft =
          rect.left - parentRect.left + scrollContainer.scrollLeft;
        let relativeTop = rect.top - parentRect.top + scrollContainer.scrollTop;

        // Adjust horizontal position
        if (relativeLeft + elementWidth > scrollContainer.clientWidth) {
          relativeLeft = scrollContainer.clientWidth - elementWidth;
        }
        if (relativeLeft < 0) {
          relativeLeft = 0;
        }

        // Adjust vertical position
        let adjustedTop = relativeTop + OFFSET_Y;
        if (adjustedTop + elementHeight > scrollContainer.clientHeight) {
          adjustedTop = relativeTop - elementHeight - OFFSET_Y;
        }
        if (adjustedTop < 0) {
          adjustedTop = 0;
        }

        element.style.position = "absolute";
        element.style.left = `${relativeLeft}px`;
        element.style.top = `${adjustedTop}px`;
      }
    };

    // Position the tooltip if it's visible
    if (!showEditLinkModal) {
      positionElement(toolTipRef);
    }

    // Position the edit modal if it's visible
    if (showEditLinkModal) {
      positionElement(editModalRef);
    }
  }, [showEditLinkModal]);

  // If the user opens the edit modal and closes it by clicking outside,
  // the link selection from the editor is lost.
  // We need a valid selection when saving the edited link,
  // so we refocus on the link element when the edit modal opens.

  useEffect(() => {
    if (showEditLinkModal) {
      const { focus } = selectedLinkDetails.linkPosition;
      Transforms.select(editor, {
        anchor: focus,
        focus: focus,
      });
    }
  }, [selectedLinkDetails.linkPosition, showEditLinkModal]);

  return !showEditLinkModal ? (
    <div
      ref={toolTipRef}
      className="absolute -left-full -top-full z-50 mt-2 w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-slate-800 shadow-lg p-3 text-sm text-gray-700 dark:text-white animate-[opacity_0.2s_ease]"
    >
      <div className="mb-3 break-all truncate">{selectedLinkDetails.url}</div>

      <div className="flex justify-between gap-2">
        <Button
          variant="unstyled"
          type="button"
          onClick={() => {
            window.open(
              selectedLinkDetails.url,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          className="flex items-center gap-1 hover:underline transition duration-200 rounded-md p-1"
        >
          <FiExternalLink className="text-base" />
          Open
        </Button>

        <Button
          variant="unstyled"
          type="button"
          onClick={() => {
            setShowEditLinkModal(true);
            setNewLinkDetails({
              title: selectedLinkDetails.title,
              url: selectedLinkDetails.url,
            });
          }}
          className="flex items-center gap-1  hover:underline transition duration-200 rounded-md p-1"
        >
          <MdModeEdit className="text-base" />
          Edit
        </Button>

        <Button
          variant="unstyled"
          type="button"
          onClick={() => {
            setSelectedLinkDetails(null);
            handleLink();
          }}
          className="flex items-center gap-1  hover:underline transition duration-200 rounded-md p-1"
        >
          <MdOutlineDeleteOutline className="text-base" />
          Remove
        </Button>
      </div>
    </div>
  ) : (
    <div
      ref={editModalRef}
      className="flex items-center justify-center flex-col gap-3  dark:bg-slate-800 dark:border-gray-500 bg-gray-100 dark:text-white text-gray-900 rounded-lg p-6 z-10 border border-gray-300 shadow-md dark:shadow-none max-w-md w-96 absolute animate-[opacity_0.2s_ease]"
    >
      <label htmlFor="title" className="text-lg font-semibold">
        Title
      </label>
      <input
        id="title"
        value={newLinkDetails.title}
        onChange={(e) =>
          setNewLinkDetails((prev) => ({ ...prev, title: e.target.value }))
        }
        className="dark:bg-slate-700 bg-gray-200 rounded-md h-10 p-3 w-full text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-gray-500 focus:ring-gray-300 transition duration-200"
        placeholder="Enter new title"
        autoFocus
      />

      <label htmlFor="url" className="text-lg font-semibold mt-4">
        URL
      </label>
      <input
        id="url"
        value={newLinkDetails.url}
        onChange={(e) =>
          setNewLinkDetails((prev) => ({ ...prev, url: e.target.value }))
        }
        className="dark:bg-slate-700 bg-gray-200 rounded-md h-10 p-3 w-full text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 dark:focus:ring-gray-500 focus:ring-gray-300 transition duration-200"
        placeholder="Enter new URL"
      />

      <div className="flex items-center justify-center gap-4 mt-6 w-full">
        <Button
          variant="unstyled"
          type="button"
          className="rounded-md px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white transition duration-200 dark:ring-white"
          onClick={(e) => {
            e.stopPropagation();
            if (!newLinkDetails.url) {
              showToast({
                message: "Please enter a URL to continue.",
                severity: "warning",
                autoHideDuration: 3000,
                progressBar: "hide",
                position: "top-center",
              });
              return;
            } else if (!newLinkDetails.title) {
              showToast({
                message: "Please enter a title for the link.",
                severity: "warning",
                autoHideDuration: 3000,
                progressBar: "hide",
                position: "top-center",
              });
              return;
            }
            CustomEditor.toggleLink(
              editor,
              "link",
              newLinkDetails.url,
              newLinkDetails.title
            );
            setSelectedLinkDetails(null);
          }}
        >
          Save
        </Button>
        <Button
          variant="unstyled"
          type="button"
          className="rounded-md px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white transition duration-200"
          onClick={() => setShowEditLinkModal(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default memo(LinkTooltip);

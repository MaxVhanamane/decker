import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HiOutlineArrowSmDown, HiOutlineArrowSmUp } from "react-icons/hi";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { IoIosArrowBack } from "react-icons/io";
import { ReactEditor, Slate } from "slate-react";
import RichTextEditor from "../editor/RichTextEditor";
import { Descendant, Editor, Element, Node, Transforms } from "slate";
import EditCardToolbar from "./EditCardToolbar";
import type { ContentTypeForEdit } from "../../types/types";
import LinkModal from "../editor/LinkModal";
import type { CustomElementType } from "../../types/textEditorTypes";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";
import { twMerge } from "tailwind-merge";
import Button from "../Button";
import ThemeToggler from "../ThemeToggler";
import SelectionToolbar from "../editor/selection-toolbar/SelectionToolbar";
import { createCardEditor } from "../../utils/editor/createEditor";
import { CommandPaletteHandle } from "./CardInput";
import { getTextAfterSlash } from "../../utils/editor/commandUtils";
import { motion } from "motion/react";
import { EditCardEditorSkeleton } from "./EditCardEditorSkeleton";
import DummyEditorContent from "./DummyEditorContent";
type EditCardProps = {
  setEditContent: Dispatch<SetStateAction<ContentTypeForEdit | null>>;
  editContent: ContentTypeForEdit | null;
  handleSaveEdit: () => void;
  handleCloseEditTextEditor: () => void;
  source: "deck" | "search";
  isCardFullscreen: boolean;
  isClosingEditModal: boolean;
};

const EditCard = ({
  editContent,
  setEditContent,
  handleSaveEdit,
  source,
  isCardFullscreen,
  handleCloseEditTextEditor,
  isClosingEditModal,
}: EditCardProps) => {
  const [showHyperlinkModal, setShowHyperlinkModal] = useState(false);
  const [isLayoutAnimationComplete, setIsLayoutAnimationComplete] =
    useState(false);

  const editorContainer = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const comandPaletteConfig = useRef<CommandPaletteHandle | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<"top" | "bottom">(
    () => {
      const position = localStorage.getItem("editToolbarPosition");
      if (position === "top" || position === "bottom") {
        return position;
      } else {
        return "bottom";
      }
    }
  );
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);
  const editor = useMemo(() => createCardEditor(), []);

  useFocusTrap(editorContainer, "tab", {
    onEscape: handleCloseEditTextEditor,
  });
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const { showToast } = useContext(ShowToastContext);

  const handleEditorContentClick = useCallback(
    (e: React.MouseEvent) => {
      const domRange = window.getSelection()?.getRangeAt(0);
      if (!domRange) return;

      // Check if editor is empty
      if (editor.children.length === 0) return;

      // Get the last top-level element (not the deepest node)
      const lastElementPath = [editor.children.length - 1];
      const lastElementEntry = Editor.node(editor, lastElementPath);
      if (!lastElementEntry) return;

      const [lastElement] = lastElementEntry;
      // Simple check: if last element is a code-block, always allow adding paragraph
      // For other elements, check if they have content
      const shouldAllowInsert =
        (Element.isElement(lastElement) && lastElement.type === "code-block") ||
        Node.string(lastElement).trim() !== "";

      if (shouldAllowInsert) {
        try {
          const domNode = ReactEditor.toDOMNode(editor, lastElement);
          const rect = domNode.getBoundingClientRect();

          // Check if click is clearly below last node
          if (e.clientY > rect.bottom + 5) {
            const newParagraph: CustomElementType = {
              type: "paragraph",
              children: [{ text: "" }],
            };

            const insertPath = [editor.children.length];
            Transforms.insertNodes(editor, newParagraph, { at: insertPath });

            const point = Editor.start(editor, insertPath);
            Transforms.select(editor, { anchor: point, focus: point });
            ReactEditor.focus(editor);
          }
        } catch (error) {
          // Handle case where DOM node can't be found
          // console.debug("Could not get DOM node for click handling");
        }
      }
    },
    [editor]
  );

  const scrollToBottom = () => {
    const ref = scrollableContainerRef as MutableRefObject<HTMLDivElement>;

    const isScrollable = ref.current!.scrollHeight > ref.current!.clientHeight;

    if (isScrollable) {
      if (ref?.current) {
        ref.current.scrollTo({
          top: ref.current.scrollHeight,
          behavior: "smooth",
        });
      }
    } else {
      showToast({
        message: "There's nothing to scroll.",
        severity: "warning",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });

      setShowScrollToTopButton(false);
      setShowScrollToBottomButton(false);
    }
  };

  const scrollToTop = () => {
    const ref = scrollableContainerRef as MutableRefObject<HTMLDivElement>;

    const isScrollable = ref.current!.scrollHeight > ref.current!.clientHeight;

    if (isScrollable) {
      if (ref?.current) {
        ref.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } else {
      showToast({
        message: "There's nothing to scroll.",
        severity: "warning",
        autoHideDuration: 5000,
        position: "top-center",
        animationStyle: "scale-up",
        theme: "auto",
      });
      setShowScrollToTopButton(false);
      setShowScrollToBottomButton(false);
    }
  };

  let prevScrollPosition = 0;

  const handleScroll = () => {
    const ref = scrollableContainerRef as MutableRefObject<HTMLDivElement>;
    //By using scrollThreshold, you provide a more forgiving and user-friendly experience, as it allows the buttons to appear slightly before reaching the absolute top or bottom, making it easier for users to interact with them.
    const scrollThreshold = 2;

    if (ref.current) {
      const scrollPosition = ref.current.scrollTop;
      if (scrollPosition > prevScrollPosition) {
        // Scrolling down
        setShowScrollToTopButton(false);
        setShowScrollToBottomButton(true);
      } else if (scrollPosition < prevScrollPosition) {
        // Scrolling up
        setShowScrollToBottomButton(false);
        setShowScrollToTopButton(true);
      }

      prevScrollPosition = scrollPosition;
    }

    const scrollTop = ref.current.scrollTop;
    const scrollHeight = ref.current.scrollHeight;
    const clientHeight = ref.current.clientHeight;

    // Check if you've reached the top
    if (scrollTop <= scrollThreshold) {
      setShowScrollToTopButton(false);
      setShowScrollToBottomButton(true);
    }

    // Check if you've reached the bottom
    if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
      setShowScrollToBottomButton(false);
      setShowScrollToTopButton(true);
    }
  };

  useEffect(() => {
    const ref = scrollableContainerRef as MutableRefObject<HTMLDivElement>;

    if (ref.current) {
      ref.current.addEventListener("scroll", handleScroll, true);

      // Clean up the event listener
      return () => {
        ref.current?.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, []);

  const handleChange = (value: Descendant[]) => {
    setEditContent((prev) => ({ ...prev!, note: value }));
    if (
      comandPaletteConfig.current &&
      comandPaletteConfig.current.showCommandPalette
    ) {
      const text = getTextAfterSlash(editor);

      //  Close only if:
      // 1. text is empty (slash was deleted)
      // 2. text contains two or more **consecutive** spaces
      if (text === null) {
        comandPaletteConfig.current.closeCommandPalette();
        comandPaletteConfig.current.resetSlashPosition();

        return;
      }
      if (text && /\s{2,}$/.test(text)) {
        comandPaletteConfig.current.closeCommandPalette();
        comandPaletteConfig.current.resetSlashPosition();

        return;
      }

      comandPaletteConfig.current.setCommandSearch(text || "");
    }
  };
  return (
    <motion.div
      initial={isCardFullscreen ? { scale: 0.95 } : undefined}
      animate={isCardFullscreen ? { scale: 1 } : undefined}
      transition={
        isCardFullscreen
          ? {
              type: "spring",
              stiffness: 1000,
              damping: 20,
            }
          : undefined
      }
      exit={{
        opacity: 0,
        scale: isCardFullscreen ? 0.8 : undefined,
        transition: {
          type: "tween",
          duration: isCardFullscreen ? 0.6 : 0.3,
          ease: isCardFullscreen ? "backOut" : [0.25, 0.1, 0.25, 1],
        },
      }}
      ref={editorContainer}
      onAnimationComplete={() => {
        setIsLayoutAnimationComplete(true);
      }}
      className={` z-[90] dark:md:bg-slate-900/70 md:bg-white/40  md:supports-[backdrop-filter]:bg-transparent
    md:supports-[backdrop-filter]:backdrop-blur-lg
    dark:md:supports-[backdrop-filter]:bg-transparent
    dark:md:supports-[backdrop-filter]:backdrop-blur-md fixed  inset-0 flex justify-center items-center outline-none`}
    >
      <div className="absolute z-50 top-0 left-0">
        <div
          id="dropdownPortalContainerForEdit"
          className="pointer-events-auto"
        />
      </div>

      <motion.div
        onLayoutAnimationComplete={() => {
          setIsLayoutAnimationComplete(true);
        }}
        layoutId={
          isCardFullscreen ? undefined : `${source}-card-${editContent?.cardId}`
        }
        transition={{
          layout: {
            type: "spring",
            stiffness: 200,
            damping: 24,
          },
        }}
        className="md:w-[45rem] lg:w-[50rem] w-full flex flex-col h-full md:h-[90%] lg:h-[92%] md:max-h-[50rem] md:p-2 dark:md:bg-slate-500 relative md:bg-slate-300 md:rounded-[12px]"
      >
        <div className="w-full h-16 bg-white dark:bg-slate-900 border-b border-gray-400/40 dark:border-gray-300/10 px-4  flex items-center justify-between md:hidden flex-shrink-0">
          <div>
            <Button
              variant="unstyled"
              onClick={handleCloseEditTextEditor}
              className=" text-lg md:-ml-3 rounded-md dark:text-gray-200 text-gray-500  "
              aria-label="Back"
              title="Back"
            >
              <IoIosArrowBack className="md:-ml-auto -ml-[0.3rem]" />
              <p className="text-xs ">Back</p>
            </Button>
          </div>

          <div className="-mr-[0.4rem]">
            <ThemeToggler />
          </div>
        </div>

        {isLayoutAnimationComplete ? (
          <Slate
            editor={editor}
            initialValue={editContent?.note ?? []}
            onChange={handleChange}
          >
            {toolbarPosition === "top" && (
              <EditCardToolbar
                handleSaveEdit={handleSaveEdit}
                setShowHyperlinkModal={setShowHyperlinkModal}
                setToolbarPosition={setToolbarPosition}
                toolbarPosition={toolbarPosition}
                handleCloseEditTextEditor={handleCloseEditTextEditor}
              />
            )}
            <div
              ref={scrollableContainerRef}
              className={`px-4 pb-32 w-full outline-none text-gray-800  bg-white font-light text-base text-left dark:md:bg-slate-800 dark:bg-slate-900 dark:text-white resize-none h-full overflow-y-auto  dark:dark-scrollbar light-scrollbar scrollbar-small scrollbar-gutter relative ${
                toolbarPosition === "bottom" && "md:rounded-t-md"
              }`}
              onClick={handleEditorContentClick}
              data-editor-parent-edit
            >
              {!isClosingEditModal ? (
                <RichTextEditor
                  setShowHyperlinkModal={setShowHyperlinkModal}
                  mode="edit"
                  comandPaletteConfig={comandPaletteConfig}
                />
              ) : (
                <DummyEditorContent />
              )}

              <SelectionToolbar
                mode="edit"
                setShowHyperlinkModal={setShowHyperlinkModal}
              />
            </div>

            {showScrollToBottomButton && (
              <Button
                variant="unstyled"
                className={twMerge(
                  " absolute  bottom-20 right-5 border-2 dark:border-gray-500 border-gray-400 rounded-full p-1 text-gray-700 dark:text-gray-300",
                  toolbarPosition === "top" ? "bottom-6" : "bottom-24"
                )}
                onClick={scrollToBottom}
              >
                <HiOutlineArrowSmDown />
              </Button>
            )}
            {showScrollToTopButton && (
              <Button
                variant="unstyled"
                className={twMerge(
                  "absolute right-5 border-2 dark:border-gray-500 border-gray-400 rounded-full p-1 text-gray-700 dark:text-gray-300",
                  toolbarPosition === "top" ? "bottom-6" : "bottom-24"
                )}
                onClick={scrollToTop}
              >
                <HiOutlineArrowSmUp />
              </Button>
            )}

            {toolbarPosition === "bottom" && (
              <EditCardToolbar
                handleSaveEdit={handleSaveEdit}
                setShowHyperlinkModal={setShowHyperlinkModal}
                setToolbarPosition={setToolbarPosition}
                toolbarPosition={toolbarPosition}
                handleCloseEditTextEditor={handleCloseEditTextEditor}
              />
            )}

            {showHyperlinkModal && (
              <LinkModal setShowHyperlinkModal={setShowHyperlinkModal} />
            )}
          </Slate>
        ) : (
          <EditCardEditorSkeleton toolbarPosition={toolbarPosition} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default memo(EditCard);

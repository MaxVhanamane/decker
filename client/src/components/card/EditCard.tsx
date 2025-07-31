import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { HiOutlineArrowSmDown, HiOutlineArrowSmUp } from "react-icons/hi";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import { IoIosArrowBack } from "react-icons/io";
import { ReactEditor, Slate, withReact } from "slate-react";
import RichTextEditor from "../editor/RichTextEditor";
import { withInlineElements } from "../../utils/editor/plugins/withInlineElements";
import { createEditor, Editor, Element, Node, Transforms } from "slate";
import EditCardToolbar from "./EditCardToolbar";
import type { ContentTypeForEdit } from "../../types/types";
import LinkModal from "../editor/LinkModal";
import { withResetToParagraphOnBackspaceWhenEmpty } from "../../utils/editor/plugins/withResetToParagraphOnBackspaceWhenEmpty";
import { withResetToParagraphOnEnter } from "../../utils/editor/plugins/withResetToParagraphOnEnter";
import { withTitleBackspaceProtection } from "../../utils/editor/plugins/withTitleBackspaceProtection";
import { withTitle } from "../../utils/editor/plugins/withTitle";
import { withUnwrapEmptyInlines } from "../../utils/editor/plugins/withUnwrapEmptyInlines";
import { withClearEmptyMarks } from "../../utils/editor/plugins/withClearEmptyMarks";
import { withVoidElements } from "../../utils/editor/plugins/withVoidElements";
import { withHistory } from "slate-history";
import { withExitInlineOnSpace } from "../../utils/editor/plugins/withExitInlineOnSpace";
import type { CustomElementType } from "../../types/textEditorTypes";

type EditCardProps = {
  setShowEditModalForCard: Dispatch<React.SetStateAction<boolean>>;
  showEditModalForCard: boolean;
  setEditContent: Dispatch<SetStateAction<ContentTypeForEdit | null>>;
  editContent: ContentTypeForEdit | null;
  handleSaveEdit: () => void;
  closeEditModalWithAnimation: boolean;
  setCloseEditModalWithAnimation: Dispatch<React.SetStateAction<boolean>>;
};

const EditCard = forwardRef<HTMLTextAreaElement, EditCardProps>(
  (
    {
      setShowEditModalForCard,
      editContent,
      setEditContent,
      handleSaveEdit,
      showEditModalForCard,
      closeEditModalWithAnimation,
      setCloseEditModalWithAnimation,
    },
    editTextareaRef
  ) => {
    const [showHyperlinkModal, setShowHyperlinkModal] = useState(false);
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
    const editor = useMemo(() => {
      return withResetToParagraphOnBackspaceWhenEmpty(
        withResetToParagraphOnEnter(
          withTitleBackspaceProtection(
            withTitle(
              withInlineElements(
                withUnwrapEmptyInlines(
                  withClearEmptyMarks(
                    withVoidElements(
                      withExitInlineOnSpace(
                        withReact(withHistory(createEditor()))
                      )
                    )
                  )
                )
              )
            )
          )
        )
      );
    }, []);
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
          (Element.isElement(lastElement) &&
            lastElement.type === "code-block") ||
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
            console.debug("Could not get DOM node for click handling");
          }
        }
      },
      [editor]
    );
    const scrollToBottom = () => {
      const ref = editTextareaRef as MutableRefObject<HTMLTextAreaElement>;

      const isScrollable =
        ref.current!.scrollHeight > ref.current!.clientHeight;

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
      const ref = editTextareaRef as MutableRefObject<HTMLTextAreaElement>;

      const isScrollable =
        ref.current!.scrollHeight > ref.current!.clientHeight;

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
      const ref = editTextareaRef as MutableRefObject<HTMLTextAreaElement>;
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
      const ref = editTextareaRef as MutableRefObject<HTMLTextAreaElement>;

      if (ref.current) {
        ref.current.addEventListener("scroll", handleScroll, true);

        // Clean up the event listener
        return () => {
          ref.current?.removeEventListener("scroll", handleScroll, true);
        };
      }
    }, []);

    const handleOnAnimationEnd = () => {
      if (showEditModalForCard && closeEditModalWithAnimation) {
        setShowEditModalForCard(false);
        setCloseEditModalWithAnimation(false);
      }
    };

    return (
      <div
        onAnimationEnd={handleOnAnimationEnd}
        className={` z-[90] dark:md:bg-slate-900/70 md:bg-white/40  md:supports-[backdrop-filter]:bg-transparent
    md:supports-[backdrop-filter]:backdrop-blur-lg
    dark:md:supports-[backdrop-filter]:bg-transparent
    dark:md:supports-[backdrop-filter]:backdrop-blur-md fixed  inset-0 flex justify-center items-center  transition-opacity duration-500 h-[var(--window-height)]    ${
      closeEditModalWithAnimation
        ? "opacity-0 animate-[opacityFadeOut_0.2s_linear_1] "
        : "animate-[opacity_0.2s_linear_1] "
    } `}
      >
        <div className="absolute z-50 top-0 left-0">
          <div
            id="dropdownPortalContainerForEdit"
            className="pointer-events-auto"
          />
        </div>
        <div className="md:w-[45rem] w-full flex flex-col h-full md:h-[40rem] md:p-2 dark:md:bg-slate-500 relative md:bg-slate-300 md:rounded-[12px]">
          <div className="w-full h-16 bg-white dark:bg-slate-900 border-b border-gray-400/40 dark:border-gray-300/10 px-4  flex items-center justify-between md:hidden flex-shrink-0">
            <div>
              <button
                onClick={() => setCloseEditModalWithAnimation(true)}
                className="   text-center dark:text-gray-200 text-gray-500  cursor-pointer flex items-center justify-center "
                aria-label="Back"
                title="Back"
              >
                <IoIosArrowBack className="lg:-ml-[0.15rem]" />
                <p className="text-xs ">Back</p>
              </button>
            </div>
            <p className="text-sm dark:text-gray-200 text-gray-500">
              {" "}
              Edit Note
            </p>
          </div>

          <Slate
            editor={editor}
            initialValue={editContent?.note ?? []}
            onChange={(value) => {
              setEditContent((prev) => ({ ...prev!, note: value }));
            }}
          >
            {toolbarPosition === "top" && (
              <EditCardToolbar
                handleSaveEdit={handleSaveEdit}
                setCloseEditModalWithAnimation={setCloseEditModalWithAnimation}
                setShowHyperlinkModal={setShowHyperlinkModal}
                setToolbarPosition={setToolbarPosition}
                toolbarPosition={toolbarPosition}
              />
            )}
            <div
              className={`px-4 py-2 pb-32 w-full outline-none text-gray-800  bg-white font-light text-base text-left dark:md:bg-slate-800 dark:bg-slate-900 dark:text-white resize-none h-full overflow-y-auto  dark:dark-scrollbar light-scrollbar relative ${
                toolbarPosition === "bottom" && "md:rounded-t-md"
              }`}
              onClick={handleEditorContentClick}
              data-editor-parent-edit
            >
              <RichTextEditor
                setShowHyperlinkModal={setShowHyperlinkModal}
                mode="edit"
              />
            </div>

            {showScrollToBottomButton && (
              <button
                className=" absolute  bottom-6 right-4 border-2 dark:border-gray-500 border-gray-400 rounded-full p-1 text-gray-700 dark:text-gray-300 "
                onClick={scrollToBottom}
              >
                <HiOutlineArrowSmDown />
              </button>
            )}
            {showScrollToTopButton && (
              <button
                className=" absolute  bottom-6 right-4 border-2 dark:border-gray-500 border-gray-400 rounded-full p-1 text-gray-700 dark:text-gray-300 "
                onClick={scrollToTop}
              >
                <HiOutlineArrowSmUp />
              </button>
            )}

            {toolbarPosition === "bottom" && (
              <EditCardToolbar
                handleSaveEdit={handleSaveEdit}
                setCloseEditModalWithAnimation={setCloseEditModalWithAnimation}
                setShowHyperlinkModal={setShowHyperlinkModal}
                setToolbarPosition={setToolbarPosition}
                toolbarPosition={toolbarPosition}
              />
            )}

            {showHyperlinkModal && (
              <LinkModal setShowHyperlinkModal={setShowHyperlinkModal} />
            )}
          </Slate>
        </div>
      </div>
    );
  }
);

export default memo(EditCard);

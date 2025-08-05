import {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  memo,
  useContext,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { BsChevronExpand } from "react-icons/bs";
import { AudioContext } from "../../context/AudioContext";
import { twMerge } from "tailwind-merge";
import { ReactEditor, Slate, withReact } from "slate-react";
import {
  createEditor,
  Editor,
  Node,
  Transforms,
  Descendant,
  Element,
} from "slate";
import RichTextEditor from "../editor/RichTextEditor";
import { withInlineElements } from "../../utils/editor/plugins/withInlineElements";
import { withTitle } from "../../utils/editor/plugins/withTitle";
import { withTitleBackspaceProtection } from "../../utils/editor/plugins/withTitleBackspaceProtection";
import { withResetToParagraphOnEnter } from "../../utils/editor/plugins/withResetToParagraphOnEnter";
import { withResetToParagraphOnBackspaceWhenEmpty } from "../../utils/editor/plugins/withResetToParagraphOnBackspaceWhenEmpty";
import type { CustomElementType } from "../../types/textEditorTypes";
import LinkModal from "../editor/LinkModal";
import { withVoidElements } from "../../utils/editor/plugins/withVoidElements";
import { withClearEmptyMarks } from "../../utils/editor/plugins/withClearEmptyMarks";
import { withHistory } from "slate-history";
import { withUnwrapEmptyInlines } from "../../utils/editor/plugins/withUnwrapEmptyInlines";
import { useIsSmallScreen } from "../../hooks/utility/useIsSmallScreen";
import { withExitInlineOnSpace } from "../../utils/editor/plugins/withExitInlineOnSpace";
import useResetEditor from "../../hooks/editor/useResetEditor";

export const initialValue: Descendant[] = [
  {
    type: "title",
    children: [{ text: "" }],
  },
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

type PropType = {
  expandEditor: boolean;
  handleCreateCard: (
    resetEditor: () => void,
    restoreUnsavedContent: (newNote: Descendant[]) => void
  ) => void;
  setExpandEditor: Dispatch<SetStateAction<boolean>>;
  setNote: Dispatch<SetStateAction<Descendant[]>>;
  expandEditorToMaxHeight: () => void;
  children: ReactNode;
  height: number;
  setHeight: Dispatch<SetStateAction<number>>;
  richTextWrapperRef: RefObject<HTMLDivElement>;
  setShowHyperlinkModal: Dispatch<SetStateAction<boolean>>;
  showHyperlinkModal: boolean;
  handleTransitionEnd: () => void;
};

const CardInput = ({
  expandEditor,
  handleCreateCard,
  setExpandEditor,
  setNote,
  expandEditorToMaxHeight,
  children,
  height,
  setHeight,
  richTextWrapperRef,
  showHyperlinkModal,
  setShowHyperlinkModal,
  handleTransitionEnd,
}: PropType) => {
  const isSmallScreen = useIsSmallScreen();
  const editorRef = useRef<HTMLDivElement>(null);
  const { isPlayingAudioAllowed, handlePlayAudio } = useContext(AudioContext);
  const hasEditorOpened = useRef(false);
  const isHeightTransitioning = useRef(true);

  // Memoize editor creation to prevent recreation on every render
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
  const { resetEditor } = useResetEditor(editor);

  useEffect(() => {
    if (!expandEditor) {
      resetEditor();
    }
  }, [expandEditor, resetEditor]);

  const { maxHeight, maxHeightSmallScreen } = useMemo(() => {
    const baseHeight = window.innerHeight - 64 - 16 - 16 - 40;
    return {
      maxHeight: baseHeight,
      maxHeightSmallScreen: baseHeight - 56,
    };
  }, []);

  const maxExpandableHeight = isSmallScreen ? maxHeightSmallScreen : maxHeight;
  const isMaxHeightReached = height === maxExpandableHeight;

  const adjustEditorHeight = useCallback(() => {
    if (
      !editorRef.current ||
      !expandEditor ||
      (!richTextWrapperRef?.current && !isHeightTransitioning.current)
    ) {
      return;
    }

    const { scrollHeight, clientHeight } = editorRef.current;

    if (
      scrollHeight > clientHeight &&
      maxExpandableHeight > scrollHeight &&
      !isHeightTransitioning.current
    ) {
      isHeightTransitioning.current = true;
      setHeight((previousHeight) => {
        const remainingSpace = maxExpandableHeight - previousHeight;
        if (remainingSpace <= 0) return previousHeight;

        const increment = remainingSpace >= 120 ? 120 : remainingSpace;
        const newHeight = previousHeight + increment;

        return Math.min(newHeight, maxExpandableHeight);
      });
    }
    if (scrollHeight > maxExpandableHeight && height !== maxExpandableHeight) {
      setHeight(maxExpandableHeight);
    }
  }, [
    expandEditor,
    isSmallScreen,
    maxHeight,
    maxHeightSmallScreen,
    richTextWrapperRef,
    setHeight,
    height,
  ]);

  // const saveToLocalStorage = useCallback((value: Descendant[]) => {
  //   try {
  //     const content = JSON.stringify(value);
  //     localStorage.setItem("content", content);
  //   } catch (error) {
  //     console.warn("Failed to save to localStorage:", error);
  //   }
  // }, []);

  const handleChange = useCallback(
    (value: Descendant[]) => {
      // if (
      //   editor.selection &&
      //   ReactEditor.isFocused(editor) &&
      //   !Range.isCollapsed(editor.selection)
      // ) {
      //   setShowHoveringToolbar(true);
      // }

      // // Check if there are content changes (not just selection changes)
      // const isAstChange = editor.operations.some(
      //   (op) => "set_selection" !== op.type
      // );

      // if (isAstChange) {
      //   saveToLocalStorage(value);
      // }

      // Ensure at least one valid node exists
      setNote(value);

      // Handle editor height adjustment
      if (value.length > 2 && !isMaxHeightReached) {
        adjustEditorHeight();
      }
    },
    [editor, setNote, adjustEditorHeight, isMaxHeightReached]
  );

  const restoreUnsavedContent = (newContent: Descendant[]) => {
    // Set the children directly
    editor.children = newContent;

    // Reset selection to avoid invalid selection errors
    editor.selection = null;

    // Trigger onChange to update React state and re-render
    editor.onChange();
  };
  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateCard(resetEditor, restoreUnsavedContent);
    },
    [handleCreateCard, resetEditor]
  );

  const handleEditorClick = useCallback(() => {
    setExpandEditor(true);
    hasEditorOpened.current = true;

    if (isPlayingAudioAllowed && !expandEditor) {
      setTimeout(() => {
        handlePlayAudio("open", "/cards");
      }, 100);
    }
  }, [setExpandEditor, isPlayingAudioAllowed, expandEditor, handlePlayAudio]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === "Enter" || e.key === " ") && !expandEditor) {
        e.preventDefault();
        handleEditorClick();
      }
    },
    [expandEditor, handleEditorClick]
  );
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
          //Insert a paragraph anyway to keep the UX smooth
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
      }
    },
    [editor]
  );

  const shouldShowScrollbar = useMemo(() => {
    return (
      (isSmallScreen && height === maxHeightSmallScreen) ||
      (!isSmallScreen && height === maxHeight)
    );
  }, [isSmallScreen, height, maxHeightSmallScreen, maxHeight]);

  return (
    <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
      <div className="mt-4 w-full px-4 mx-auto min-h-[12rem] relative">
        <div className="absolute z-50 top-0 left-0">
          <div id="dropdownPortalContainer" className="pointer-events-auto" />
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-4 justify-center items-center relative"
        >
          <div
            className={twMerge(
              "flex flex-col relative transition-[transform] duration-1000 will-change-[transform]",
              expandEditor
                ? "-translate-y-0"
                : "-translate-y-14 md:-translate-y-0 delay-1000"
            )}
          >
            <div
              className={twMerge(
                "transition-[transform,opacity] duration-1000 flex md:h-10 h-20 items-center justify-end border-r border-l dark:border-[#5fb1d6] border-sky-500 rounded-t-md  md:w-[75vw] md:max-w-[44rem] w-[95vw] bg-white dark:bg-slate-900 relative will-change-[transform,opacity]",
                expandEditor
                  ? "border-t md:delay-1000 delay-1000"
                  : "p-0 translate-y-full border-t pointer-events-none md:delay-1000 delay-[0s]"
              )}
            >
              {children}
            </div>

            <div
              onTransitionEnd={(e) => {
                if (e.propertyName === "height") {
                  isHeightTransitioning.current = false;
                }

                if (e.propertyName === "height" && !expandEditor) {
                  handleTransitionEnd();
                }
              }}
              onClick={handleEditorClick}
              onKeyDown={handleKeyDown}
              ref={richTextWrapperRef}
              tabIndex={-1}
              className={twMerge(
                "md:w-[75vw] md:max-w-[44rem] bg-white w-full border dark:border-[#5fb1d6] border-sky-500 rounded-md outline-none text-gray-800 text-base dark:bg-slate-900 dark:text-gray-50 resize-none transition-[height,padding,border,border-radius] duration-1000 border-b font-light will-change-[height,padding] text-left relative before:content-['Craft_An_Elegant_Note'] before:top-1/2 before:-translate-y-1/2 before:left-1/2 before:-translate-x-1/2 before:opacity-100 before:absolute before:transition-all before:duration-500",
                expandEditor
                  ? "before:opacity-0 before:delay-0 delay-[0s]"
                  : "before:delay-[1.6s] h-[85px] md:h-[45px] delay-1000 md:delay-[0s]",
                hasEditorOpened.current &&
                  (expandEditor
                    ? "animate-rounded-top-out"
                    : "md:animate-rounded-top-in animate-rounded-top-in-mobile")
              )}
              style={{
                height: expandEditor ? `${height}px` : undefined,
              }}
              onPaste={expandEditorToMaxHeight}
            >
              <div
                onClick={handleEditorContentClick}
                className={twMerge(
                  "transition-all duration-500 relative h-full w-full px-4 rounded-md",
                  expandEditor ? "opacity-100" : "opacity-0",
                  shouldShowScrollbar
                    ? "animate-scrollbar-delayed dark:dark-scrollbar light-scrollbar scrollbar-gutter"
                    : "overflow-y-hidden"
                )}
                data-editor-parent-create
                ref={editorRef}
              >
                <RichTextEditor
                  setShowHyperlinkModal={setShowHyperlinkModal}
                  expandEditorToMaxHeight={expandEditorToMaxHeight}
                  mode="create"
                />
                {/* <div className="absolute z-50 top-0 left-0">
                  <div
                    id="hoveringToolbarPortalContainer"
                    className="pointer-events-auto"
                  />
                </div> */}
              </div>

              <div
                className={twMerge(
                  "absolute top-1/2 -translate-y-1/2 right-8 cursor-pointer z-20 opacity-100 transition-all duration-500",
                  expandEditor ? "opacity-0 delay-0" : "delay-[1.6s]"
                )}
              >
                <BsChevronExpand className="dark:text-gray-100 text-gray-500" />
              </div>
            </div>

            {showHyperlinkModal && (
              <LinkModal setShowHyperlinkModal={setShowHyperlinkModal} />
            )}
          </div>
        </form>
      </div>
    </Slate>
  );
};

export default memo(CardInput);

import {
  Dispatch,
  ReactNode,
  RefObject,
  SetStateAction,
  memo,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { BsChevronExpand } from "react-icons/bs";
import { useAudio } from "../../context/AudioContext";
import { twMerge } from "tailwind-merge";
import { ReactEditor, Slate } from "slate-react";
import {
  Editor,
  Node,
  Transforms,
  Descendant,
  Element,
  BaseSelection,
} from "slate";
import RichTextEditor from "../editor/RichTextEditor";
import type { CustomElementType } from "../../types/textEditorTypes";
import LinkModal from "../editor/LinkModal";
import useResetEditor from "../../hooks/editor/useResetEditor";
import { useIsDeviceType } from "../../hooks/utility/useIsDeviceType";
import SelectionToolbar from "../editor/selection-toolbar/SelectionToolbar";
import { createCardEditor } from "../../utils/editor/createEditor";
import { getTextAfterSlash } from "../../utils/editor/commandUtils";
import { useGlobalEditorShortcuts } from "../../hooks/editor/useGlobalEditorShortcuts";
import { ExtendedToolbar } from "./toolbar/ExtendedToolbar";
import { Operation } from "slate";
import { useClickOutside } from "../../hooks/utility/useClickOutside";
import { useFocusTrap } from "../../hooks/utility/useFocusTrap";
import { motion } from "motion/react";
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
  setExpandEditor: Dispatch<SetStateAction<boolean>>;
  expandEditorToMaxHeight: () => void;
  children: ReactNode;
  height: number;
  setHeight: Dispatch<SetStateAction<number>>;
  richTextWrapperRef: RefObject<HTMLDivElement>;
  setShowHyperlinkModal: Dispatch<SetStateAction<boolean>>;
  showHyperlinkModal: boolean;
  handleTransitionEnd: () => void;
  isMoreMenuOpen: boolean;
  handleOpenMoreFormatingMenu: () => void;
};

export type CommandPaletteHandle = {
  showCommandPalette: boolean;
  setCommandSearch: (newSearch: string) => void;
  closeCommandPalette: () => void;
  resetSlashPosition: () => void;
  openCommandPalette: () => void;
  lastSlashLocation: React.MutableRefObject<BaseSelection | null>;
};

const CardInput = ({
  expandEditor,
  setExpandEditor,
  expandEditorToMaxHeight,
  children,
  height,
  setHeight,
  richTextWrapperRef,
  showHyperlinkModal,
  setShowHyperlinkModal,
  handleTransitionEnd,
  isMoreMenuOpen,
  handleOpenMoreFormatingMenu,
}: PropType) => {
  const isSmallScreen = useIsDeviceType("phone");
  const editorRef = useRef<HTMLDivElement>(null);
  const { handlePlayAudio } = useAudio();
  const hasEditorOpened = useRef(false);
  const extendedToolbarRef = useRef<HTMLDivElement>(null);
  const isHeightTransitioning = useRef(false);
  const isInitialExpand = useRef(true);

  const comandPaletteConfig = useRef<CommandPaletteHandle | null>(null);
  // Memoize editor creation to prevent recreation on every render
  const editor = useMemo(() => createCardEditor(), []);
  const { resetEditor } = useResetEditor(editor);

  useClickOutside(
    extendedToolbarRef,
    isMoreMenuOpen,
    handleOpenMoreFormatingMenu,
    { excludeSelectors: ["[data-click-outside-ignore-more-options]"] }
  );

  useFocusTrap(extendedToolbarRef, "both", { enabled: isMoreMenuOpen });

  useGlobalEditorShortcuts(editor, {
    onEditorFocus: () => {
      if (!expandEditor) {
        handleEditorClick();
      }
    },
  });

  useEffect(() => {
    if (!expandEditor) return;

    isInitialExpand.current = true;
    isHeightTransitioning.current = true;
  }, [expandEditor]);

  useEffect(() => {
    if (!expandEditor) {
      resetEditor();
    }
  }, [expandEditor, resetEditor]);

  useEffect(() => {
    if (showHyperlinkModal) {
      expandEditorToMaxHeight();
    }
  }, [showHyperlinkModal, expandEditorToMaxHeight]);

  const { maxHeight, maxHeightSmallScreen } = useMemo(() => {
    const baseHeight = window.innerHeight - 64 - 16 - 16 - 40;
    return {
      maxHeight: baseHeight,
      maxHeightSmallScreen: baseHeight - 56,
    };
  }, []);

  const maxExpandableHeight = isSmallScreen ? maxHeightSmallScreen : maxHeight;
  const isMaxHeightReached = height === maxExpandableHeight;

  useEffect(() => {
    if (!expandEditor || !editorRef.current) return;

    const el = editorRef.current;

    const measure = () => {
      //  Block during initial expand OR any height animation
      if (isInitialExpand.current || isHeightTransitioning.current) return;

      const needsMoreSpace = el.scrollHeight > el.clientHeight + 8;
      if (!needsMoreSpace) return;

      setHeight((prev) => {
        if (prev >= maxExpandableHeight) return prev;

        isHeightTransitioning.current = true;
        return prev + Math.min(120, maxExpandableHeight - prev);
      });
    };

    const observer = new MutationObserver(() => {
      // wait until DOM + layout settles
      requestAnimationFrame(measure);
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [expandEditor, maxExpandableHeight, setHeight]);

  // Just in case if onTransition end doesnt run
  useEffect(() => {
    if (!isHeightTransitioning.current) return;

    const id = setTimeout(() => {
      isHeightTransitioning.current = false;
      isInitialExpand.current = false;
    }, 1100);

    return () => clearTimeout(id);
  }, [height]);

  // const saveToLocalStorage = useCallback((value: Descendant[]) => {
  //   try {
  //     const content = JSON.stringify(value);
  //     localStorage.setItem("content", content);
  //   } catch (error) {
  //     console.warn("Failed to save to localStorage:", error);
  //   }
  // }, []);

  const handleChange = useCallback(() => {
    const { selection, operations } = editor;
    const textOp = operations
      .filter((op) => Operation.isTextOperation(op))
      .at(-1);
    const isLastOperationInsertion = textOp?.type === "insert_text";

    const isLastOperationSlash =
      isLastOperationInsertion && textOp?.text === "/";

    if (
      isLastOperationSlash &&
      comandPaletteConfig.current &&
      comandPaletteConfig.current.lastSlashLocation
    ) {
      comandPaletteConfig.current.lastSlashLocation.current = selection;
      comandPaletteConfig.current.openCommandPalette();
    }
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

    // saveToLocalStorage(value);
    // Handle editor height adjustment
  }, [editor, isMaxHeightReached]);

  const handleEditorClick = useCallback(() => {
    setExpandEditor(true);
    hasEditorOpened.current = true;

    if (!expandEditor) {
      setTimeout(() => {
        handlePlayAudio("open", "/cards");
      }, 100);
    }
  }, [setExpandEditor, expandEditor, handlePlayAudio]);

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
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={handleChange}
      key="cardInput"
    >
      <div className="mt-4 w-full px-4 mx-auto relative">
        <div className="absolute z-50 top-0 left-0">
          <div id="dropdownPortalContainer" className="pointer-events-auto" />
        </div>

        <div className="flex flex-col gap-4 justify-center items-center relative">
          <motion.div
            layout="position"
            transition={{
              layout: {
                type: "spring",
              },
            }}
          >
            <div
              className={twMerge(
                "flex flex-col relative transition-[transform] duration-1000 will-change-[transform]",
                expandEditor
                  ? "-translate-y-0"
                  : "-translate-y-14 xl:-translate-y-0 delay-1000"
              )}
            >
              <div
                className={twMerge(
                  "transition-[transform,opacity] duration-1000 flex xl:h-10 h-20 items-center justify-end border-r border-l dark:border-slate-500 border-gray-400 rounded-t-md  md:w-[75vw] md:max-w-[44rem] xl:w-[85vw] xl:max-w-[50rem] w-[95vw] sm-mid:w-[85vw] bg-white dark:bg-slate-900 relative will-change-[transform,opacity]",
                  expandEditor
                    ? "border-t delay-1000"
                    : "p-0 translate-y-full border-t pointer-events-none xl:delay-1000 delay-[0s]"
                )}
              >
                {children}
              </div>

              <div
                onTransitionEnd={(e) => {
                  if (e.propertyName !== "height") return;

                  isHeightTransitioning.current = false;

                  // Initial expand just finished
                  if (isInitialExpand.current) {
                    isInitialExpand.current = false;
                  }

                  if (!expandEditor) {
                    handleTransitionEnd();
                  }
                }}
                onClick={handleEditorClick}
                onKeyDown={handleKeyDown}
                ref={richTextWrapperRef}
                tabIndex={!expandEditor ? 0 : -1}
                className={twMerge(
                  "md:w-[75vw] md:max-w-[44rem] xl:w-[85vw] xl:max-w-[50rem] bg-white w-full max-w-[95vw] sm-mid:w-[85vw] border dark:border-slate-500 border-gray-400 rounded-md outline-none text-gray-800 text-base dark:bg-slate-900 dark:text-gray-50 resize-none transition-[height,padding,border,border-radius] duration-1000 border-b font-light will-change-[height,padding] text-left relative before:content-['Craft_An_Elegant_Note'] before:top-1/2 before:-translate-y-1/2 before:left-1/2 before:-translate-x-1/2 before:opacity-100 before:absolute before:transition-all before:duration-500 focus-visible:ring-2 dark:ring-blue-500 ring-gray-600 overflow-x-hidden",
                  expandEditor
                    ? "before:opacity-0 before:delay-0 delay-[0s]"
                    : "before:delay-[1.6s] h-[85px] xl:h-[45px] delay-1000 xl:delay-[0s]",
                  hasEditorOpened.current &&
                    (expandEditor
                      ? "animate-rounded-top-out"
                      : "lg:animate-rounded-top-in animate-rounded-top-in-mobile")
                )}
                style={{
                  height: expandEditor ? `${height}px` : undefined,
                }}
                onPaste={expandEditorToMaxHeight}
              >
                <div
                  ref={extendedToolbarRef}
                  className={twMerge(
                    "dark:border-slate-500 flex items-center justify-center border-gray-400 dark:bg-slate-900 bg-white p-2 rounded-bl-md border h-10 w-20 -top-0.5 right-0 absolute  transition-transform duration-200 ease-out transform-gpu z-10",
                    isMoreMenuOpen ? "-translate-y-0" : "-translate-y-full"
                  )}
                >
                  <ExtendedToolbar mode="create" toolbarPosition="top" />
                </div>
                <div
                  onClick={handleEditorContentClick}
                  className={twMerge(
                    "transition-all duration-500 relative h-full px-4 rounded-md",
                    expandEditor
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none",
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
                    parentIndex={expandEditor ? -1 : 0}
                    comandPaletteConfig={comandPaletteConfig}
                  />

                  <SelectionToolbar
                    mode="create"
                    setShowHyperlinkModal={setShowHyperlinkModal}
                  />
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
          </motion.div>
        </div>
      </div>
    </Slate>
  );
};

export default memo(CardInput);

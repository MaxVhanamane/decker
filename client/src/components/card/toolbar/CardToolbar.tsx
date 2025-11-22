import {
  Dispatch,
  SetStateAction,
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AudioContext } from "../../../context/AudioContext";
import { useSlate } from "slate-react";
import type {
  ColorBarColors,
  ListType,
  HighlightConfig,
} from "../../../types/textEditorTypes";
import { useEditorActions } from "../../../hooks/editor/useEditorActions";
import { ShowToastContext } from "../../../context/ToastNotificationContext";
import { DividerDropdown } from "../../editor/dropdowns/DividerDropdown";
import { createPortal } from "react-dom";
import { ListStyleDropdown } from "../../editor/dropdowns/ListStyleDropdown";
import { ColorBarDropdown } from "../../editor/dropdowns/ColorBarDropdown";
import HighlightDropdown from "../../editor/dropdowns/HighlightDropdown";
import { NodeQueries } from "../../../utils/editor/nodeQueries";
import { MobileView } from "./MobileView";
import { DesktopView } from "./DesktopView";
import {
  getActionButtons,
  getBlockButtons,
  getEditActionButtons,
  getHistoryButtons,
  getMarkButtons,
  getStructureButtons,
} from "../../../utils/editor/editorButtonConfigs";
import { useIsDeviceType } from "../../../hooks/utility/useIsDeviceType";
import { Descendant } from "slate";
import useResetEditor from "../../../hooks/editor/useResetEditor";

// Common props shared between both modes
interface CommonProps {
  setShowHyperlinkModal: Dispatch<SetStateAction<boolean>>;
  tabbable: boolean;
}

// Create mode specific props
interface CreateModeProps extends CommonProps {
  mode: "create";
  setShowTips: Dispatch<SetStateAction<boolean>>;
  expandEditorToMaxHeight: () => void;
  handleCloseTextEditor: (note: Descendant[]) => void;
  isCreatingCard: boolean;
  isFetchingCards: boolean;
  handleCreateCard: (
    resetEditor: () => void,
    restoreUnsavedContent: (newNote: Descendant[]) => void,
    note: Descendant[]
  ) => void;
}

// Edit mode specific props
interface EditModeProps extends CommonProps {
  mode: "edit";
  setCloseEditModalWithAnimation: Dispatch<SetStateAction<boolean>>;
  handleSaveEdit: () => void;
  toolbarPosition: "top" | "bottom";
  toggleToolbarPosition: () => void;
}

type CardToolbarProps = CreateModeProps | EditModeProps;

const CardToolbar = (props: CardToolbarProps) => {
  const { setShowHyperlinkModal, mode, tabbable } = props;

  const { isPlayingAudioAllowed, handlePlayAudio } = useContext(AudioContext);
  const editor = useSlate();
  const { showToast } = useContext(ShowToastContext);

  const {
    handleBold,
    handleUnderline,
    handleCode,
    handleH1,
    handleH2,
    handleLink,
    handleText,
    handleHighlight,
    handleQuote,
    handleItalic,
    handleDivider,
    handleColorBar,
    handleList,
    handleIndentBlock,
    handleOutdentBlock,
    handleInlineCode,
    handleUndo,
    handleRedo,
  } = useEditorActions();
  const { resetEditor } = useResetEditor(editor);

  const isSmallScreen = useIsDeviceType("tablet");

  // Dropdown state
  const [showDividerOptions, setShowDividerOptions] = useState(false);
  const [showColorBarOptions, setShowColorBarOptions] = useState(false);
  const [showListStyleOptions, setShowListStyleOptions] = useState(false);
  const [showHighlightOptions, setShowHighlightOptions] = useState(false);

  // Refs for dropdown positioning
  const dividerButtonRef = useRef<HTMLButtonElement>(null);
  const colorBarButtonRef = useRef<HTMLButtonElement>(null);
  const listStyleButtonRef = useRef<HTMLButtonElement>(null);
  const highlightButtonRef = useRef<HTMLButtonElement>(null);

  // Extract specific props for cleaner dependency arrays
  // const setShowTips = mode === "create" ? props.setShowTips : undefined;
  const expandEditorToMaxHeight =
    mode === "create" ? props.expandEditorToMaxHeight : undefined;
  const handleCreateCard =
    mode === "create" ? props.handleCreateCard : undefined;
  const handleCloseTextEditor =
    mode === "create" ? props.handleCloseTextEditor : undefined;
  const isCreatingCard = mode === "create" ? props.isCreatingCard : undefined;
  const isFetchingCards = mode === "create" ? props.isFetchingCards : undefined;
  const setCloseEditModalWithAnimation =
    mode === "edit" ? props.setCloseEditModalWithAnimation : undefined;
  const handleSaveEdit = mode === "edit" ? props.handleSaveEdit : undefined;
  const toolbarPosition = mode === "edit" ? props.toolbarPosition : undefined;
  const toggleToolbarPosition =
    mode === "edit" ? props.toggleToolbarPosition : undefined;

  // // Tips handler - only for create mode
  // const tipsHandlerMemo = useCallback(() => {
  //   if (mode === "create" && setShowTips) {
  //     setShowTips(true);
  //   }
  // }, [mode, setShowTips]);

  const restoreUnsavedContent = useCallback(
    (newContent: Descendant[]) => {
      // Set the children directly
      editor.children = newContent;

      // Reset selection to avoid invalid selection errors
      editor.selection = null;

      // Trigger onChange to update React state and re-render
      editor.onChange();
    },
    [editor]
  );

  const handleCreateCardHandler = useCallback(() => {
    if (handleCreateCard) {
      handleCreateCard(resetEditor, restoreUnsavedContent, editor.children);
    }
  }, [handleCreateCard, resetEditor, restoreUnsavedContent]);

  // Mark buttons configuration
  const markButtons = useMemo(
    () =>
      getMarkButtons({
        handleUnderline,
        handleBold,
        handleItalic,
        setShowHighlightOptions,
        tabbable,
        highlightButtonRef,
        handleInlineCode,
      }),
    [
      handleUnderline,
      handleBold,
      handleItalic,
      setShowHighlightOptions,
      tabbable,
      highlightButtonRef,
      handleInlineCode,
    ]
  );
  const structureButtons = useMemo(
    () =>
      getStructureButtons({
        handleIndentBlock,
        handleOutdentBlock,
        tabbable,
      }),
    [handleIndentBlock, handleOutdentBlock, tabbable]
  );
  const historyButtons = useMemo(
    () =>
      getHistoryButtons({
        handleUndo,
        handleRedo,
        tabbable,
      }),
    [handleUndo, handleRedo, tabbable]
  );

  // Block buttons configuration
  const blockButtons = useMemo(
    () =>
      getBlockButtons({
        editor,
        handleLink,
        handleCode,
        handleH1,
        handleH2,
        handleText,
        handleQuote,
        setShowDividerOptions,
        setShowColorBarOptions,
        setShowListStyleOptions,
        setShowHyperlinkModal,
        showToast,
        tabbable,
        showColorBarOptions,
        showListStyleOptions,
        showDividerOptions,
        colorBarButtonRef,
        dividerButtonRef,
        listStyleButtonRef,
      }),
    [
      editor,
      handleLink,
      handleCode,
      handleH1,
      handleH2,
      handleText,
      handleQuote,
      setShowHyperlinkModal,
      showToast,
      tabbable,
      showColorBarOptions,
      showListStyleOptions,
      showDividerOptions,
      colorBarButtonRef,
      dividerButtonRef,
      listStyleButtonRef,
    ]
  );

  const handleCloseTextEditorHandler = () => {
    if (handleCloseTextEditor) {
      handleCloseTextEditor(editor.children);
    }
  };
  // Action buttons configuration
  const actionButtons = useMemo(() => {
    if (mode === "create") {
      return getActionButtons({
        handleCreateCardHandler: handleCreateCardHandler!,
        expandEditorToMaxHeight: expandEditorToMaxHeight!,
        handleCloseTextEditor: handleCloseTextEditorHandler!,
        handlePlayAudio,
        isPlayingAudioAllowed,
        isFetchingCards: isFetchingCards!,
        isCreatingCard: isCreatingCard!,
        tabbable,
      });
    }

    if (mode === "edit") {
      return getEditActionButtons({
        handleSaveEdit: handleSaveEdit!,
        setCloseEditModalWithAnimation: setCloseEditModalWithAnimation!,
        tabbable,
        toggleToolbarPosition: toggleToolbarPosition!,
      });
    }

    return [];
  }, [
    mode,
    expandEditorToMaxHeight,
    handleCloseTextEditor,
    handlePlayAudio,
    isPlayingAudioAllowed,
    isFetchingCards,
    isCreatingCard,
    handleSaveEdit,
    setCloseEditModalWithAnimation,
    tabbable,
  ]);

  // Dropdown handlers
  const handleInsertDivider = useCallback(
    (style: "plain" | "dashed" | "3-dots") => {
      handleDivider(style);
      setShowDividerOptions(false);
    },
    [handleDivider]
  );

  const handleInsertColorBar = useCallback(
    (color: ColorBarColors) => {
      handleColorBar(color);
      setShowColorBarOptions(false);
    },
    [handleColorBar]
  );

  const handleInsertList = useCallback(
    (listType: ListType) => {
      handleList(listType);
      setShowListStyleOptions(false);
    },
    [handleList]
  );

  const handleHighlightText = useCallback(
    (highlightConf: HighlightConfig) => {
      handleHighlight(highlightConf);
      setShowHighlightOptions(false);
    },
    [handleHighlight]
  );

  // Utility functions for dropdown state
  const isBlockDropdownOpen = useCallback(
    (format: string): boolean =>
      (format === "color-bar" && showColorBarOptions) ||
      (format === "divider" && showDividerOptions) ||
      (format === "list-item" && showListStyleOptions),
    [showColorBarOptions, showDividerOptions, showListStyleOptions]
  );

  const isFormatDropdownOpen = useCallback(
    (format: string): boolean =>
      format === "highlightConfig" && showHighlightOptions,
    [showHighlightOptions]
  );

  const isAnyDropdownOpen = useCallback(
    (): boolean =>
      showColorBarOptions ||
      showDividerOptions ||
      showListStyleOptions ||
      showHighlightOptions,
    [
      showColorBarOptions,
      showDividerOptions,
      showListStyleOptions,
      showHighlightOptions,
    ]
  );

  // Get portal container based on mode
  const getPortalContainer = useCallback(() => {
    const containerId =
      mode === "create"
        ? "dropdownPortalContainer"
        : "dropdownPortalContainerForEdit";
    return document.getElementById(containerId)!;
  }, [mode]);
  return (
    <div
      data-toolbar-container
      className="flex flex-col md:flex-row items-center justify-center w-full h-full"
    >
      {isSmallScreen ? (
        <div className="w-full flex items-center justify-center flex-col h-full">
          <MobileView
            isFormatDropdownOpen={isFormatDropdownOpen}
            markButtons={markButtons}
            blockButtons={blockButtons}
            structureButtons={structureButtons}
            historyButtons={historyButtons}
            isBlockDropdownOpen={isBlockDropdownOpen}
            isAnyDropdownOpen={isAnyDropdownOpen}
            actionButtons={actionButtons}
            mode={mode}
            toolbarPosition={
              mode === "edit" && toolbarPosition ? toolbarPosition : "top"
            }
          />
        </div>
      ) : (
        <div className="w-full flex items-center justify-end flex-row h-full">
          <DesktopView
            isFormatDropdownOpen={isFormatDropdownOpen}
            markButtons={markButtons}
            blockButtons={blockButtons}
            structureButtons={structureButtons}
            historyButtons={historyButtons}
            isBlockDropdownOpen={isBlockDropdownOpen}
            isAnyDropdownOpen={isAnyDropdownOpen}
            actionButtons={actionButtons}
            mode={mode}
            toolbarPosition={
              mode === "edit" && toolbarPosition ? toolbarPosition : "top"
            }
          />
        </div>
      )}

      {/* Dropdown Portals */}
      {showDividerOptions &&
        createPortal(
          <DividerDropdown
            onSelect={handleInsertDivider}
            setShowDividerOptions={setShowDividerOptions}
            dividerButtonRef={dividerButtonRef}
            activeDivider={NodeQueries.getActiveDividerOnSelectedNode(editor)}
            mode={mode}
            toolbarPosition={
              mode === "edit" && toolbarPosition ? toolbarPosition : "top"
            }
          />,
          getPortalContainer()
        )}

      {showColorBarOptions &&
        createPortal(
          <ColorBarDropdown
            onSelect={handleInsertColorBar}
            setShowColorBarOptions={setShowColorBarOptions}
            colorBarButtonRef={colorBarButtonRef}
            activeColor={NodeQueries.getActiveColorOnSelectedNode(editor)}
            mode={mode}
            toolbarPosition={
              mode === "edit" && toolbarPosition ? toolbarPosition : "top"
            }
          />,
          getPortalContainer()
        )}

      {showListStyleOptions &&
        createPortal(
          <ListStyleDropdown
            onSelect={handleInsertList}
            setShowListStyleOptions={setShowListStyleOptions}
            listStyleButtonRef={listStyleButtonRef}
            activeStyle={NodeQueries.getListParentTypeIfInListItem(editor)}
            mode={mode}
            toolbarPosition={
              mode === "edit" && toolbarPosition ? toolbarPosition : "top"
            }
          />,
          getPortalContainer()
        )}

      {showHighlightOptions &&
        createPortal(
          <HighlightDropdown
            onSelect={handleHighlightText}
            setShowHighlightOptions={setShowHighlightOptions}
            highlightButtonRef={highlightButtonRef}
            activeHighlightConfig={NodeQueries.getActiveHighlightConfig(editor)}
            mode={mode}
            toolbarPosition={
              mode === "edit" && toolbarPosition ? toolbarPosition : "top"
            }
          />,
          getPortalContainer()
        )}
    </div>
  );
};

export default memo(CardToolbar);

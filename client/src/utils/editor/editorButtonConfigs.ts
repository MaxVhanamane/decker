import { BsCheckLg, BsTextIndentLeft, BsTextIndentRight, BsTypeUnderline } from "react-icons/bs";
import { AiOutlineBold, AiOutlineLink } from "react-icons/ai";
import { RxFontItalic, RxText } from "react-icons/rx";
import { LuHeading1, LuHeading2, LuHighlighter, LuRedo2, LuUndo2 } from "react-icons/lu";
import { BiCodeCurly } from "react-icons/bi";
import { RiArrowUpSLine, RiDoubleQuotesL, RiSeparator } from "react-icons/ri";
import { CgBorderLeft } from "react-icons/cg";
import { HiMiniListBullet } from "react-icons/hi2";
import { FaExpand } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { IoCodeSlash } from "react-icons/io5";
// import { TbBulbFilled } from "react-icons/tb";
import { CustomEditor } from "./customEditor";
import { Editor, Range } from "slate";
import { AudioNamesType } from "../../context/AudioContext";
import type { ToastHandlerType } from "../../types/types";
import { twMerge } from "tailwind-merge";
import { Dispatch, SetStateAction } from "react";
import type { ActionButtonsConfig, BlockButtonConfig, HistoryButtonsConfig, MarkButtonConfig, StructureButtonsConfig } from "../../types/textEditorTypes";

export const commonButtonClassNames =
    "dark:text-gray-200 dark:hover:text-gray-400 p-1 text-gray-700 hover:text-gray-500 text-xl rounded-sm ";

type GetBlockButtonsParams = {
    editor: Editor;
    handleLink: () => void;
    handleCode: () => void;
    handleH1: () => void;
    handleH2: () => void;
    handleText: () => void;
    handleQuote: () => void;
    setShowDividerOptions: React.Dispatch<React.SetStateAction<boolean>>;
    setShowColorBarOptions: React.Dispatch<React.SetStateAction<boolean>>;
    setShowListStyleOptions: React.Dispatch<React.SetStateAction<boolean>>;
    setShowHyperlinkModal: (val: boolean) => void;
    showToast: (newToast: ToastHandlerType) => void;
    tabbable: boolean;
    showColorBarOptions: boolean;
    showListStyleOptions: boolean;
    showDividerOptions: boolean;
    colorBarButtonRef: React.RefObject<HTMLButtonElement>;
    dividerButtonRef: React.RefObject<HTMLButtonElement>;
    listStyleButtonRef: React.RefObject<HTMLButtonElement>;

};

type GetMarkButtonsParams = {
    handleUnderline: () => void;
    handleBold: () => void;
    handleInlineCode: () => void;
    handleItalic: () => void;
    setShowHighlightOptions: (val: boolean) => void;
    tabbable: boolean;
    highlightButtonRef: React.RefObject<HTMLButtonElement>;

};


type GetActionButtonsParams = {
    // tipsHandlerMemo: () => void;
    expandEditorToMaxHeight: () => void;
    handleCloseTextEditor: () => void;
    handlePlayAudio: (audioName: AudioNamesType, path?: string) => void;
    isPlayingAudioAllowed: boolean;
    isFetchingCards: boolean;
    isCreatingCard: boolean;
    tabbable: boolean;
    handleCreateCardHandler: () => void;
};

type getEditActionButtonsParams = {
    handleSaveEdit: () => void,
    setCloseEditModalWithAnimation: Dispatch<SetStateAction<boolean>>,
    tabbable: boolean;
    toggleToolbarPosition: () => void
}
type getStructureButtonParams = { handleIndentBlock: () => void, handleOutdentBlock: () => void, tabbable: boolean }
type getHistoryButtonParams = { handleUndo: () => void, handleRedo: () => void, tabbable: boolean }


export const getMarkButtons = ({
    handleUnderline,
    handleBold,
    handleItalic,
    handleInlineCode,
    setShowHighlightOptions,
    tabbable,
    highlightButtonRef,
}: GetMarkButtonsParams): MarkButtonConfig[] => [
        {
            name: "addHighlight",
            onClickHandler: () => setShowHighlightOptions(true),
            toolTipText: "Highlight text",
            icon: LuHighlighter,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "highlightConfig",
            ref: highlightButtonRef,
            hasDropdown: true,
            withTooltip: true

        },
        {
            name: "addUnderlineText",
            onClickHandler: handleUnderline,
            toolTipText: "Underline text",
            subTooltipText: "ctrl + U",
            icon: BsTypeUnderline,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "underline",
            withTooltip: true
        },
        {
            name: "addBoldText",
            onClickHandler: handleBold,
            toolTipText: "Bold text",
            subTooltipText: "ctrl + B",
            icon: AiOutlineBold,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "bold",
            withTooltip: true

        },
        {
            name: "addItalicText",
            onClickHandler: handleItalic,
            toolTipText: "Italic text",
            subTooltipText: "ctrl + I",
            icon: RxFontItalic,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "italic",
            withTooltip: true

        },
        {
            name: "addInlineCode",
            onClickHandler: handleInlineCode,
            toolTipText: "Inline Code",
            subTooltipText: "ctrl + E",
            icon: IoCodeSlash,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "inlineCode",
            withTooltip: true

        },

    ];


export const getBlockButtons = ({
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
}: GetBlockButtonsParams): BlockButtonConfig[] => [
        {
            name: "addLinkToAddCard",
            onClickHandler: () => {
                if (CustomEditor.isBlockActive(editor, "link")) {
                    handleLink();
                } else {
                    const { selection } = editor;
                    if (selection && !Range.isCollapsed(selection)) {
                        setShowHyperlinkModal(true);
                    } else {
                        showToast({
                            message: "Please select some text to convert it into a link.",
                            severity: "warning",
                            autoHideDuration: 5000,
                            position: "top-center",
                            animationStyle: "scale-up",
                            theme: "auto",
                        });
                    }
                }
            },
            toolTipText: "Insert link",
            subTooltipText: "ctrl + K",
            icon: AiOutlineLink,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "link",
            withTooltip: true

        },
        {
            name: "addCodeBlock",
            onClickHandler: handleCode,
            toolTipText: "Insert code block",
            subTooltipText: "ctrl + `",
            icon: BiCodeCurly,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "code-block",
            withTooltip: true

        },
        {
            name: "addLargeSizeHeading",
            onClickHandler: handleH1,
            toolTipText: "Large size Heading",
            subTooltipText: "ctrl + 1",
            icon: LuHeading1,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "h1",
            withTooltip: true

        },
        {
            name: "addMediumSizeHeading",
            onClickHandler: handleH2,
            toolTipText: "Medium size Heading",
            subTooltipText: "ctrl + 2",
            icon: LuHeading2,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "h2",
            withTooltip: true

        },
        {
            name: "addQuote",
            onClickHandler: handleQuote,
            toolTipText: "Quote",
            subTooltipText: "ctrl + Q",
            icon: RiDoubleQuotesL,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "quote",
            withTooltip: true

        },
        {
            name: "addText",
            onClickHandler: handleText,
            toolTipText: "Text",
            icon: RxText,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "paragraph",
            withTooltip: true

        },
        {
            name: "colorBar",
            onClickHandler: () => setShowColorBarOptions((prev) => !prev),
            toolTipText: "Color bar",
            icon: CgBorderLeft,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "color-bar",
            ref: colorBarButtonRef,
            id: "colorbar-dropdown-button",
            ariaHaspopup: "menu",
            ariaExpanded: showColorBarOptions,
            hasDropdown: true,
            withTooltip: true,
            iconClassName: "xl:text-2xl"

        },
        {
            name: "divider",
            onClickHandler: () => setShowDividerOptions((prev) => !prev),
            toolTipText: "Divider",
            icon: RiSeparator,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "divider",
            ref: dividerButtonRef,
            id: "divider-dropdown-button",
            ariaHaspopup: "menu",
            ariaExpanded: showDividerOptions,
            hasDropdown: true,
            withTooltip: true

        },
        {
            name: "InsertBulletList",
            onClickHandler: () => setShowListStyleOptions((prev) => !prev),
            toolTipText: "Insert List",
            icon: HiMiniListBullet,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "list-item",
            ref: listStyleButtonRef,
            id: "list-dropdown-button",
            ariaHaspopup: "menu",
            ariaExpanded: showListStyleOptions,
            hasDropdown: true,
            withTooltip: true

        },
    ];

export const getEditActionButtons = ({
    handleSaveEdit,
    setCloseEditModalWithAnimation,
    tabbable,
    toggleToolbarPosition
}: getEditActionButtonsParams): ActionButtonsConfig[] => [
        {
            name: "Toggle toolbar Position",
            toolTipText: "Toggle toolbar Position",
            icon: RiArrowUpSLine,
            className: "text-2xl dark:text-gray-50 dark:hover:text-gray-200 text-gray-700 hover:text-gray-800",
            tabIndex: tabbable ? 0 : -1,
            withTooltip: true,
            onClickHandler: toggleToolbarPosition,
        },
        {
            name: "Close",
            toolTipText: "Close",
            icon: MdOutlineClose,
            className: " text-red-500 hover:text-red-600  text-[1.2rem] rounded-sm ",
            tabIndex: tabbable ? 0 : -1,
            withTooltip: true,
            onClickHandler: () => {
                setCloseEditModalWithAnimation(true)
            },
        },
        {
            name: "Save Card",
            toolTipText: "Save",
            icon: BsCheckLg,
            className: "text-cyan-500 hover:text-cyan-600 text-[1.2rem] rounded-sm",
            tabIndex: tabbable ? 0 : -1,
            withTooltip: true,
            onClickHandler: () => {
                handleSaveEdit()
            }

        },]


export const getStructureButtons = ({ handleIndentBlock, handleOutdentBlock, tabbable }: getStructureButtonParams): StructureButtonsConfig[] => {

    return [{
        name: "Indent",
        onClickHandler: handleIndentBlock,
        toolTipText: "Increase indent",
        icon: BsTextIndentLeft,
        className: commonButtonClassNames,
        tabIndex: tabbable ? 0 : -1,
        withTooltip: true,
    },
    {
        name: "Unindent",
        onClickHandler: handleOutdentBlock,
        toolTipText: "Decrease indent",
        icon: BsTextIndentRight,
        className: commonButtonClassNames,
        tabIndex: tabbable ? 0 : -1,
        withTooltip: true,
    },]
}

export const getActionButtons = ({
    handleCreateCardHandler,
    expandEditorToMaxHeight,
    handleCloseTextEditor,
    handlePlayAudio,
    isPlayingAudioAllowed,
    isFetchingCards,
    isCreatingCard,
    tabbable,
}: GetActionButtonsParams): ActionButtonsConfig[] => [
        // {
        //     name: "tips",
        //     onClickHandler: tipsHandlerMemo,
        //     toolTipText: "View tips",
        //     icon: TbBulbFilled,
        //     className: " text-yellow-400 hover:text-yellow-500  text-xl rounded-sm",
        //     tabIndex: tabbable ? 0 : -1,
        //     withTooltip: true

        // },
        {
            name: "Expand Textarea Fully",
            onClickHandler: expandEditorToMaxHeight,
            toolTipText: "Maximize textarea",
            icon: FaExpand,
            className: twMerge(commonButtonClassNames, "text-base"),
            tabIndex: tabbable ? 0 : -1,
            withTooltip: true

        },
        {
            name: "Close",
            onClickHandler: () => {
                handleCloseTextEditor();
                if (isPlayingAudioAllowed) {
                    setTimeout(() => handlePlayAudio("close"), 100);
                }
            },
            toolTipText: "Close",
            icon: MdOutlineClose,
            className: " text-red-500 hover:text-red-600  text-[1.2rem] rounded-sm ",
            tabIndex: tabbable ? 0 : -1,
            withTooltip: true

        },
        {
            name: "Create Card",
            toolTipText: "Save",
            icon: BsCheckLg,
            className: ` text-cyan-500 hover:text-cyan-600 text-[1.2rem] rounded-sm ${isFetchingCards || isCreatingCard ? "text-gray-300 dark:text-gray-500" : ""
                }`,
            tabIndex: tabbable ? 0 : -1,
            withTooltip: true,
            onClickHandler: handleCreateCardHandler

        },
    ];


export const getHistoryButtons = ({ handleRedo, handleUndo, tabbable }: getHistoryButtonParams): HistoryButtonsConfig[] => {
    return [
        {
            name: "Undo",
            onClickHandler: handleUndo,
            toolTipText: "Undo",
            icon: LuUndo2,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            withTooltip: true,
        },
        {
            name: "Redo",
            onClickHandler: handleRedo,
            toolTipText: "Redo",
            icon: LuRedo2,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            withTooltip: true,
        }
    ]

}

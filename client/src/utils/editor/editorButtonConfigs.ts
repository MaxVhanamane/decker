import { BsCheckLg, BsTypeUnderline } from "react-icons/bs";
import type { ActionButtonsConfig, BlockButtonConfig, MarkButtonConfig } from "../../types/textEditorTypes";
import { AiOutlineBold, AiOutlineLink } from "react-icons/ai";
import { RxFontItalic, RxText } from "react-icons/rx";
import { LuHeading1, LuHeading2, LuHighlighter } from "react-icons/lu";
import { CustomEditor } from "./customEditor";
import { Editor, Range } from "slate";
import { BiCodeCurly } from "react-icons/bi";
import { RiArrowUpSLine, RiDoubleQuotesL, RiSeparator } from "react-icons/ri";
import { CgBorderLeft } from "react-icons/cg";
import { HiListBullet } from "react-icons/hi2";
import { FaExpand } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
// import { TbBulbFilled } from "react-icons/tb";
import { AudioNamesType } from "../../context/AudioContext";
import type { ToastHandlerType } from "../../types/types";
import { Dispatch, SetStateAction } from "react";

const commonButtonClassNames =
    "dark:text-gray-200 dark:hover:text-gray-400 p-1 text-gray-600 hover:text-gray-400 text-xl rounded-sm ";

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
};

type getEditActionButtonsParams = {
    handleSaveEdit: () => void,
    setCloseEditModalWithAnimation: Dispatch<SetStateAction<boolean>>,
    tabbable: boolean;
    toggleToolbarPosition: () => void
}


export const getMarkButtons = ({
    handleUnderline,
    handleBold,
    handleItalic,
    setShowHighlightOptions,
    tabbable,
    highlightButtonRef,
}: GetMarkButtonsParams): MarkButtonConfig[] => [
        {
            name: "addHighlightToAddCard",
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
            name: "addUnderlineTextToAddCard",
            onClickHandler: handleUnderline,
            toolTipText: "Underline text",
            icon: BsTypeUnderline,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "underline",
            withTooltip: true
        },
        {
            name: "addBoldTextToAddCard",
            onClickHandler: handleBold,
            toolTipText: "Bold text",
            icon: AiOutlineBold,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "bold",
            withTooltip: true

        },
        {
            name: "addItalicTextToAddCard",
            onClickHandler: handleItalic,
            toolTipText: "Italic text",
            icon: RxFontItalic,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "italic",
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
            icon: AiOutlineLink,
            className: commonButtonClassNames,
            tabIndex: tabbable ? 0 : -1,
            format: "link",
            withTooltip: true

        },
        {
            name: "addCodeSnippetToAddCard",
            onClickHandler: handleCode,
            toolTipText: "Insert code snippet",
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
            withTooltip: true

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
            icon: HiListBullet,
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


export const getActionButtons = ({
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
            className: " text-green-500 hover:text-green-600  text-base   rounded-sm",
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
            withTooltip: true

        },
    ];

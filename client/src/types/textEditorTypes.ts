
import { RefObject, JSX } from "react";
import { IconType } from "react-icons";
import { Descendant, Range, Element as SlateElement } from "slate";
import { BaseEditor } from "slate";
import { HistoryEditor } from "slate-history";
import { ReactEditor } from "slate-react";

export type CommandItemType = {
    label: string;
    icon?: JSX.Element;
    category: string;
    onClickHandler: () => void;
    JSX?: JSX.Element | JSX.Element[];
    hasSubmenu?: boolean
};
export type ActiveFormattingOptions = {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    highlightConfig?: HighlightConfig;
};

export type InternalDecorators = {
    isSlashCommand?: boolean;
    token?: boolean;
};
export type FormattingOptions = ActiveFormattingOptions & InternalDecorators;
export type CustomTextKeyType = keyof ActiveFormattingOptions;

export type ListElement = {
    type: ListType;
    children: ListItemElement[];
};


export type ListItemElement = {
    type: 'list-item';
    children: Descendant[];
};
export type ColorBarColors = "neutral" | "yellow" | "blue" | "green" | "red" | "pink"
export type HighlightColors = "yellow" | "blue" | "green" | "red" | "pink" | "purple" | "teal" | "sky"
export type HighlightStyle = "plain" | "wavy"
export type HighlightConfig = {
    color: HighlightColors;
    style: HighlightStyle;
};

export type ColorBarElement = {
    type: 'color-bar';
    children: Descendant[];
    color: ColorBarColors
};

export type CodeBlockElementType = {
    type: 'code-block'
    language: string
    children: Descendant[]

}
export type CodeLineElement = {
    type: 'code-line'
    children: Descendant[]
}
export type LinkElementType = {
    type: 'link'
    url: string
    children: Descendant[]
}

export type TitleElementType = {
    type: 'title'
    children: [{ text: string }]
}
export type DividerStyle = 'plain' | '3-dots' | 'dashed';

export type DividerElement = {
    type: 'divider';
    dividerStyle: DividerStyle;
    children: [{ text: '' }]; // Usually divider is a void element, but Slate needs at least one text node
};


export type ListType =
    | "bulleted-list"       // • Bullet points
    | "numbered-list"       // 1. 2. 3.
    | "alpha-upper-list"    // A. B. C.
    | "alpha-lower-list"    // a. b. c.
    | "roman-upper-list"    // I. II. III.
    | "roman-lower-list";   // i. ii. iii.


export type ParagraphElementType = { type: "paragraph"; children: Descendant[] };
export type BlockquoteElementType = { type: "blockquote"; children: Descendant[] };
export type LargeHeadingElementType = { type: "h1"; children: Descendant[] };
export type MediumHeadingElementType = { type: "h2"; children: Descendant[] };


export type CustomElementFormatType = "code-block" | "paragraph" | "link" | "h1" | "h2" | ListType | "list-item" | "blockquote" | "divider" | "color-bar"

export type CustomTextType = {
    text: string;
} & FormattingOptions;


export type CustomElementType = ParagraphElementType | CodeBlockElementType | LinkElementType | LargeHeadingElementType | MediumHeadingElementType | TitleElementType | ListItemElement | ListElement | BlockquoteElementType | DividerElement | CodeLineElement | ColorBarElement;

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor &
        ReactEditor &
        HistoryEditor & {
            nodeToDecorations?: Map<SlateElement, Range[]>
        };
        Element: CustomElementType;
        Text: CustomTextType;
    }
}


export type MarkButtonConfig = {
    name: string;
    onClickHandler: () => void;
    toolTipText: string;
    withTooltip: boolean;
    icon: IconType;
    className: string;
    tabIndex: number;
    format: "underline" | "bold" | "italic" | "highlightConfig";
    ref?: React.RefObject<HTMLButtonElement>;
    hasDropdown?: boolean;
};

export type ActionButtonsConfig = {
    name: string;
    onClickHandler?: () => void;
    toolTipText: string;
    withTooltip: boolean;
    icon: IconType;
    className: string;
    tabIndex: number;
};

export type BlockButtonConfig = {
    name: string;
    onClickHandler: () => void;
    toolTipText: string;
    withTooltip: boolean;
    icon: IconType;
    className: string;
    tabIndex: number;
    format: string;
    ref?: RefObject<HTMLButtonElement>;
    id?: string;
    ariaHaspopup?: "menu";
    ariaExpanded?: boolean;
    hasDropdown?: boolean;
};

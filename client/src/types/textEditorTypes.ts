
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
    inlineCode?: boolean
    strikethrough?: boolean
};

export type InternalDecorators = {
    isSlashCommand?: boolean;
    token?: boolean;
};
export type FormattingOptions = ActiveFormattingOptions & InternalDecorators;
export type CustomTextKeyType = keyof ActiveFormattingOptions;

export type ListType =
    | "bulleted-list"
    | "numbered-list"
    | "alpha-upper-list"
    | "alpha-lower-list"
    | "roman-upper-list"
    | "roman-lower-list"
    | "circle-list"
    | "square-list"
    | "hollow-square-list"
    | "dash-list"
    | "star-list"
    | "arrow-list";


export type ListElement = {
    type: ListType;
    children: ListItemElement[];
    userStyled?: boolean;
    locked?: boolean;
    indentLevel?: IndentLevel;
};
export type ListItemTextElementType = {
    type: 'list-item-text';
    children: Descendant[];
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
    color: ColorBarColors,
    indentLevel?: IndentLevel
};


export type CodeBlockElementType = {
    type: 'code-block'
    language: string
    children: Descendant[]
}
export type CodeLineElement = {
    type: 'code-line'
    children: Descendant[]
    indentLevel?: IndentLevel;
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
export type HeadingLevel = 1 | 2 | 3
export type HeadingElement = {
    type: "heading"; children: Descendant[], indentLevel?: IndentLevel,
    level: HeadingLevel
}

export type IndentLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type ParagraphElementType = { type: "paragraph"; children: Descendant[], indentLevel?: IndentLevel };
export type BlockquoteElementType = { type: "blockquote"; children: Descendant[], indentLevel?: IndentLevel };

export type IndentableElementType =
    | ParagraphElementType
    | HeadingElement
    | BlockquoteElementType
    | ColorBarElement | CodeLineElement | ListElement

export type IndentableElementTypeStrings = IndentableElementType['type'];

export type CustomElementFormatType = "code-block" | "paragraph" | "link" | ListType | "list-item" | "blockquote" | "divider" | "color-bar" | "heading"

export type CustomTextType = {
    text: string;
} & FormattingOptions;


export type CustomElementType = ParagraphElementType | ListItemTextElementType | CodeBlockElementType | LinkElementType | HeadingElement | TitleElementType | ListItemElement | ListElement | BlockquoteElementType | DividerElement | CodeLineElement | ColorBarElement;

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
    subTooltipText?: string;
    withTooltip: boolean;
    icon: IconType;
    className: string;
    tabIndex: number;
    format: "underline" | "bold" | "italic" | "highlightConfig" | "inlineCode" | "strikethrough";
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
    [key: `data-${string}`]: string | number | boolean | undefined;
};
export type StructureButtonsConfig = {
    name: string;
    onClickHandler: () => void;
    toolTipText: string;
    icon: IconType;
    className: string;
    tabIndex: number;
    withTooltip: boolean;
};

export type HistoryButtonsConfig = {
    name: string;
    onClickHandler: () => void;
    toolTipText: string;
    icon: IconType;
    className: string;
    tabIndex: number;
    withTooltip: boolean;
};

export type BlockButtonConfig = {
    name: string;
    onClickHandler: () => void;
    toolTipText: string;
    subTooltipText?: string;
    withTooltip: boolean;
    icon: IconType;
    className: string;
    tabIndex: number;
    format: string;
    ref?: RefObject<HTMLButtonElement>;
    id?: string;
    iconClassName?: string;
    ariaHaspopup?: "menu";
    ariaExpanded?: boolean;
    hasDropdown?: boolean;
};

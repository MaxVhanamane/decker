import { Dispatch, memo, SetStateAction } from "react";
import { RenderElementProps } from "slate-react";
import TitleElement from "./elements/editable/TitleElement";
import CodeBlockElement from "./elements/editable/CodeBlockElement";
import HeadingOneElement from "./elements/editable/HeadingOneElement";
import HeadingTwoElement from "./elements/editable/HeadingTwoElement";
import QuoteElement from "./elements/editable/QuoteElement";
import LinkElement from "./elements/editable/LinkElement";
import ParagraphElement from "./elements/editable/ParagraphElement";
import Divider from "./elements/editable/Divider";
import ColorBar from "./elements/editable/ColorBar";
import List from "./elements/editable/List";
import { Range } from "slate";

export const RenderElement = memo(
  (
    props: RenderElementProps & {
      setSelectedLinkDetails?: Dispatch<
        SetStateAction<{
          title: string;
          url: string;
          linkPosition: Range;
        } | null>
      >;
    }
  ) => {
    const { element, attributes, children } = props;

    switch (element.type) {
      case "title":
        return <TitleElement {...props} />;
      case "code-block":
        return <CodeBlockElement {...props} />;
      case "code-line":
        return (
          <div {...attributes} className="relative">
            {children}
          </div>
        );
      case "h1":
        return <HeadingOneElement {...props} />;

      case "h2":
        return <HeadingTwoElement {...props} />;
      case "blockquote":
        return <QuoteElement {...props} />;
      case "link":
        return <LinkElement {...props} />;
      case "color-bar":
        return <ColorBar {...props} />;
      case "bulleted-list":
      case "numbered-list":
      case "alpha-upper-list":
      case "alpha-lower-list":
      case "roman-upper-list":
      case "roman-lower-list":
        return <List {...props} />;

      case "list-item":
        return <li {...props.attributes}>{props.children}</li>;
      case "divider": {
        return <Divider {...props} />;
      }

      default:
        return <ParagraphElement {...props} />;
    }
  }
);

import { Dispatch, memo, SetStateAction } from "react";
import { RenderElementProps } from "slate-react";
import TitleElement from "./elements/editable/TitleElement";
import CodeBlockElement from "./elements/editable/CodeBlockElement";
import Heading from "./elements/editable/HeadingElement";
import QuoteElement from "./elements/editable/QuoteElement";
import LinkElement from "./elements/editable/LinkElement";
import ParagraphElement from "./elements/editable/ParagraphElement";
import Divider from "./elements/editable/Divider";
import ColorBar from "./elements/editable/ColorBar";
import List from "./elements/editable/List";
import { Range } from "slate";
import ListItem from "./elements/editable/ListItem";
import { indentMargin } from "../../utils/constants";

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
          <div
            style={{
              marginLeft: element.indentLevel
                ? indentMargin * element.indentLevel
                : 0,
            }}
            {...attributes}
            className="relative"
          >
            {children}
          </div>
        );
      case "heading":
        return <Heading {...props} />;

      case "blockquote":
        return <QuoteElement {...props} />;
      case "link":
        return <LinkElement {...props} />;
      case "color-bar":
        return <ColorBar {...props} />;
      case "bulleted-list":
      case "circle-list":
      case "square-list":
      case "hollow-square-list":
      case "dash-list":
      case "star-list":
      case "arrow-list":
      case "numbered-list":
      case "alpha-upper-list":
      case "alpha-lower-list":
      case "roman-upper-list":
      case "roman-lower-list":
        return <List key={element.type} {...props} />;
      case "list-item-text":
        return <div {...attributes}>{children}</div>;
      case "list-item":
        return <ListItem {...props} />;
      case "divider": {
        return <Divider {...props} />;
      }

      default:
        return <ParagraphElement {...props} />;
    }
  }
);

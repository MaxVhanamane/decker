import { withReact } from "slate-react";
import { withClearEmptyMarks } from "./plugins/withClearEmptyMarks";
import { withExitInlineOnSpace } from "./plugins/withExitInlineOnSpace";
import { withInlineElements } from "./plugins/withInlineElements";
import { withResetToParagraphOnBackspaceWhenEmpty } from "./plugins/withResetToParagraphOnBackspaceWhenEmpty";
import { withResetToParagraphOnEnter } from "./plugins/withResetToParagraphOnEnter";
import { withTitle } from "./plugins/withTitle";
import { withTitleBackspaceProtection } from "./plugins/withTitleBackspaceProtection";
import { withUnwrapEmptyInlines } from "./plugins/withUnwrapEmptyInlines";
import { withVoidElements } from "./plugins/withVoidElements";
import { withHistory } from "slate-history";
import { createEditor } from "slate";
import { withLists } from "@prezly/slate-lists";
import { listsSchema } from "./prezlyList";
import { withNormalizeListDepths } from "./plugins/withNormalizeListDepths";

export const createCardEditor = () => {

    return withResetToParagraphOnBackspaceWhenEmpty(
        withResetToParagraphOnEnter(
            withTitleBackspaceProtection(
                withTitle(
                    withInlineElements(
                        withUnwrapEmptyInlines(
                            withClearEmptyMarks(
                                withVoidElements(
                                    withExitInlineOnSpace(
                                        withNormalizeListDepths(withLists(listsSchema)(withReact(withHistory(createEditor()))))
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    );
};

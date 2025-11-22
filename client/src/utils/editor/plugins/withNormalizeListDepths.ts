import { Editor, Element, Node, Transforms, Path } from "slate";
import { listsSchema, MY_TO_PREZLY } from "../prezlyList";
import { ListElement, ListType } from "../../../types/textEditorTypes";
import { ListType as PrezlyListType } from "@prezly/slate-lists";

const ORDERED_LIST_CYCLE: ListType[] = [
    "numbered-list",
    "roman-lower-list",
    "alpha-lower-list",
    "alpha-upper-list",
    "roman-upper-list"
];

const UNORDERED_LIST_CYCLE: ListType[] = [
    "bulleted-list",
    "circle-list",
    "square-list",
    "hollow-square-list",
    "star-list",
    "dash-list",
    "arrow-list",
];

// Helper to determine list type category (ordered or unordered)
const getListTypeCategory = (listType: ListType): PrezlyListType => {
    const prezlyType = MY_TO_PREZLY[listType];
    return prezlyType;
};

// Find the immediate parent list and get its type and styling info
const getImmediateParentListType = (
    editor: Editor,
    path: Path
): { type: ListType; path: Path; isUserStyled: boolean; isLocked: boolean } | null => {
    // Start from parent of current node
    for (let i = path.length - 2; i >= 0; i--) {
        const ancestorPath = path.slice(0, i + 1);
        try {
            const ancestor = Node.get(editor, ancestorPath) as ListElement;
            if (Element.isElement(ancestor) && listsSchema.isListNode(ancestor)) {
                return {
                    type: ancestor.type as ListType,
                    path: ancestorPath,
                    isUserStyled: ancestor.userStyled === true,
                    isLocked: ancestor.locked === true
                };
            }
        } catch (e) {
            break;
        }
    }
    return null;
};

// Get next type in cycle, excluding the forbidden type
const getNextTypeInCycle = (
    typeArray: ListType[],
    currentDepth: number,
    forbiddenType: ListType
): ListType => {
    const candidateType = typeArray[currentDepth % typeArray.length];

    // If the candidate is forbidden, use the next one in the cycle
    if (candidateType === forbiddenType) {
        return typeArray[(currentDepth + 1) % typeArray.length];
    }

    return candidateType;
};

export const withNormalizeListDepths = (editor: Editor) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = ([node, path]) => {
        if (!Element.isElement(node)) {
            return normalizeNode([node, path]);
        }

        // Only process list nodes
        if (listsSchema.isListNode(node)) {
            // If this list is locked (finalized), never change it
            if ((node as ListElement).locked === true) {
                return normalizeNode([node, path]);
            }

            // Get immediate parent list
            const immediateParent = getImmediateParentListType(editor, path);

            if (immediateParent) {
                // This is a nested list

                let rootListType: PrezlyListType;
                let depthFromRoot: number = 0;

                if (immediateParent.isUserStyled) {
                    // Parent was manually styled by user
                    // Start a NEW hierarchy from this parent
                    rootListType = getListTypeCategory(immediateParent.type);
                    depthFromRoot = 1; // Direct child is depth 1 from the user-styled parent
                } else {
                    // Parent is NOT user-styled
                    // Check if ANY ancestor is user-styled
                    let nearestStyledAncestorType: ListType | null = null;
                    let depthFromStyled = 0;

                    // Walk up to find the nearest user-styled ancestor
                    for (let i = path.length - 2; i >= 0; i--) {
                        const ancestorPath = path.slice(0, i + 1);
                        try {
                            const ancestor = Node.get(editor, ancestorPath) as ListElement;
                            if (Element.isElement(ancestor) && listsSchema.isListNode(ancestor)) {
                                depthFromStyled++;
                                if ((ancestor).userStyled === true) {
                                    nearestStyledAncestorType = ancestor.type as ListType;
                                    break;
                                }
                            }
                        } catch (e) {
                            break;
                        }
                    }

                    if (nearestStyledAncestorType) {
                        // Found a user-styled ancestor, use its type as root
                        rootListType = getListTypeCategory(nearestStyledAncestorType);
                        depthFromRoot = depthFromStyled;
                    } else {
                        // No user-styled ancestor, use absolute root
                        let depth = 0;
                        let rootType = immediateParent.type;
                        for (let i = path.length - 2; i >= 0; i--) {
                            const ancestorPath = path.slice(0, i + 1);
                            try {
                                const ancestor = Node.get(editor, ancestorPath);
                                if (
                                    Element.isElement(ancestor) &&
                                    listsSchema.isListNode(ancestor)
                                ) {
                                    depth++;
                                    rootType = ancestor.type as ListType;
                                }
                            } catch (e) {
                                break;
                            }
                        }

                        rootListType = getListTypeCategory(rootType);
                        depthFromRoot = depth;
                    }
                }

                // Determine the type array (ordered or unordered)
                const typeArray =
                    rootListType === PrezlyListType.ORDERED
                        ? ORDERED_LIST_CYCLE
                        : UNORDERED_LIST_CYCLE;

                // Get correct type, ensuring it doesn't match immediate parent
                const correctType = getNextTypeInCycle(
                    typeArray,
                    depthFromRoot % typeArray.length,
                    immediateParent.type
                );

                if (node.type !== correctType) {
                    // Transform the list to the correct type AND lock it
                    Transforms.setNodes(
                        editor,
                        { type: correctType, locked: true },
                        { at: path }
                    );
                    return; // Exit immediately after transform
                } else if (node.locked !== true) {
                    // Type is already correct, lock it so it doesn't change
                    Transforms.setNodes(
                        editor,
                        { locked: true },
                        { at: path }
                    );
                    return;
                }
            }
        }

        // Fall back to default normalization
        normalizeNode([node, path]);
    };

    return editor;
};

/**
 * Mark a list as manually styled by the user
 * Call this when user explicitly changes list type via UI (toolbar, keyboard shortcut)
 * This marks the list as user-styled and locks it
 */
export const markListAsManuallyStyled = (editor: Editor, listPath: Path) => {
    try {
        Transforms.setNodes(
            editor,
            { userStyled: true, locked: true },
            { at: listPath }
        );


    } catch (e) {
        console.error('Error marking list as manually styled:', e);
    }
};

/**
 * Clear user styling from a list
 * Call this when you want to re-enable auto-styling
 */
export const clearUserListStyling = (editor: Editor, listPath: Path) => {
    try {
        Transforms.setNodes(
            editor,
            { userStyled: false, locked: false },
            { at: listPath }
        );
    } catch (e) {
        console.error('Error clearing user styling:');
    }
};



export const clearDescendantListStyling = (editor: Editor, parentPath: Path) => {
    const clearPaths: Path[] = [];

    const traverse = (node: Node, path: Path) => {
        if (Element.isElement(node) && listsSchema.isListNode(node)) {
            if (path.length > parentPath.length) {
                const listEl = node as ListElement;
                // ONLY clear if NOT locked
                if (!listEl.locked) {
                    clearPaths.push(path);
                }
            }
        }

        if ('children' in node) {
            node.children.forEach((child, i) => {
                traverse(child, [...path, i]);
            });
        }
    };

    const [parent] = Editor.node(editor, parentPath);
    traverse(parent, parentPath);

    Editor.withoutNormalizing(editor, () => {
        clearPaths.forEach(p => {
            Transforms.setNodes(editor, { userStyled: false, locked: false }, { at: p });
        });
    });
};

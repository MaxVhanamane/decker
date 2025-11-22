import { DragEndEvent } from "@dnd-kit/core";
import { useCallback, useContext, useRef } from "react";
import { BulbContext } from "../../../context/BulbContext";
import { DndCurrentDraggingCardContext, DndCurrentDraggingChapterContext, DndCurrentDraggingDeckContext, DndFilterContext, DndSettersContext } from "../../../context/DndItemContext";
import { useQueryClient } from "@tanstack/react-query";
import { CardType, DeckType, GetChaptersResponseType } from "../../../types/types";
import useReorderCard from "../../../hooks/react-query/useReorderCard";
import useDeleteCard from "../../../hooks/react-query/useDeleteCard";
import useDeleteDeck from "../../../hooks/react-query/useDeleteDeck";
import { OfflineContext } from "../../../context/OfflineContext";
import { ShowToastContext } from "../../../context/ToastNotificationContext";
import useReorderDeck from "../../../hooks/react-query/useReorderDeck";
import useToastOnError from "../../../hooks/utility/useToastOnError";
import useReorderChapter from "../../../hooks/react-query/useRorderChapter";
import useDeleteChapter from "../../../hooks/react-query/useDeleteChapter";

const useDragHandlers = () => {
    const {
        setAllDecksState,
        setCurrentDraggingCard,
        setAllCardsState,
        setCurrentDraggingDeck,
        setCurrentDraggingChapter,
        setAllChaptersState,
    } = useContext(DndSettersContext);
    const { bulbRef } = useContext(BulbContext);
    const { currentDraggingDeck } = useContext(DndCurrentDraggingDeckContext);
    const { currentDraggingCard } = useContext(DndCurrentDraggingCardContext);
    const { currentDraggingChapter } = useContext(DndCurrentDraggingChapterContext);
    const { isOnline } = useContext(OfflineContext);
    const { showToast } = useContext(ShowToastContext);
    const activeItemRef = useRef<Record<string, any> | undefined>();


    const { setDeckIdToFilterOnDragOverDeleteArea } =
        useContext(DndFilterContext);

    const { mutate: deleteCard } = useDeleteCard();
    const { mutate: deleteDeck } = useDeleteDeck();
    const { mutate: deleteChapter } = useDeleteChapter();

    const queryClient = useQueryClient();
    const { mutate: reorderDeck } = useReorderDeck();
    const { mutate: reorderChapter } = useReorderChapter();
    const {
        mutate: moveCard,
        reset: resetMoveCardResponse,
        isError: isMoveCardError,
        error: moveCardError,
    } = useReorderCard();

    useToastOnError({
        isError: isMoveCardError,
        error: moveCardError,
        resetFunction: resetMoveCardResponse,
    });
    const handleDragStart = useCallback(
        (event: DragEndEvent) => {
            const { active } = event;
            // active.data.current?.name will give you "deck" or "card"
            // This if condition will handle deck related draggin and dropping
            activeItemRef.current = active.data?.current
            if (active.data?.current?.name === "deck") {
                // If a user creates a deck, the bulb color will turn cyan for a few seconds. If the user starts dragging during that time, we will remove the cyan color first and then add the color accordingly.
                if (bulbRef.current?.colorName === "cyan") {
                    bulbRef.current?.removeBulbColor("cyan");
                }
                if (active.data.current?.isPinned) {
                    bulbRef?.current?.setBulbColor("fuchsia");
                } else if (active.data.current?.isPinned === false) {
                    bulbRef?.current?.setBulbColor("lime");
                }

                setCurrentDraggingDeck({
                    isDragging: true,
                    deck: active.data.current?.deck,
                    isDraggingOverDeleteArea: false,
                });
            }

            else if (active.data?.current?.name === "card") {
                if (bulbRef.current?.colorName === "yellow") {
                    bulbRef.current.removeBulbColor("yellow");
                }
                bulbRef?.current?.setBulbColor("violet");

                setCurrentDraggingCard({
                    isDragging: true,
                    isDraggingCardOverDeleteArea: false,
                    card: {
                        title: active.data?.current?.card?.title,
                        note: active.data?.current?.card?.note,
                        createdAt: active.data?.current?.card?.createdAt,
                    },
                });
            }
            else if (active.data?.current?.name === "chapter") {
                bulbRef?.current?.setBulbColor("green");
                setCurrentDraggingChapter({
                    isDragging: true,
                    chapter: active.data?.current?.ChapterDetails,
                    isDraggingOverDeleteArea: false,
                });
            }

        },
        [setCurrentDraggingDeck, setCurrentDraggingCard, setCurrentDraggingChapter]
    );

    const handleDragMove = useCallback(
        (event: DragEndEvent) => {
            // This if statement fixes the issue if you drag over delete area and then move the card out of screen from there it won't reset color even if it is not on delete deck area.
            const { over } = event;



            if (activeItemRef.current?.name === "deck") {
                if (
                    over?.id !== "DeckDeleteArea" &&
                    currentDraggingDeck?.isDraggingOverDeleteArea
                ) {
                    if (activeItemRef.current?.isPinned) {
                        bulbRef?.current?.removeBulbColor("red");
                        bulbRef?.current?.setBulbColor("fuchsia");
                    } else if (activeItemRef.current?.isPinned === false) {
                        bulbRef?.current?.removeBulbColor("red");
                        bulbRef?.current?.setBulbColor("lime");
                    }

                    // This state controls the appearance of the drag overlay (deck).
                    setCurrentDraggingDeck((pre) => {
                        if (!pre) {
                            return null;
                        }
                        return {
                            ...pre,
                            isDraggingOverDeleteArea: false,
                        };
                    });
                }
            } else if (activeItemRef.current?.name === "card") {
                if (
                    over?.id !== "CardAndChapterDeleteArea" &&
                    currentDraggingCard?.isDraggingCardOverDeleteArea
                ) {
                    bulbRef?.current?.removeBulbColor("red");
                    bulbRef?.current?.setBulbColor("violet");
                    // This state controls the appearance of the drag overlay (card).
                    setCurrentDraggingCard((pre) => {
                        if (!pre) {
                            return null;
                        }
                        return {
                            ...pre,
                            isDraggingCardOverDeleteArea: false,
                        };
                    });
                }
            }
            else if (activeItemRef.current?.name === "chapter") {

                if (
                    over?.id !== "CardAndChapterDeleteArea" &&
                    currentDraggingChapter?.isDraggingOverDeleteArea
                ) {
                    bulbRef?.current?.removeBulbColor("red");
                    bulbRef?.current?.setBulbColor("green");
                    setCurrentDraggingChapter((pre) => {
                        if (!pre) {
                            return null;
                        }
                        return {
                            ...pre,
                            isDraggingOverDeleteArea: false,
                        };
                    });
                }
            }
        },
        [
            currentDraggingDeck,
            setCurrentDraggingDeck,
            currentDraggingChapter,
            setCurrentDraggingCard,
            currentDraggingCard,
            bulbRef,
        ]
    );

    const handleDragOver = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over) return;
            if (active.id === over.id) return;

            if (activeItemRef.current?.name === "deck") {
                if (
                    over?.id === "DeckDeleteArea" &&
                    currentDraggingDeck?.isDraggingOverDeleteArea === false
                ) {
                    if (
                        activeItemRef.current?.isPinned &&
                        bulbRef?.current?.colorName !== "red"
                    ) {
                        bulbRef?.current?.removeBulbColor("fuchsia");
                        bulbRef?.current?.setBulbColor("red");
                    } else if (
                        activeItemRef.current?.isPinned === false &&
                        bulbRef?.current?.colorName !== "red"
                    ) {
                        bulbRef?.current?.removeBulbColor("lime");
                        bulbRef?.current?.setBulbColor("red");
                    }

                    setCurrentDraggingDeck((pre) => {
                        if (!pre) {
                            return null;
                        }
                        return {
                            ...pre,
                            isDraggingOverDeleteArea: true,
                        };
                    });
                }
            } else if (activeItemRef.current?.name === "card") {
                if (
                    over?.id === "CardAndChapterDeleteArea" &&
                    currentDraggingCard?.isDraggingCardOverDeleteArea === false
                ) {
                    bulbRef?.current?.removeBulbColor("violet");
                    bulbRef?.current?.setBulbColor("red");
                    setCurrentDraggingCard((pre) => {
                        if (!pre) {
                            return null;
                        }
                        return {
                            ...pre,
                            isDraggingCardOverDeleteArea: true,
                        };
                    });
                }
            }
            else if (activeItemRef.current?.name === "chapter") {

                if (
                    over?.id === "CardAndChapterDeleteArea" &&
                    currentDraggingChapter?.isDraggingOverDeleteArea === false
                ) {

                    bulbRef?.current?.removeBulbColor("green");
                    bulbRef?.current?.setBulbColor("red");
                    setCurrentDraggingChapter((pre) => {
                        if (!pre) {
                            return null;
                        }
                        return {
                            ...pre,
                            isDraggingOverDeleteArea: true
                        };
                    });
                }
            }
        },
        [
            currentDraggingChapter,
            currentDraggingDeck,
            currentDraggingCard,
            setCurrentDraggingCard,
            setCurrentDraggingDeck,
            bulbRef,
        ]
    );

    const handleOnDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (activeItemRef.current?.name === "deck") {
                // Reset bulb color:
                if (bulbRef?.current?.colorName === "fuchsia") {
                    bulbRef?.current?.removeBulbColor("fuchsia");
                } else if (bulbRef?.current?.colorName === "lime") {
                    bulbRef?.current?.removeBulbColor("lime");
                } else if (bulbRef.current?.colorName === "red") {
                    bulbRef?.current?.removeBulbColor("fuchsia");
                    bulbRef?.current?.removeBulbColor("lime");
                    bulbRef?.current?.removeBulbColor("red");
                }

                setCurrentDraggingDeck(null);
                if (!isOnline) {
                    showToast({
                        message: "No internet connection",
                        severity: "error",
                        autoHideDuration: 5000,
                        position: "top-center",
                        animationStyle: "scale-up",
                        theme: "auto",
                    });

                    return;
                }
                if (!over) return;

                // If deck is dropped in same place then do nothing
                if (active.id === over.id) return;

                if (activeItemRef.current?.name && over?.id !== "DeckDeleteArea") {
                    const allDecks = queryClient.getQueryData<DeckType>(["decks"]);
                    if (!allDecks) return;

                    const draggedId = activeItemRef.current.deck.deckId;
                    const isPinned = !!activeItemRef.current.isPinned;
                    const hoverId = over?.data?.current?.deck?.deckId ?? null;

                    // split & sort each section by order (use same comparator as server)
                    const pinned = allDecks.decks.filter(d => d.pinned)
                        .sort((a, b) => {
                            // descending order: higher order comes first
                            if (a.order > b.order) return -1;
                            if (a.order < b.order) return 1;
                            return 0;
                        });

                    const unpinned = allDecks.decks.filter(d => !d.pinned)
                        .sort((a, b) => {
                            // descending order: higher order comes first
                            if (a.order > b.order) return -1;
                            if (a.order < b.order) return 1;
                            return 0;
                        });


                    const section = isPinned ? pinned : unpinned;

                    // 1) find dragged index in original sorted section
                    const draggedIndexInOriginal = section.findIndex(d => d.deckId === draggedId);
                    if (draggedIndexInOriginal === -1) return; // safety

                    // 2) list without dragged item in it
                    const listWithoutDragged = section.filter(d => d.deckId !== draggedId);

                    // 3) find hover indices
                    const hoverIndexInOriginal = hoverId ? section.findIndex(d => d.deckId === hoverId) : -1;
                    const hoverIndexInWithout = hoverId ? listWithoutDragged.findIndex(d => d.deckId === hoverId) : -1;

                    // 4) compute insert index
                    let insertIndex: number;
                    if (hoverIndexInWithout === -1) {
                        // drop at end of section
                        insertIndex = listWithoutDragged.length;
                    } else {
                        // if originally dragged was before hover in the original list -> moving down -> insert after hover
                        if (draggedIndexInOriginal < hoverIndexInOriginal) {
                            insertIndex = hoverIndexInWithout + 1;
                        } else {
                            // moving up or same spot -> insert before hover
                            insertIndex = hoverIndexInWithout;
                        }
                    }

                    // 5) build new section with dragged re-inserted
                    const draggedItem = section[draggedIndexInOriginal];
                    const newSection = [
                        ...listWithoutDragged.slice(0, insertIndex),
                        draggedItem,
                        ...listWithoutDragged.slice(insertIndex),
                    ];

                    // 6) prev/next ids for backend
                    const prevDeckId = insertIndex > 0 ? newSection[insertIndex - 1].deckId : null;
                    const nextDeckId = insertIndex < newSection.length - 1 ? newSection[insertIndex + 1].deckId : null;

                    // 7) combine back pinned/unpinned (preserve order inside each section)
                    const finalPinned = isPinned ? newSection : pinned;
                    const finalUnpinned = isPinned ? unpinned : newSection;
                    const combined = [...finalPinned, ...finalUnpinned];

                    setAllDecksState({ decks: combined, });

                    // 8) server will compute final order
                    reorderDeck({ deckId: draggedId, prevDeckId, nextDeckId });
                }


                if (over?.id === "DeckDeleteArea") {
                    if (!isOnline) {
                        showToast({
                            message: "No internet connection",
                            severity: "error",
                            autoHideDuration: 5000,
                            position: "top-center",
                            animationStyle: "scale-up",
                            theme: "auto",
                        });

                        return;
                    }
                    // Remove the item from the list. If you don't remove it when dropping an element into the delete area, the drag overlay element will return to its old position for a split second. To avoid this, I have used the setDeckIdToFilterOnDragOverDeleteArea state.
                    setDeckIdToFilterOnDragOverDeleteArea(active.id);

                    deleteDeck({ deckId: active.id as string });
                }
            }

            if (activeItemRef.current?.name === "card") {
                setCurrentDraggingCard(null);
                if (bulbRef?.current?.colorName === "violet") {
                    bulbRef?.current?.removeBulbColor("violet");
                } else if (bulbRef.current?.colorName === "red") {
                    bulbRef?.current?.removeBulbColor("violet");
                    bulbRef?.current?.removeBulbColor("red");
                }

                if (!over) return;

                // If card is dropped in same place then do nothing
                if (active.id === over.id) return;

                if (
                    activeItemRef.current?.index !== undefined &&
                    over?.data?.current?.index !== undefined
                ) {
                    const queryKey = activeItemRef.current?.card?.chapterId ? ["chapter-cards", activeItemRef.current?.deckId, activeItemRef.current?.card?.chapterId] : [
                        "cards",
                        activeItemRef.current?.deckId,
                    ]

                    const cards: CardType = queryClient.getQueryData<CardType>(queryKey);


                    if (cards?.cards) {
                        // Make a deep-ish copy (new references for each card)
                        const updatedCards = cards.cards.map((card) => ({ ...card }));

                        const fromIndex = activeItemRef.current?.index;
                        const toIndex = over?.data?.current?.index;

                        // Remove the card first
                        const [movedItem] = updatedCards.splice(fromIndex, 1);

                        // Insert the card at the intended target index
                        updatedCards.splice(toIndex, 0, movedItem);

                        // find its neighbors 
                        const prevCard = updatedCards[toIndex - 1] || null;
                        const nextCard = updatedCards[toIndex + 1] || null;

                        let newOrderValue: number;
                        if (prevCard && nextCard) {
                            newOrderValue = (prevCard.order + nextCard.order) / 2;
                        } else if (!prevCard && nextCard) {
                            // Top of list
                            newOrderValue = nextCard.order + 10;
                        } else if (prevCard && !nextCard) {
                            // Bottom of list
                            newOrderValue = prevCard.order - 10;
                        } else {
                            // Only card
                            newOrderValue = 10;
                        }
                        let reindexNeeded = false;
                        if (prevCard && nextCard) {
                            reindexNeeded = Math.abs(prevCard.order - nextCard.order) < 0.0001;
                        }



                        movedItem.order = newOrderValue;


                        setAllCardsState({ ...cards, cards: updatedCards });
                        const payload = activeItemRef.current?.card?.chapterId ? {
                            fromIndex,
                            toIndex,
                            deckId: activeItemRef.current?.deckId,
                            cardId: activeItemRef.current?.card?.cardId,
                            newOrder: newOrderValue,
                            chapterId: activeItemRef.current?.card?.chapterId,
                            reindexNeeded
                        } : {
                            fromIndex,
                            toIndex,
                            deckId: activeItemRef.current?.deckId,
                            cardId: activeItemRef.current?.card?.cardId,
                            newOrder: newOrderValue,
                            reindexNeeded

                        }
                        moveCard(payload);
                    }

                } else if (over?.id === "CardAndChapterDeleteArea") {

                    const deckId = activeItemRef.current?.deckId;
                    const chapterId = activeItemRef.current?.card?.chapterId;
                    const cardInfo = {
                        note: activeItemRef.current?.card?.note,
                        cardId: activeItemRef.current?.card?.cardId,
                        createdAt: activeItemRef.current?.card?.createdAt,
                        order: activeItemRef.current?.card?.order,
                    };
                    setAllCardsState((prevCards) => {
                        if (!prevCards) return null;

                        const updatedCards = prevCards.cards.filter((card) => card.order !== activeItemRef.current?.card?.order)
                        return {
                            ...prevCards,
                            cards: updatedCards,
                        };
                    });

                    const cardDetails = chapterId ? { chapterId, deckId, cardInfo } : { deckId, cardInfo }

                    deleteCard(cardDetails);
                }
            }
            if (activeItemRef.current?.name === "chapter") {
                setCurrentDraggingChapter(null);
                if (bulbRef?.current?.colorName === "green") {
                    bulbRef?.current?.removeBulbColor("green");
                } else if (bulbRef.current?.colorName === "red") {
                    bulbRef?.current?.removeBulbColor("green");
                    bulbRef?.current?.removeBulbColor("red");
                }

                if (!over) return;

                // If chapter is dropped in same place then do nothing
                if (active.id === over.id) return;
                if (
                    activeItemRef.current?.index !== undefined &&
                    over?.data?.current?.index !== undefined
                ) {
                    const queryKey = ["chapters", activeItemRef.current?.ChapterDetails?.deckId]

                    const chaptersResponse = queryClient.getQueryData<GetChaptersResponseType>(queryKey);


                    if (chaptersResponse?.chapters) {
                        // Make a deep-ish copy (new references for each card)
                        const updatedChapters = chaptersResponse.chapters.map((chapter) => ({ ...chapter }));

                        const fromIndex = activeItemRef.current?.index;
                        const toIndex = over?.data?.current?.index;

                        // Remove the card first
                        const [movedItem] = updatedChapters.splice(fromIndex, 1);

                        // Insert the card at the intended target index
                        updatedChapters.splice(toIndex, 0, movedItem);

                        // find its neighbors 
                        const prevChapter = updatedChapters[toIndex - 1] || null;
                        const nextChapter = updatedChapters[toIndex + 1] || null;

                        let newOrderValue: number;
                        if (prevChapter && nextChapter) {
                            newOrderValue = (prevChapter.order + nextChapter.order) / 2;
                        } else if (!prevChapter && nextChapter) {
                            // Top of list
                            newOrderValue = nextChapter.order + 10;
                        } else if (prevChapter && !nextChapter) {
                            // Bottom of list
                            newOrderValue = prevChapter.order - 10;
                        } else {
                            // Only card
                            newOrderValue = 10;
                        }
                        let reindexNeeded = false;
                        if (prevChapter && nextChapter) {
                            reindexNeeded = Math.abs(prevChapter.order - nextChapter.order) < 0.0001;
                        }

                        movedItem.order = newOrderValue;


                        setAllChaptersState({ ...chaptersResponse, chapters: updatedChapters });
                        const payload = {
                            deckId: activeItemRef.current?.ChapterDetails.deckId,
                            chapterId: activeItemRef.current?.ChapterDetails.chapterId,
                            newOrder: newOrderValue,
                            reindexNeeded
                        }

                        reorderChapter(payload);
                    }

                }
                else if (over?.id === "CardAndChapterDeleteArea") {

                    setAllChaptersState((prevChapters) => {
                        if (!prevChapters) return null;

                        const updatedChapters = prevChapters.chapters.filter((chapter) => chapter.chapterId !== activeItemRef.current?.ChapterDetails?.chapterId)
                        return {
                            ...prevChapters,
                            chapters: updatedChapters,
                        };
                    });


                    deleteChapter({ chapterInfo: activeItemRef.current.ChapterDetails });
                }
            }
        },
        [
            showToast,
            isOnline,
            reorderDeck,
            deleteDeck,
            moveCard,
            deleteCard,
            reorderChapter,
            deleteChapter,
            bulbRef,
        ]

    );

    const handleDragCancel = useCallback(() => {
        const colorName = bulbRef.current?.colorName;
        if (colorName) {
            bulbRef.current.removeBulbColor(colorName);
        }
        setCurrentDraggingCard(null)
        setCurrentDraggingDeck(null)
        setCurrentDraggingChapter(null)
    }, []);


    return {
        handleDragStart, handleDragMove, handleDragOver, handleOnDragEnd, handleDragCancel
    }
}

export default useDragHandlers








// if (activeItemRef.current?.name && over?.id !== "DeckDeleteArea") {
//     const allDecks = queryClient.getQueryData<DeckType>(["decks"]);
//     if (!allDecks) return;
//     const copiedDeckItems = allDecks.decks.map((deck) => ({ ...deck }));
//     const allDecksCopy = { ...allDecks, decks: copiedDeckItems }
//     let newOrder: string | undefined = undefined
//     let deckOrderBounds = {
//         firstPinnedDeckOrder: allDecksCopy.firstPinnedDeckOrder, lastPinnedDeckOrder: allDecksCopy.lastPinnedDeckOrder, firstUnpinnedDeckOrder: allDecksCopy.firstUnpinnedDeckOrder, lastUnpinnedDeckOrder: allDecksCopy.lastUnpinnedDeckOrder
//     }
//     if (allDecksCopy) {
//         // Moved deck in pinned section
//         if (activeItemRef.current?.isPinned) {
//             if (over?.data?.current?.deck?.order === allDecksCopy.firstPinnedDeckOrder) {

//                 newOrder = generateJitteredKeyBetween(null, over?.data?.current?.deck?.order)

//                 if (newOrder) {
//                     deckOrderBounds.firstPinnedDeckOrder = newOrder
//                 }
//             }
//             else if (over?.data?.current?.deck?.order === allDecksCopy.lastPinnedDeckOrder) {
//                 newOrder = generateJitteredKeyBetween(over?.data?.current?.deck?.order, null)
//                 if (newOrder) {
//                     deckOrderBounds.lastPinnedDeckOrder = newOrder
//                 }
//             }
//             else {

//                 const decks = allDecksCopy.decks.filter(deck => deck.pinned);
//                 const hoverIndex = decks.findIndex(deck => deck.order === over?.data?.current?.deck?.order);
//                 const draggedIndex = decks.findIndex(deck => deck.deckId === activeItemRef.current?.deck?.deckId);

//                 let prevOrder: string | null = null;
//                 let nextOrder: string | null = null;

//                 if (draggedIndex < hoverIndex) {
//                     // Moving down/forward
//                     prevOrder = decks[hoverIndex].order;
//                     nextOrder = hoverIndex + 1 < decks.length ? decks[hoverIndex + 1].order : null;

//                 } else {
//                     // Moving up/backward
//                     prevOrder = hoverIndex > 0 ? decks[hoverIndex - 1].order : null;
//                     nextOrder = decks[hoverIndex].order;

//                 }

//                 if (prevOrder !== null || nextOrder !== null) {
//                     newOrder = generateJitteredKeyBetween(prevOrder, nextOrder);
//                 }

//                 if (activeItemRef.current?.deck.order === allDecksCopy.firstPinnedDeckOrder) {
//                     console.log("first element moved")
//                 }
//             }
//         }
//         else {
//             if (over?.data?.current?.deck?.order === allDecksCopy.firstUnpinnedDeckOrder) {
//                 newOrder = generateJitteredKeyBetween(null, over?.data?.current?.deck?.order)
//                 if (newOrder) {
//                     deckOrderBounds.firstUnpinnedDeckOrder = newOrder
//                 }

//             }
//             else if (over?.data?.current?.deck?.order === allDecksCopy.lastUnpinnedDeckOrder) {
//                 newOrder = generateJitteredKeyBetween(over?.data?.current?.deck?.order, null)
//                 if (newOrder) {
//                     deckOrderBounds.lastUnpinnedDeckOrder = newOrder
//                 }


//             }
//             else {

//                 const decks = allDecksCopy.decks.filter(deck => !deck.pinned);
//                 const hoverIndex = decks.findIndex(deck => deck.order === over?.data?.current?.deck?.order);
//                 const draggedIndex = decks.findIndex(deck => deck.deckId === activeItemRef.current?.deck?.deckId);

//                 let prevOrder: string | null = null;
//                 let nextOrder: string | null = null;
//                 if (draggedIndex < hoverIndex) {
//                     // Moving down/forward
//                     prevOrder = decks[hoverIndex].order;
//                     nextOrder = hoverIndex + 1 < decks.length ? decks[hoverIndex + 1].order : null;
//                 } else {
//                     // Moving up/backward
//                     prevOrder = hoverIndex > 0 ? decks[hoverIndex - 1].order : null;
//                     nextOrder = decks[hoverIndex].order;
//                 }

//                 if (prevOrder !== null || nextOrder !== null) {
//                     newOrder = generateJitteredKeyBetween(prevOrder, nextOrder);
//                 }
//             }
//         }

//         if (newOrder && allDecksCopy && allDecksCopy.decks && deckOrderBounds) {
//             const updatedDecks = allDecksCopy.decks.map((deck) => {
//                 if (deck.deckId === activeItemRef?.current?.deck?.deckId) {
//                     console.log("match found", deck)
//                     deck.order = newOrder!
//                     return deck
//                 }
//                 else {
//                     return deck
//                 }
//             }).sort((a, b) => (a.order > b.order ? 1 : a.order < b.order ? -1 : 0));

//             if (updatedDecks) {
//                 setAllDecksState({
//                     decks: updatedDecks,
//                     ...deckOrderBounds
//                 });
//             }
//             let reindexNeeded = false
//             if (newOrder.length > 20) {
//                 reindexNeeded = true
//             }
//             reorderDeck({ deckId: activeItemRef.current?.deck?.deckId, newOrder, deckOrderBounds, reindexNeeded })
//         }


//     }

// }

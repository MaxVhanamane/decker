import { DragEndEvent } from "@dnd-kit/core";
import { useCallback, useContext, useRef } from "react";
import { BulbContext } from "../../../context/BulbContext";
import { DndCurrentDraggingCardContext, DndCurrentDraggingDeckContext, DndFilterContext, DndSettersContext } from "../../../context/DndItemContext";
import { CardType, DeckType } from "../../../types/types";
import useReorderCard from "../../../hooks/react-query/useReorderCard";
import useDeleteCard from "../../../hooks/react-query/useDeleteCard";
import useDeleteDeck from "../../../hooks/react-query/useDeleteDeck";
import { useQueryClient } from "@tanstack/react-query";
import { OfflineContext } from "../../../context/OfflineContext";
import { ShowToastContext } from "../../../context/ToastNotificationContext";
import useReorderDeck from "../../../hooks/react-query/useReorderDeck";
import { AudioContext } from "../../../context/AudioContext";
import useToastOnError from "../../../hooks/utility/useToastOnError";

const useDragHandlers = () => {
    const {
        setAllDecksState,
        setCurrentDraggingCard,
        setAllCardsState,
        setCurrentDraggingDeck,
        setIsDragStarted,
    } = useContext(DndSettersContext);
    const { bulbRef } = useContext(BulbContext);
    const { currentDraggingDeck } = useContext(DndCurrentDraggingDeckContext);
    const { currentDraggingCard } = useContext(DndCurrentDraggingCardContext);
    const { isOnline } = useContext(OfflineContext);
    const { showToast } = useContext(ShowToastContext);
    const { handlePlayAudio, isPlayingAudioAllowed } = useContext(AudioContext);
    const activeItemRef = useRef<Record<string, any> | undefined>();


    const { setDeckIdToFilterOnDragOverDeleteArea } =
        useContext(DndFilterContext);

    const { mutate: deleteCard } = useDeleteCard();
    const { mutate: deleteDeck } = useDeleteDeck();

    const queryClient = useQueryClient();
    const { mutate: reorderDeck } = useReorderDeck();
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
            setIsDragStarted(true);
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

            if (active.data?.current?.name === "card") {
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
        },
        [setCurrentDraggingDeck, setCurrentDraggingCard]
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
                    over?.id !== "CardDeleteArea" &&
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
        },
        [
            currentDraggingDeck,
            setCurrentDraggingDeck,
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

            // if (
            //   active.data.current?.deck?.pinned &&
            //   over?.data.current?.deck?.pinned === false
            // ) {
            //   let updatedDecks: DeckType[];
            //   const allDecks = queryClient.getQueryData<DeckType[]>(["decks"]);

            //   if (allDecks) {
            //     updatedDecks = allDecks?.map((item) => {
            //       if (item._id === active.data.current?.deck._id) {
            //         return { ...item, pinned: false };
            //       } else {
            //         return item;
            //       }
            //     });
            //     setAllDecksState(updatedDecks);
            //     queryClient.setQueryData(["decks"], updatedDecks);
            //   }
            // } else if (
            //   !active.data.current?.deck?.pinned &&
            //   over?.data.current?.deck?.pinned === true
            // ) {
            //   let updatedDecks: DeckType[];
            //   const allDecks = queryClient.getQueryData<DeckType[]>(["decks"]);

            //   if (allDecks) {
            //     updatedDecks = allDecks?.map((item) => {
            //       if (item._id === active.data.current?.deck._id) {
            //         return { ...item, pinned: true };
            //       } else {
            //         return item;
            //       }
            //     });
            //     setAllDecksState(updatedDecks);
            //     queryClient.setQueryData(["decks"], updatedDecks);
            //   }
            // }

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
                    over?.id === "CardDeleteArea" &&
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
        },
        [
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
            setIsDragStarted(false);
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
                    const allDecks = queryClient.getQueryData<DeckType[]>(["decks"]);
                    const currentIndex = allDecks?.findIndex(
                        (deck) => deck.deckId === active.id
                    );
                    const newIndex = allDecks?.findIndex(
                        (deck) => deck.deckId === over.id
                    );

                    if (
                        currentIndex !== undefined &&
                        newIndex !== undefined &&
                        allDecks
                    ) {
                        // reorderDeck({ oldIndex, newIndex });
                        const updatedDecks = [...allDecks];
                        // Step 1: Remove the item from the old index
                        const [movedItem] = updatedDecks.splice(currentIndex, 1);

                        // Step 2: Insert the item at the new index
                        updatedDecks.splice(newIndex, 0, movedItem);

                        setAllDecksState(updatedDecks);

                        reorderDeck({ currentIndex, newIndex });
                    }
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

                // If deck is dropped in same place then do nothing
                if (active.id === over.id) return;

                if (
                    activeItemRef.current?.index !== undefined &&
                    over?.data?.current?.index !== undefined
                ) {

                    const cards: CardType = queryClient.getQueryData<CardType>([
                        "cards",
                        activeItemRef.current?.deckId,
                    ]);
                    if (cards?.cards) {
                        // Create a new reference for `cards.cards`
                        const updatedCards = [...cards.cards];

                        // Remove the item from its old position
                        const [movedItem] = updatedCards.splice(
                            activeItemRef.current?.index,
                            1
                        );
                        // Insert the item at the new position
                        updatedCards.splice(over?.data?.current?.index, 0, movedItem);

                        // Update query data with the new reference
                        setAllCardsState({ ...cards, cards: updatedCards });
                        moveCard({
                            deckId: activeItemRef.current?.deckId,
                            currentIndex: activeItemRef.current?.index,
                            newIndex: over?.data?.current?.index,
                        });
                    }
                } else if (over?.id === "CardDeleteArea") {
                    const deletionIndex = activeItemRef.current?.index;
                    const deckId = activeItemRef.current?.deckId;
                    const cardInfo = {
                        note: activeItemRef.current?.card?.note,
                        cardId: activeItemRef.current?.card?.cardId,
                        createdAt: activeItemRef.current?.card?.createdAt,
                    };
                    setAllCardsState((prevCards) => {
                        if (!prevCards) return null;

                        return {
                            ...prevCards,
                            cards: [
                                ...prevCards.cards.slice(0, deletionIndex),
                                ...prevCards.cards.slice(deletionIndex + 1),
                            ],
                        };
                    });

                    deleteCard({ deckId, index: deletionIndex, cardInfo });
                }
            }
        },
        [
            setDeckIdToFilterOnDragOverDeleteArea,
            isPlayingAudioAllowed,
            handlePlayAudio,
            showToast,
            isOnline,
            reorderDeck,
            queryClient,
            bulbRef,
            location.pathname,
            currentDraggingCard,
        ]
    );

    const handleDragCancel = useCallback(() => {
        const colorName = bulbRef.current?.colorName;
        if (colorName) {
            bulbRef.current.removeBulbColor(colorName);
        }
    }, []);


    return {
        handleDragStart, handleDragMove, handleDragOver, handleOnDragEnd, handleDragCancel
    }
}

export default useDragHandlers

import { memo, useCallback, useContext, useState } from "react";
import type { DeckCardSearchResult, DeckSearchResult } from "../../types/types";
import { OfflineContext } from "../../context/OfflineContext";
import usePinDeck from "../../hooks/react-query/usePinDeck";
import { ThemeContext } from "../../context/ThemeContext";
import { ShowToastContext } from "../../context/ToastNotificationContext";
import DeckItem from "../deck/DeckItem";
import EditModalForDeck from "../deck/EditModalForDeck";
import SearchResultCardFullScreenView from "./SearchResultCardFullScreenView";
import { useModalBackNavigationHandler } from "../../hooks/utility/useModalBackNavigationHandler";
import { Descendant, Element, Text } from "slate";
import { extractTextFromSlateNodes } from "../../utils/editor/extractTextFromSlateNodes";

type ContentType = {
  note: Descendant[];
  cardId: string;
  createdAt: string;
};

type ContentForFullScreen = ContentType & {
  cardIndex: number | null;
  deckId: string;
};

type DeckAndCardResultProps = {
  foundDecks: DeckSearchResult[];
  foundCards: DeckCardSearchResult[];
  searchQuery: string;
  closeSearchBar: (deckId: string) => void;
  searchParams: {
    page: number;
    query: string;
  };
};

const DeckAndCardResult = ({
  foundDecks,
  foundCards,
  searchQuery,
  closeSearchBar,
  searchParams,
}: DeckAndCardResultProps) => {
  const { isOnline } = useContext(OfflineContext);
  const { showToast } = useContext(ShowToastContext);
  const { theme } = useContext(ThemeContext);
  const [editData, setEditData] = useState({ deckId: "", title: "" });
  const [
    animateCloseEditDeckModalInSearchResult,
    setAnimateCloseEditDeckModalInSearchResult,
  ] = useState(false);

  const { mutate: pinDeck } = usePinDeck();

  const [initialFullScreenCardData, setInitialFullScreenCardData] =
    useState<ContentForFullScreen>();
  const [openCardInFullScreen, setOpenCardInFullScreen] = useState(false);
  const [openEditDeckModal, setOpenEditDeckModal] = useState(false);

  useModalBackNavigationHandler({
    isOpen: openEditDeckModal,
    modalKey: "editDeckInSearchResults",
    closeModal: () => setAnimateCloseEditDeckModalInSearchResult(true),
  });

  const handleCardItemClick = useCallback((cardData: ContentForFullScreen) => {
    setInitialFullScreenCardData(cardData);
    setOpenCardInFullScreen(true);
  }, []);

  //   const regex = new RegExp((${searchQuery}), "gi");, "gi" are flags that modify the behavior of the regular expression.
  // The g flag stands for "global" and tells the regular expression to match all occurrences of the search query in the input text, not just the first one.
  // The i flag stands for "case-insensitive" and tells the regular expression to ignore the case of the search query when matching against the input text.

  const highlightText = useCallback(
    (text: string, searchQuery: string) => {
      // here we will escape special characters because they have some meaning in regular expression.
      // for eg. if you put "/" in search string ("react/") this will throw an error so we will escape "/" and then search it.
      const escapedSearchQuery = searchQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      // Create a regular expression to match the search query.
      const regex = new RegExp(`(${escapedSearchQuery})`, "gi");

      // Split the text using the regular expression and keep track of the first match.
      let isFirstMatch = false;
      const foundString = text
        .slice(0, 300)
        .split(regex)
        .map((part, index) => {
          // Check if the current part matches the search query.
          if (regex.test(part) && !isFirstMatch) {
            isFirstMatch = true;
            // Highlight the first occurrence.
            return (
              <span
                key={index}
                className={`${
                  theme === "dark" ? "bg-red-500" : "bg-yellow-300"
                }`}
              >
                {part}
              </span>
            );
          } else {
            return part;
          }
        });

      return <>{foundString}</>;
    },
    [theme]
  );

  const handlePin = useCallback(
    (deckId: string, pinned: boolean) => {
      pinDeck({ deckId, pinned: !pinned, searchParams });
    },
    [pinDeck, searchParams]
  );
  const handleEditDeck = useCallback(
    (deckId: string, title: string) => {
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
      setEditData({ ...editData, deckId, title });
      setOpenEditDeckModal(true);
    },
    [isOnline, showToast]
  );

  return (
    <div>
      {foundDecks?.filter((deck) => deck.pinned === true).length > 0 && (
        <div className="lg:mt-4 lg:mb-10 animate-quickOpacity lg:mx-24">
          <p className="text-left text-md font-semibold text-gray-800 dark:text-gray-50 m-4">
            Pinned Decks
          </p>
          <div className="w-full flex items-center justify-center ">
            <div className="flex flex-row flex-wrap gap-2  justify-center items-center py-2 lg:w-[60rem] transition-all duration-1000">
              {foundDecks
                ?.filter((deck) => deck.pinned === true)
                .map((deck) => {
                  return (
                    <DeckItem
                      key={deck.deckId}
                      deck={deck}
                      handleEditDeck={handleEditDeck}
                      handlePin={handlePin}
                      highlightedTitle={highlightText(deck.title, searchQuery)}
                      closeSearchBar={closeSearchBar}
                      searchParams={searchParams}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {foundDecks?.filter((deck) => deck.pinned === false).length > 0 && (
        <div
          className={`${
            foundDecks?.filter((deck) => deck.pinned === true).length > 0
              ? "mt-10"
              : "lg:mt-16 "
          }  lg:mb-10 animate-quickOpacity lg:mx-24`}
        >
          <p className="text-left text-md font-semibold text-gray-800 dark:text-gray-50 m-4">
            Other Decks
          </p>
          <div className="w-full flex items-center justify-center">
            <div className="flex flex-row flex-wrap gap-2  justify-center items-center py-2 lg:w-[60rem] transition-all duration-1000">
              {foundDecks
                ?.filter((deck) => deck.pinned === false)
                .map((deck) => {
                  return (
                    <DeckItem
                      key={deck.deckId}
                      deck={deck}
                      handleEditDeck={handleEditDeck}
                      handlePin={handlePin}
                      highlightedTitle={highlightText(deck.title, searchQuery)}
                      closeSearchBar={closeSearchBar}
                      searchParams={searchParams}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* CARD  */}

      {foundCards.length > 0 && (
        <div className="animate-quickOpacity mb-4 lg:mx-24">
          <p
            className={`text-left text-md font-semibold text-gray-800 dark:text-gray-50  m-4  ${
              foundDecks.length > 0 ? "mt-10" : "mt-[1.3rem] "
            }`}
          >
            Cards
          </p>
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-1 py-2  md:grid-cols-2 gap-4 items-center mx-2 justify-center w-full lg:w-[60rem] mb-10 ">
              {foundCards?.map((card) => (
                <div
                  onClick={() =>
                    handleCardItemClick({
                      deckId: card.deckId,
                      cardId: card.cardId,
                      cardIndex: card.cardIndex,
                      note: card.note,
                      createdAt: card.createdAt,
                    })
                  }
                  key={card.cardId}
                  className="border relative dark:border-slate-600 border-slate-400 flex flex-col text-gray-800 rounded-md px-2 py-2 h-[8.8rem]  text-justify  transition-[background-color,border-color] duration-300  dark:hover:bg-slate-900 dark:hover:border-blue-500 hover:border-sky-500 hover:bg-gray-100  group cursor-pointer"
                >
                  <p className="text-base text-gray-800 dark:text-gray-50 mb-1 p-1 line-clamp-1 break-words break-all">
                    {Element.isElement(card?.note?.[0]) &&
                    Text.isText(card.note[0].children?.[0]) &&
                    card.note[0].children[0].text.trim() !== "" ? (
                      highlightText(
                        card.note[0].children[0].text?.slice(0, 60),
                        searchQuery
                      )
                    ) : (
                      <span className="text-sm lg:text-base font-normal dark:text-gray-500 text-gray-400">
                        You have not added title to this card.
                      </span>
                    )}
                  </p>
                  <p className="text-sm  text-gray-700 dark:text-gray-100 font-light px-1 line-clamp-3 break-words break-all ">
                    {card.note ? (
                      highlightText(
                        extractTextFromSlateNodes(card.note),
                        searchQuery
                      )
                    ) : (
                      <span className=" dark:text-gray-500 text-gray-400">
                        You have not added a note to this card.
                      </span>
                    )}
                  </p>
                  <p className="absolute text-gray-50 bg-sky-700 group-hover:bg-sky-800   dark:bg-sky-800  dark:group-hover:bg-sky-700 transition duration-300 right-0 bottom-0 px-2 rounded-br-[0.340rem] rounded-tl-md line-clamp-1 break-all text-center  max-w-[10rem]">
                    {card.deckTitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {openEditDeckModal ? (
        <EditModalForDeck
          openEditDeckModal={openEditDeckModal}
          setOpenEditDeckModal={setOpenEditDeckModal}
          editData={editData}
          setEditData={setEditData}
          setAnimateCloseEditDeckModal={
            setAnimateCloseEditDeckModalInSearchResult
          }
          animateCloseEditDeckModal={animateCloseEditDeckModalInSearchResult}
          searchParams={searchParams}
        />
      ) : null}
      {openCardInFullScreen && (
        <SearchResultCardFullScreenView
          initialData={initialFullScreenCardData!}
          setOpenCardInFullScreen={setOpenCardInFullScreen}
          searchParams={searchParams}
        />
      )}
    </div>
  );
};

export default memo(DeckAndCardResult);

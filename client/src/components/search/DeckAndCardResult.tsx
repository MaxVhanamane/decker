import { memo, useCallback, useContext, useState } from "react";
import type { DeckCardSearchResult, DeckSearchResult } from "../../types/types";
import { ThemeContext } from "../../context/ThemeContext";
import SearchResultCardFullScreenView from "./SearchResultCardFullScreenView";
import { Descendant, Element, Text } from "slate";
import { extractTextFromSlateNodes } from "../../utils/editor/extractTextFromSlateNodes";
import { motion } from "motion/react";
import DeckItems from "./DeckItems";
type ContentType = {
  note: Descendant[];
  cardId: string;
  createdAt: string;
  order: number;
};

type ContentForFullScreen = ContentType & {
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
  const { theme } = useContext(ThemeContext);

  const [initialFullScreenCardData, setInitialFullScreenCardData] =
    useState<ContentForFullScreen>();
  const [openCardInFullScreen, setOpenCardInFullScreen] = useState(false);

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

  return (
    <div>
      <DeckItems
        closeSearchBar={closeSearchBar}
        foundDecks={foundDecks}
        searchParams={searchParams}
        searchQuery={searchQuery}
      />

      {/* CARD  */}

      {foundCards.length > 0 && (
        <div className="animate-quickOpacity mb-4 lg:mx-24">
          <p
            className={`text-left text-sm text-gray-700 dark:text-gray-200 m-4  ${
              foundDecks.length > 0 ? "mt-10" : "mt-[1.3rem] "
            }`}
          >
            Cards
          </p>
          <div className="flex items-center justify-center">
            <div className="grid  grid-cols-1 py-2  md:grid-cols-2 gap-4 items-center mx-2 justify-center w-full lg:w-[60rem] mb-10 ">
              {foundCards?.map((card) => (
                <motion.div
                  key={card.cardId}
                  layoutId={`search-card-${card.cardId}`}
                  transition={{
                    layout: {
                      type: "tween",
                      ease: [0.25, 0.1, 0.25, 1],
                      duration: 0.3,
                    },
                  }}
                >
                  <div
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCardItemClick({
                          deckId: card.deckId,
                          cardId: card.cardId,
                          order: card.order,
                          note: card.note,
                          createdAt: card.createdAt,
                        });
                      }
                    }}
                    onClick={() =>
                      handleCardItemClick({
                        deckId: card.deckId,
                        cardId: card.cardId,
                        order: card.order,
                        note: card.note,
                        createdAt: card.createdAt,
                      })
                    }
                    className="border relative dark:border-slate-600 border-slate-400 flex flex-col text-gray-800 rounded-md px-2 py-2 h-[8.8rem]  text-justify dark:hover:bg-slate-900 dark:hover:border-blue-500 hover:border-sky-500 hover:bg-gray-100  group cursor-pointer outline-none focus-visible:ring-2 dark:focus-visible:ring-blue-500 focus-visible:ring-gray-500"
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

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

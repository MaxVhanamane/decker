import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import { BiCodeCurly } from "react-icons/bi";
import { AiOutlineLink, AiOutlineBold } from "react-icons/ai";
import { BsTypeUnderline } from "react-icons/bs";
import { RxFontItalic, RxText } from "react-icons/rx";
import { Editor, BaseRange, Range } from "slate";
import { useEditorActions } from "./useEditorActions";
import { RiDoubleQuotesL } from "react-icons/ri";
import { type CommandItemType } from "../../types/textEditorTypes";
import { useListToolbarButtons } from "./useListToolbarButtons";
import { useColorToolbarButtons } from "./useColorToolbarButtons";
import { useHighlightColorButtons } from "./useHighlightColorButtons";
import { removeSlashCommandText } from "../../utils/editor/commandUtils";
import { CommandPaletteHighLightConfigType } from "../../types/types";
import { IoCodeSlashOutline } from "react-icons/io5";

export const useCommandPalette = (
  editor: Editor,
  expandEditorToMaxHeight: (() => void) | undefined
) => {
  const {
    handleBold,
    handleUnderline,
    handleCode,
    handleH1,
    handleH2,
    handleLink,
    handleList,
    handleHighlight,
    handleText,
    handleDivider,
    handleItalic,
    handleQuote,
    handleColorBar,
    handleInlineCode,
  } = useEditorActions();

  const [commandSearch, setCommandSearch] = useState("");
  const [commandPalettePosition, setCommandPalettePosition] =
    useState<BaseRange | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [isUsingArrowKeys, setIsUsingArrowKeys] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [isUsingMouse, setIsUsingMouse] = useState(true);
  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);
  // For tracking command changes that might affect positioning
  const lastCommandRef = useRef(commandSearch);
  const ListButtons = useListToolbarButtons({
    usage: "commandpalette",
    onClick: handleList,
  });
  const ColorBarButtons = useColorToolbarButtons({
    usage: "commandpalette",
    onClick: handleColorBar,
  });

  const [highLightConfig, setHighlightConfig] =
    useState<CommandPaletteHighLightConfigType>({
      selectedHighlightStyle: "plain",
      toggledHighlightColor: null,
    });

  const hightLightButtons = useHighlightColorButtons({
    onSelect: handleHighlight,
    selectedHighlightStyle: highLightConfig.selectedHighlightStyle,
    usage: "commandpalette",
    toggledHighlightColor: highLightConfig.toggledHighlightColor,
  });

  const hasSubmenu = useCallback((command: CommandItemType) => {
    return command.hasSubmenu === true;
  }, []);

  const commands: CommandItemType[] = useMemo(
    () => [
      {
        label: "Heading 1",
        icon: <LuHeading1 className="text-xl" />,
        category: "Turn into",
        onClickHandler: handleH1,
      },
      {
        label: "Heading 2",
        icon: <LuHeading2 className="text-xl" />,
        category: "Turn into",
        onClickHandler: handleH2,
      },
      {
        label: "Quote",
        icon: <RiDoubleQuotesL className="text-xl" />,
        category: "Turn into",
        onClickHandler: handleQuote,
      },
      {
        label: "Code block",
        icon: <BiCodeCurly className="text-xl" />,
        category: "Turn into",
        onClickHandler: handleCode,
      },
      {
        label: "Link",
        icon: <AiOutlineLink className="text-xl" />,
        category: "Turn into",
        onClickHandler: handleLink,
      },
      {
        label: "Text",
        icon: <RxText className="text-xl" />,
        category: "Turn into",
        onClickHandler: handleText,
      },

      {
        label: "Bold",
        icon: <AiOutlineBold className="text-xl" />,
        category: "Text style",
        onClickHandler: handleBold,
      },
      {
        label: "Italic",
        icon: <RxFontItalic className="text-xl" />,
        category: "Text style",
        onClickHandler: handleItalic,
      },

      {
        label: "Underline",
        icon: <BsTypeUnderline className="text-xl" />,
        category: "Text style",
        onClickHandler: handleUnderline,
      },
      {
        label: "Inline code",
        icon: <IoCodeSlashOutline className="text-xl" />,
        category: "Text style",
        onClickHandler: handleInlineCode,
      },

      ...ListButtons,
      ...ColorBarButtons,
      ...hightLightButtons,
      {
        label: "Plain",
        JSX: (
          <div className="w-10 ">
            <div className="w-full h-px dark:bg-slate-600/50 bg-slate-300/60" />
          </div>
        ),
        category: "Divider",
        onClickHandler: () => handleDivider("plain"),
      },
      {
        label: "Dashed",
        JSX: (
          <div className="w-10 ">
            <div className="w-full h-px bg-[repeating-linear-gradient(to_right,theme(colors.slate.300)_0px,theme(colors.slate.300)_8px,transparent_8px,transparent_16px)] dark:bg-[repeating-linear-gradient(to_right,theme(colors.slate.600)_0px,theme(colors.slate.600)_8px,transparent_8px,transparent_16px)]" />
          </div>
        ),
        category: "Divider",
        onClickHandler: () => handleDivider("dashed"),
      },
      {
        label: "Three Dot",
        JSX: (
          <div className="w-10 flex items-center justify-start gap-2 ">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="w-1 h-1 dark:bg-slate-400 bg-slate-500 rounded-full"
              />
            ))}
          </div>
        ),

        category: "Divider",
        onClickHandler: () => handleDivider("3-dots"),
      },
    ],
    [
      handleBold,
      handleUnderline,
      handleCode,
      handleH1,
      handleH2,
      handleLink,
      handleList,
      handleHighlight,
      handleText,
      handleDivider,
      hightLightButtons,
      ColorBarButtons,
      ListButtons,
    ]
  );

  const filteredCommands = useMemo(() => {
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(commandSearch.toLowerCase()) ||
        cmd.category.toLowerCase().includes(commandSearch.toLowerCase())
    );
  }, [commands, commandSearch]);

  // Handler for command search changes that will trigger position updates
  const handleCommandSearchChange = useCallback((newSearch: string) => {
    setCommandSearch(newSearch);

    // If the command changes, trigger a reposition event
    if (newSearch !== lastCommandRef.current) {
      lastCommandRef.current = newSearch;

      // Allow a moment for the DOM to update before repositioning
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("commandTextChanged"));
      }, 0);
    }
  }, []);

  const openCommandPalette = useCallback(() => {
    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const [start] = Range.edges(editor.selection);
      setCommandPalettePosition({ anchor: start, focus: start });
      setShowCommandPalette(true);
      setSelectedIndex(0);
      lastCommandRef.current = "";
    }
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandPalettePosition(null);
    setShowCommandPalette(false);
    setCommandSearch("");
    setSelectedIndex(0);
    setIsUsingArrowKeys(true);
    lastCommandRef.current = "";
  }, []);
  // Toggle submenu
  const toggleSubmenu = useCallback(
    (commandId: string) => {
      if (activeSubmenuId === commandId) {
        setActiveSubmenuId(null);
      } else {
        setActiveSubmenuId(commandId);
      }
    },
    [activeSubmenuId]
  );

  const runCommand = useCallback(
    (index: number) => {
      if (filteredCommands.length > 0) {
        const commandBtn = filteredCommands[index];

        if (hasSubmenu(commandBtn)) {
          if (activeSubmenuId === commandBtn.label) {
            toggleSubmenu("");
          } else {
            toggleSubmenu(commandBtn.label);
          }
        } else {
          removeSlashCommandText(editor);
          commandBtn.onClickHandler();
          closeCommandPalette();
        }
      }
    },
    [
      filteredCommands,
      closeCommandPalette,
      toggleSubmenu,
      activeSubmenuId,
      editor,
    ]
  );

  useEffect(() => {
    if (showCommandPalette && expandEditorToMaxHeight) {
      expandEditorToMaxHeight();
    }
  }, [showCommandPalette, expandEditorToMaxHeight]);

  return {
    showCommandPalette,
    commandPalettePosition,
    commandSearch,
    filteredCommands,
    selectedIndex,
    setSelectedIndex,
    setCommandSearch: handleCommandSearchChange,
    openCommandPalette,
    closeCommandPalette,
    runCommand,
    isUsingMouse,
    setIsUsingMouse,
    setIsUsingArrowKeys,
    isUsingArrowKeys,
    highLightConfig,
    setHighlightConfig,
    activeSubmenuId,
    hasSubmenu,
    toggleSubmenu,
    totalCommandCount: filteredCommands.length,
  };
};

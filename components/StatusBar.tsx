"use client";

import React from "react";
import { GitBranch, AlertCircle, CheckCircle2, Palette, Bell, Terminal } from "lucide-react";

interface StatusBarProps {
  activeFile: string | null;
  activeTheme: string;
  onThemeClick: () => void;
  terminalCollapsed: boolean;
  onToggleTerminal: () => void;
}

export default function StatusBar({
  activeFile,
  activeTheme,
  onThemeClick,
  terminalCollapsed,
  onToggleTerminal,
}: StatusBarProps) {
  const getLanguage = (fileName: string | null) => {
    if (!fileName) return "Plain Text";
    if (fileName.endsWith(".md")) return "Markdown";
    if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) return "TypeScript";
    if (fileName.endsWith(".json")) return "JSON";
    if (fileName.endsWith(".py")) return "Python";
    if (fileName.endsWith(".css")) return "CSS";
    return "Code";
  };

  const themeDisplayNames: Record<string, string> = {
    oled: "OLED Midnight",
    vscode: "VS Code Dark",
    tokyo: "Tokyo Night",
    catppuccin: "Catppuccin Mocha",
  };

  return (
    <footer className="h-6 bg-surface-0 border-t border-surface-2/60 text-text-tertiary text-[11px] font-mono flex items-center justify-between px-2 select-none z-20">
      {/* Left items */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Git branch */}
        <a
          href="https://github.com/alqavii"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-surface-2"
          title="Source Control: main branch"
        >
          <GitBranch size={12} className="text-blue" />
          <span>main</span>
        </a>

        {/* Sync/Status */}
        <div className="flex items-center gap-1 text-green">
          <CheckCircle2 size={12} />
          <span className="hidden sm:inline">Portfolio Online</span>
        </div>

        {/* Terminal toggle indicator */}
        <button
          onClick={onToggleTerminal}
          className="hidden sm:flex items-center gap-1 text-text-tertiary hover:text-text-primary px-1.5 py-0.5 rounded hover:bg-surface-2 transition-colors"
          title="Toggle Terminal (Ctrl+`)"
        >
          <Terminal size={12} className={terminalCollapsed ? "opacity-60" : "text-yellow"} />
          <span>Terminal {terminalCollapsed ? "Hidden" : "Open"}</span>
        </button>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-1 md:gap-3">
        {/* Line / Col stats */}
        <span className="hidden md:inline hover:text-text-secondary px-1.5 py-0.5 cursor-default">
          Ln 24, Col 12
        </span>

        {/* Encoding */}
        <span className="hidden sm:inline hover:text-text-secondary px-1.5 py-0.5 cursor-default">
          UTF-8
        </span>

        {/* Language */}
        <span className="hidden sm:inline hover:text-text-secondary px-1.5 py-0.5 cursor-default">
          {getLanguage(activeFile)}
        </span>

        {/* Theme Picker trigger */}
        <button
          onClick={onThemeClick}
          className="flex items-center gap-1 text-text-secondary hover:text-blue hover:bg-surface-2 px-2 py-0.5 rounded transition-colors"
          title="Change Color Theme"
        >
          <Palette size={12} className="text-mauve" />
          <span>{themeDisplayNames[activeTheme] || activeTheme}</span>
        </button>

        {/* Notification icon */}
        <button
          className="hover:text-text-primary px-1 py-0.5 transition-colors"
          title="Notifications"
        >
          <Bell size={12} />
        </button>
      </div>
    </footer>
  );
}

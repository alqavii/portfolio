"use client";

import React from "react";
import { GitBranch, CircleX, TriangleAlert } from "lucide-react";

interface StatusBarProps {
  activeFile: string | null;
  onToggleTerminal: () => void;
}

const item = "flex items-center gap-1 px-1.5 h-full hover:bg-statusbar-hover cursor-default";

export default function StatusBar({ activeFile, onToggleTerminal }: StatusBarProps) {
  const getLanguage = (fileName: string | null) => {
    if (!fileName) return null;
    if (fileName.endsWith(".md")) return "Markdown";
    if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) return "TypeScript";
    if (fileName.endsWith(".json")) return "JSON";
    if (fileName.endsWith(".py")) return "Python";
    if (fileName.startsWith("projects/")) return null;
    return "Plain Text";
  };

  const language = getLanguage(activeFile);

  return (
    <footer className="h-[22px] bg-statusbar text-statusbar-fg border-t border-border text-sm flex items-stretch justify-between px-1 select-none z-20">
      <div className="flex items-stretch">
        <a
          href="https://github.com/alqavii/portfolio"
          target="_blank"
          rel="noopener noreferrer"
          className={item.replace("cursor-default", "cursor-pointer")}
        >
          <GitBranch size={14} />
          <span>main</span>
        </a>
        <button onClick={onToggleTerminal} className={item.replace("cursor-default", "cursor-pointer")} title="Toggle Terminal">
          <CircleX size={14} />
          <span>0</span>
          <TriangleAlert size={14} className="ml-1" />
          <span>0</span>
        </button>
      </div>

      <div className="flex items-stretch">
        {language && (
          <>
            <span className={`${item} hidden sm:flex`}>UTF-8</span>
            <span className={`${item} hidden sm:flex`}>LF</span>
            <span className={item}>{language}</span>
          </>
        )}
      </div>
    </footer>
  );
}

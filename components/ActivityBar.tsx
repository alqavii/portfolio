"use client";

import React from "react";
import { 
  Folder, 
  Search, 
  GitBranch, 
  Play, 
  Box, 
  Settings, 
  Palette,
  Github
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onThemeClick?: () => void;
}

export default function ActivityBar({ 
  activeView, 
  onViewChange,
  onThemeClick 
}: ActivityBarProps) {
  const items = [
    { id: "explorer", icon: Folder, label: "Explorer (Files & Projects)" },
    { id: "search", icon: Search, label: "Search across Portfolio" },
    { id: "git", icon: GitBranch, label: "Source Control (GitHub Repos)" },
    { id: "debug", icon: Play, label: "Run & Debug (Project Launcher)" },
    { id: "extensions", icon: Box, label: "Skills & Tech Stack (Extensions)" },
  ];

  return (
    <div className="w-12 bg-surface-0 flex flex-col items-center py-2 border-r border-surface-2/60 h-full select-none z-20">
      {/* Top Activity Items */}
      <div className="flex flex-col items-center gap-1 w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(isActive ? "" : item.id)}
              className={cn(
                "w-full h-11 flex items-center justify-center relative transition-colors group",
                isActive
                  ? "text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-surface-1/40"
              )}
              title={item.label}
            >
              {/* VS Code active left bar */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-blue rounded-r" />
              )}
              <Icon size={20} className={cn(isActive && "text-blue")} />
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Bottom Activity Items */}
      <div className="flex flex-col items-center gap-1 w-full pb-1">
        {/* Theme Picker */}
        <button
          onClick={onThemeClick}
          className="w-full h-10 flex items-center justify-center text-text-tertiary hover:text-mauve hover:bg-surface-1/40 transition-colors"
          title="Change Color Theme"
        >
          <Palette size={18} />
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/alqavii"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-10 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-1/40 transition-colors"
          title="AlQavi's GitHub Profile"
        >
          <Github size={18} />
        </a>
      </div>
    </div>
  );
}

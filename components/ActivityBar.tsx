"use client";

import React from "react";
import { Files, Search, GitBranch, Settings, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onThemeClick?: () => void;
}

export default function ActivityBar({
  activeView,
  onViewChange,
  onThemeClick,
}: ActivityBarProps) {
  const items = [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
  ];

  return (
    <div className="w-12 bg-activitybar flex flex-col items-center border-r border-border h-full select-none z-20">
      <div className="flex flex-col items-center w-full">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(isActive ? "" : item.id)}
              className={cn(
                "w-full h-12 flex items-center justify-center relative",
                isActive
                  ? "text-text-primary"
                  : "text-text-tertiary hover:text-text-primary"
              )}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent" />
              )}
              <Icon size={22} strokeWidth={1.5} />
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className="flex flex-col items-center w-full">
        <a
          href="https://github.com/alqavii"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 flex items-center justify-center text-text-tertiary hover:text-text-primary"
          title="GitHub"
        >
          <Github size={22} strokeWidth={1.5} />
        </a>
        <button
          onClick={onThemeClick}
          className="w-full h-12 flex items-center justify-center text-text-tertiary hover:text-text-primary"
          title="Color Theme"
        >
          <Settings size={22} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

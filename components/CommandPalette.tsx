"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import { THEMES } from "@/lib/themes";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFile: (file: string) => void;
  onSetTheme: (theme: string) => void;
  onToggleTerminal: () => void;
  onNewFile: () => void;
}

interface PaletteItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  action: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenFile,
  onSetTheme,
  onToggleTerminal,
  onNewFile,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const run = (fn: () => void) => () => {
    onClose();
    fn();
  };

  const allItems: PaletteItem[] = [
    { id: "alqavi", title: "alqavi.md", icon: FileText, action: run(() => onOpenFile("alqavi.md")) },
    ...projectsData.flatMap((p) => [
      {
        id: `readme-${p.id}`,
        title: "README.md",
        description: `projects/${p.id}`,
        icon: FileText,
        action: run(() => onOpenFile(`projects/${p.id}/README.md`)),
      },
      {
        id: `preview-${p.id}`,
        title: `Preview ${p.name}`,
        description: p.description,
        icon: Globe,
        action: run(() => onOpenFile(`projects/${p.id}/${p.name}`)),
      },
    ]),
    { id: "terminal", title: "View: Toggle Terminal", action: run(onToggleTerminal) },
    { id: "new-file", title: "File: New File", action: run(onNewFile) },
    ...THEMES.map((t) => ({
      id: `theme-${t.id}`,
      title: `Preferences: Color Theme: ${t.name}`,
      action: run(() => onSetTheme(t.id)),
    })),
  ];

  const q = query.toLowerCase().trim();
  const filteredItems = q
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      )
    : allItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev <= 0 ? filteredItems.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filteredItems[selectedIndex]?.action();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[36px] px-4" onClick={onClose}>
      <div
        className="w-full max-w-[600px] bg-surface-0 border border-border-strong rounded-md shadow-[0_0_8px_2px_rgba(0,0,0,0.36)] overflow-hidden text-base text-text-primary"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-1.5">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search files and commands"
            className="w-full bg-input border border-accent rounded-sm px-1.5 py-[3px] outline-none text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        <div className="max-h-[440px] overflow-y-auto pb-1.5 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="px-3 py-1 text-text-secondary">No matching results</div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex items-center gap-1.5 h-[22px] mx-1.5 px-1.5 rounded-sm cursor-pointer",
                    isSelected ? "bg-[#04395e] text-white" : "text-text-primary"
                  )}
                >
                  {Icon && <Icon size={14} className="flex-shrink-0 opacity-80" />}
                  <span className="truncate">{item.title}</span>
                  {item.description && (
                    <span className={cn("truncate text-sm", isSelected ? "text-white/70" : "text-text-secondary")}>
                      {item.description}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

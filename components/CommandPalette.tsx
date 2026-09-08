"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  FileText, 
  Activity, 
  Terminal, 
  Palette, 
  Github, 
  X, 
  ExternalLink,
  Code2,
  FolderOpen
} from "lucide-react";
import projectsData from "@/data/projects.json";

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
  category: "Files" | "Projects" | "Themes" | "Actions";
  title: string;
  description?: string;
  icon: React.ElementType;
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
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allItems: PaletteItem[] = [
    // Files
    {
      id: "file-alqavi",
      category: "Files",
      title: "alqavi.md",
      description: "About AlQavi Hasan • Bio, Trading Society Leadership, Quant Research",
      icon: FileText,
      action: () => {
        onOpenFile("alqavi.md");
        onClose();
      },
    },
    {
      id: "file-petral",
      category: "Files",
      title: "petral.md",
      description: "Petral Crude Oil Trading Desk Dashboard (petral.xyz) Documentation",
      icon: Activity,
      action: () => {
        onOpenFile("projects/petral/README.md");
        onClose();
      },
    },
    {
      id: "file-contact",
      category: "Files",
      title: "contact.md",
      description: "Contact Information • Email, LinkedIn, GitHub",
      icon: FileText,
      action: () => {
        onOpenFile("contact.md");
        onClose();
      },
    },
    // Projects
    ...projectsData.map((project) => ({
      id: `proj-${project.id}`,
      category: "Projects" as const,
      title: project.displayName || project.name,
      description: project.description,
      icon: project.id === "petral" ? Activity : Code2,
      action: () => {
        onOpenFile(`projects/${project.id}/README.md`);
        onClose();
      },
    })),
    // Actions
    {
      id: "action-terminal",
      category: "Actions",
      title: "Toggle Mock Terminal",
      description: "Open/close the interactive command terminal",
      icon: Terminal,
      action: () => {
        onToggleTerminal();
        onClose();
      },
    },
    {
      id: "action-new-file",
      category: "Actions",
      title: "Create New File",
      description: "Create a scratch pad file in the workspace",
      icon: FolderOpen,
      action: () => {
        onClose();
        onNewFile();
      },
    },
    {
      id: "action-github",
      category: "Actions",
      title: "View GitHub Profile",
      description: "https://github.com/alqavii",
      icon: Github,
      action: () => {
        window.open("https://github.com/alqavii", "_blank");
        onClose();
      },
    },
    // Themes
    {
      id: "theme-oled",
      category: "Themes",
      title: "Theme: OLED Midnight Dark (Default)",
      description: "Ultra-deep pitch-black, high-contrast neon accents",
      icon: Palette,
      action: () => {
        onSetTheme("oled");
        onClose();
      },
    },
    {
      id: "theme-vscode",
      category: "Themes",
      title: "Theme: VS Code Dark Modern",
      description: "Classic Microsoft Visual Studio Code dark aesthetic",
      icon: Palette,
      action: () => {
        onSetTheme("vscode");
        onClose();
      },
    },
    {
      id: "theme-tokyo",
      category: "Themes",
      title: "Theme: Tokyo Night",
      description: "Deep indigo and cyber purple aesthetic",
      icon: Palette,
      action: () => {
        onSetTheme("tokyo");
        onClose();
      },
    },
    {
      id: "theme-catppuccin",
      category: "Themes",
      title: "Theme: Catppuccin Mocha",
      description: "Warm soothing purple-slate palette",
      icon: Palette,
      action: () => {
        onSetTheme("catppuccin");
        onClose();
      },
    },
  ];

  const filteredItems = allItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? filteredItems.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface-0 border border-surface-3 rounded-xl shadow-2xl overflow-hidden font-mono text-text-primary"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3 border-b border-surface-2 gap-3 bg-surface-1">
          <Search size={18} className="text-blue flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search projects, or jump to file..."
            className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder:text-text-tertiary"
          />
          <button
            onClick={onClose}
            className="p-1 text-text-tertiary hover:text-text-primary rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-tertiary">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs ${
                    isSelected ? "bg-surface-2 text-text-primary" : "text-text-secondary hover:bg-surface-1"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon size={16} className={isSelected ? "text-blue" : "text-text-tertiary"} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-primary truncate">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-text-tertiary truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-3/50 text-text-tertiary ml-2 flex-shrink-0">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-surface-2 bg-surface-1/50 text-[11px] text-text-tertiary">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>ESC to close</span>
          </div>
          <span className="text-blue">AlQavi Portfolio Workstation</span>
        </div>
      </div>
    </div>
  );
}

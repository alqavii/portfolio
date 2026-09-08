"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Menu, 
  X, 
  Search, 
  Palette, 
  Terminal, 
  Folder, 
  Github, 
  Command,
  Sparkles,
  Layers,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label?: string;
  action?: () => void;
  shortcut?: string;
  divider?: boolean;
}

interface MenuBarProps {
  onNewFile?: () => void;
  onOpenFile?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onAppearance?: () => void;
  onToggleTerminal?: () => void;
  onToggleExplorer?: () => void;
  onOpenCommandPalette?: () => void;
  onSetTheme?: (theme: string) => void;
  activeTheme?: string;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export default function MenuBar({
  onNewFile,
  onOpenFile,
  onSave,
  onSaveAs,
  onAppearance,
  onToggleTerminal,
  onToggleExplorer,
  onOpenCommandPalette = () => {},
  onSetTheme,
  activeTheme = "oled",
  mobileMenuOpen = false,
  onToggleMobileMenu,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const divider = (): MenuItem => ({ divider: true });

  const themes = [
    { id: "oled", name: "OLED Midnight Dark (Default)", desc: "Pitch-black obsidian, neon glow" },
    { id: "vscode", name: "VS Code Dark Modern", desc: "Classic IDE dark theme" },
    { id: "tokyo", name: "Tokyo Night", desc: "Cyberpunk indigo and violet" },
    { id: "catppuccin", name: "Catppuccin Mocha", desc: "Warm soothing purple-slate" },
  ];

  const menus: { label: string; items: MenuItem[] }[] = [
    {
      label: "File",
      items: [
        { label: "New File", shortcut: "Ctrl+N", action: onNewFile },
        divider(),
        { label: "Open File...", shortcut: "Ctrl+O", action: onOpenFile },
        { label: "Save File", shortcut: "Ctrl+S", action: onSave },
        { label: "Save As...", shortcut: "Ctrl+Shift+S", action: onSaveAs },
        divider(),
        { label: "Command Palette...", shortcut: "Ctrl+K", action: onOpenCommandPalette },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "Ctrl+Z" },
        { label: "Redo", shortcut: "Ctrl+Y" },
        divider(),
        { label: "Find in Files", shortcut: "Ctrl+F", action: onOpenCommandPalette },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Command Palette...", shortcut: "Ctrl+K", action: onOpenCommandPalette },
        divider(),
        { label: "Explorer", shortcut: "Ctrl+Shift+E", action: onToggleExplorer },
        { label: "Toggle Terminal", shortcut: "Ctrl+`", action: onToggleTerminal },
        divider(),
        { label: "Themes & Appearance", action: onAppearance },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "About AlQavi", action: () => onOpenCommandPalette() },
        { label: "GitHub Profile", action: () => window.open("https://github.com/alqavii", "_blank") },
      ],
    },
  ];

  return (
    <div className="h-9 bg-surface-0 border-b border-border flex items-center justify-between px-3 select-none text-xs font-mono z-30">
      {/* Left: VS Code Menu Items */}
      <div ref={menuRef} className="flex items-center gap-1">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1 text-text-tertiary hover:text-text-primary rounded"
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Project Branding Icon */}
        <div className="hidden sm:flex items-center gap-2 mr-2 text-blue font-bold tracking-wider">
          <div className="w-2.5 h-2.5 rounded-full bg-blue animate-pulse-subtle" />
          <span className="text-text-primary">ALQAVI</span>
        </div>

        {/* Menu Bar dropdowns */}
        <div className="hidden md:flex items-center">
          {menus.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
                onMouseEnter={() => {
                  if (activeMenu) setActiveMenu(menu.label);
                }}
                className={cn(
                  "px-2.5 py-1 rounded transition-colors text-text-secondary hover:text-text-primary",
                  activeMenu === menu.label && "bg-surface-2 text-text-primary"
                )}
              >
                {menu.label}
              </button>

              {/* Dropdown menu */}
              {activeMenu === menu.label && (
                <div className="absolute left-0 top-full mt-1 min-w-[200px] bg-surface-1 border border-border rounded shadow-xl py-1 z-50 text-xs">
                  {menu.items.map((item, idx) => {
                    if (item.divider) {
                      return <div key={idx} className="my-1 border-t border-border" />;
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveMenu(null);
                          item.action?.();
                        }}
                        className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-[10px] text-text-tertiary ml-4">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center: Interactive Omnibar / Command Trigger */}
      <div className="flex-1 max-w-md mx-2 md:mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1 rounded-md bg-surface-1 hover:bg-surface-2/60 border border-border hover:border-blue/40 text-text-tertiary hover:text-text-secondary transition-all group"
          title="Search files, projects & commands (Ctrl+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search size={13} className="text-text-tertiary group-hover:text-blue transition-colors" />
            <span className="text-xs truncate">alqavi-portfolio — Search files & projects...</span>
          </div>
          <kbd className="hidden sm:inline px-1.5 py-0.2 rounded bg-surface-2 text-[10px] border border-border text-text-secondary">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Quick actions & Theme Selector */}
      <div className="flex items-center gap-2">
        {/* Theme switcher dropdown */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-1 hover:bg-surface-2 text-text-secondary hover:text-text-primary border border-border transition-colors text-xs"
            title="Change Theme"
          >
            <Palette size={13} className="text-mauve" />
            <span className="hidden lg:inline capitalize">{activeTheme}</span>
            <ChevronDown size={11} className="text-text-tertiary" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-surface-1 border border-border rounded shadow-xl p-1.5 z-50 text-xs">
              <span className="text-[10px] uppercase font-bold text-text-tertiary px-2 py-1 block">
                Select Theme
              </span>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSetTheme?.(t.id);
                    setThemeDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded text-left transition-colors flex flex-col mt-0.5",
                    activeTheme === t.id
                      ? "bg-surface-3 text-blue font-bold"
                      : "hover:bg-surface-2 text-text-secondary hover:text-text-primary"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{t.name}</span>
                    {activeTheme === t.id && <span className="text-[10px] text-blue">✓ Active</span>}
                  </div>
                  <span className="text-[10px] text-text-tertiary font-normal mt-0.5">
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/alqavii"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-text-tertiary hover:text-text-primary rounded hover:bg-surface-1 transition-colors"
          title="GitHub"
        >
          <Github size={15} />
        </a>
      </div>
    </div>
  );
}

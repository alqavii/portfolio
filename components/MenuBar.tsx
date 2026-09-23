"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
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
  mobileMenuOpen = false,
  onToggleMobileMenu,
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const divider: MenuItem = { divider: true };

  const menus: { label: string; items: MenuItem[] }[] = [
    {
      label: "File",
      items: [
        { label: "New File", shortcut: "Ctrl+N", action: onNewFile },
        { label: "Open File...", shortcut: "Ctrl+O", action: onOpenFile },
        divider,
        { label: "Save", shortcut: "Ctrl+S", action: onSave },
        { label: "Save As...", shortcut: "Ctrl+Shift+S", action: onSaveAs },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "Ctrl+Z" },
        { label: "Redo", shortcut: "Ctrl+Y" },
        divider,
        { label: "Find", shortcut: "Ctrl+F", action: onOpenCommandPalette },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Command Palette...", shortcut: "Ctrl+K", action: onOpenCommandPalette },
        divider,
        { label: "Explorer", shortcut: "Ctrl+Shift+E", action: onToggleExplorer },
        { label: "Terminal", shortcut: "Ctrl+`", action: onToggleTerminal },
        divider,
        { label: "Color Theme", action: onAppearance },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "GitHub", action: () => window.open("https://github.com/alqavii", "_blank") },
      ],
    },
  ];

  return (
    <div className="h-[35px] bg-titlebar border-b border-border flex items-center px-2 select-none text-base z-30 relative">
      <div ref={menuRef} className="flex items-center">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1 text-text-secondary hover:text-text-primary rounded"
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <div className="hidden md:flex items-center">
          {menus.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
                onMouseEnter={() => {
                  if (activeMenu) setActiveMenu(menu.label);
                }}
                className={cn(
                  "px-2 py-0.5 rounded-[5px] text-text-primary hover:bg-white/10",
                  activeMenu === menu.label && "bg-white/10"
                )}
              >
                {menu.label}
              </button>

              {activeMenu === menu.label && (
                <div className="absolute left-0 top-full mt-0.5 min-w-[220px] bg-surface-0 border border-border-strong rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.36)] py-1 z-50">
                  {menu.items.map((item, idx) => {
                    if (item.divider) {
                      return <div key={idx} className="my-1 mx-2 border-t border-border-strong" />;
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveMenu(null);
                          item.action?.();
                        }}
                        className="w-[calc(100%-8px)] mx-1 px-3 py-[3px] flex items-center justify-between text-left rounded text-text-primary hover:bg-accent hover:text-white"
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-sm opacity-70 ml-6">{item.shortcut}</span>
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

      {/* Command center */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[min(38vw,480px)] hidden sm:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full h-[22px] flex items-center justify-center gap-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] border border-border-strong text-text-secondary"
          title="Search files and commands (Ctrl+K)"
        >
          <Search size={13} />
          <span className="text-sm">alqavi</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuItem = 
  | { label: string; action?: () => void; submenu?: MenuItem[]; shortcut?: string; divider?: false }
  | { divider: true };

interface MenuBarProps {
  onNewFile?: () => void;
  onOpenFile?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onAppearance?: () => void;
  onToggleTerminal?: () => void;
  onToggleExplorer?: () => void;
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

    if (activeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenu]);

  const divider = (): MenuItem => ({ divider: true });

  const menus: { label: string; items: MenuItem[] }[] = [
    {
      label: "File",
      items: [
        { label: "New File", shortcut: "Ctrl+N", action: onNewFile },
        { label: "New Window", shortcut: "Ctrl+Shift+N" },
        divider(),
        { label: "Open File...", shortcut: "Ctrl+O", action: onOpenFile },
        { label: "Open Folder...", shortcut: "Ctrl+K Ctrl+O" },
        divider(),
        { label: "Save", shortcut: "Ctrl+S", action: onSave },
        { label: "Save As...", shortcut: "Ctrl+Shift+S", action: onSaveAs },
        divider(),
        { label: "Exit" },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "Ctrl+Z" },
        { label: "Redo", shortcut: "Ctrl+Y" },
        divider(),
        { label: "Cut", shortcut: "Ctrl+X" },
        { label: "Copy", shortcut: "Ctrl+C" },
        { label: "Paste", shortcut: "Ctrl+V" },
        divider(),
        { label: "Find", shortcut: "Ctrl+F" },
        { label: "Replace", shortcut: "Ctrl+H" },
      ],
    },
    {
      label: "Selection",
      items: [
        { label: "Select All", shortcut: "Ctrl+A" },
        { label: "Expand Selection", shortcut: "Shift+Alt+Right" },
        { label: "Shrink Selection", shortcut: "Shift+Alt+Left" },
        divider(),
        { label: "Copy Line Up", shortcut: "Shift+Alt+Up" },
        { label: "Copy Line Down", shortcut: "Shift+Alt+Down" },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Command Palette...", shortcut: "Ctrl+Shift+P" },
        divider(),
        { label: "Explorer", shortcut: "Ctrl+Shift+E", action: onToggleExplorer },
        { label: "Search", shortcut: "Ctrl+Shift+F" },
        { label: "Source Control", shortcut: "Ctrl+Shift+G" },
        divider(),
        { label: "Terminal", shortcut: "Ctrl+`", action: onToggleTerminal },
        divider(),
        { label: "Appearance", action: onAppearance },
        { label: "Editor Layout" },
      ],
    },
    {
      label: "Go",
      items: [
        { label: "Back", shortcut: "Alt+Left" },
        { label: "Forward", shortcut: "Alt+Right" },
        divider(),
        { label: "Go to File...", shortcut: "Ctrl+P" },
        { label: "Go to Symbol...", shortcut: "Ctrl+Shift+O" },
        { label: "Go to Line/Column...", shortcut: "Ctrl+G" },
      ],
    },
    {
      label: "Run",
      items: [
        { label: "Start Debugging", shortcut: "F5" },
        { label: "Run Without Debugging", shortcut: "Ctrl+F5" },
        divider(),
        { label: "Stop", shortcut: "Shift+F5" },
        divider(),
        { label: "Step Over", shortcut: "F10" },
        { label: "Step Into", shortcut: "F11" },
        { label: "Step Out", shortcut: "Shift+F11" },
      ],
    },
    {
      label: "Terminal",
      items: [
        { label: "New Terminal", shortcut: "Ctrl+Shift+`" },
        { label: "Split Terminal" },
        divider(),
        { label: "Run Task..." },
        { label: "Run Build Task...", shortcut: "Ctrl+Shift+B" },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "Welcome" },
        { label: "Documentation" },
        divider(),
        { label: "Keyboard Shortcuts Reference" },
        divider(),
        { label: "About" },
      ],
    },
  ];

  const handleMenuClick = (label: string) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  return (
    <>
      <div ref={menuRef} className="h-6 bg-surface-0 border-b border-surface-2/50 flex items-center text-xs text-text-secondary select-none">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden px-3 h-6 flex items-center hover:bg-surface-1 transition-colors"
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Desktop Menus */}
        <div className="hidden md:flex">
          {menus.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                onClick={() => handleMenuClick(menu.label)}
                className={cn(
                  "px-3 h-6 flex items-center hover:bg-surface-1 transition-colors",
                  activeMenu === menu.label && "bg-surface-1"
                )}
              >
                {menu.label}
              </button>
              {activeMenu === menu.label && (
                <div className="absolute top-6 left-0 bg-surface-1 border border-surface-2 shadow-lg z-50 min-w-[200px] py-1">
                  {menu.items.map((item, index) => {
                    if (item.divider) {
                      return (
                        <div
                          key={`divider-${index}`}
                          className="h-px bg-surface-2 my-1 mx-1"
                        />
                      );
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setActiveMenu(null);
                          item.action?.();
                        }}
                        className="w-full px-3 py-1.5 text-left hover:bg-blue/20 flex items-center justify-between text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-xs text-text-tertiary ml-4">
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

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-6 left-0 right-0 bg-surface-1 border-b border-surface-2 shadow-lg z-50 max-h-[calc(100vh-24px)] overflow-y-auto">
            {menus.map((menu) => (
              <div key={menu.label}>
                <div className="px-4 py-2 text-sm font-semibold text-text-primary border-b border-surface-2">
                  {menu.label}
                </div>
                {menu.items.map((item, index) => {
                  if (item.divider) {
                    return (
                      <div
                        key={`divider-${index}`}
                        className="h-px bg-surface-2 my-1 mx-4"
                      />
                    );
                  }
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setActiveMenu(null);
                        onToggleMobileMenu?.();
                        item.action?.();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-blue/20 flex items-center justify-between text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs text-text-tertiary ml-4">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        <div className="flex-1" />
        <div className="px-3 text-text-tertiary text-xs hidden md:block">
          Portfolio
        </div>
      </div>
    </>
  );
}


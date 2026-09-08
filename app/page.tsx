"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Folder, Command } from "lucide-react";
import ActivityBar from "@/components/ActivityBar";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Terminal from "@/components/Terminal";
import MenuBar from "@/components/MenuBar";
import StatusBar from "@/components/StatusBar";
import CommandPalette from "@/components/CommandPalette";
import { FileSystem, FileSystemFile } from "@/lib/fileSystem";

export default function Home() {
  const [activeView, setActiveView] = useState("explorer");
  const [openFiles, setOpenFiles] = useState<string[]>([
    "alqavi.md",
    "projects/petral/README.md"
  ]);
  const [activeFile, setActiveFile] = useState<string | null>("alqavi.md");
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(240);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [fileSystem] = useState(() => new FileSystem());
  const [customFiles, setCustomFiles] = useState<FileSystemFile[]>([]);
  const [editorMode, setEditorMode] = useState<"view" | "edit">("view");
  const [editedContent, setEditedContent] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("oled");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load saved theme from localStorage if available
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("alqavi_portfolio_theme");
      if (savedTheme) {
        setActiveTheme(savedTheme);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSetTheme = (theme: string) => {
    setActiveTheme(theme);
    try {
      localStorage.setItem("alqavi_portfolio_theme", theme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleFileClick = useCallback((file: string) => {
    setActiveFile(file);
    setOpenFiles((prev) => (prev.includes(file) ? prev : [...prev, file]));
  }, []);

  const handleProjectClick = (fileId: string) => {
    handleFileClick(fileId);
  };

  const handleFileClose = (file: string) => {
    const newOpenFiles = openFiles.filter((f) => f !== file);
    setOpenFiles(newOpenFiles);
    if (activeFile === file) {
      setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
    }
  };

  const handleFileSelect = (file: string) => {
    setActiveFile(file);
  };

  const handleNewFile = useCallback(() => {
    const fileName = prompt("Enter file name (e.g., notes.md or strategy.py):");
    if (fileName && fileName.trim()) {
      const file = fileSystem.createFile(fileName.trim());
      setCustomFiles((prev) => [...prev, file]);
      handleFileClick(file.id);
      setEditorMode("edit");
      setEditedContent(file.content);
    }
  }, [fileSystem, handleFileClick]);

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const fsFile = fileSystem.createFile(file.name, content);
        setCustomFiles((prev) => [...prev, fsFile]);
        handleFileClick(fsFile.id);
        setEditorMode("edit");
        setEditedContent(content);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = useCallback(() => {
    if (!activeFile) return;
    
    const fsFile = fileSystem.getFile(activeFile);
    if (fsFile) {
      fileSystem.updateFile(activeFile, editedContent);
      setCustomFiles((prev) =>
        prev.map((f) => (f.id === activeFile ? fileSystem.getFile(activeFile)! : f))
      );
      alert("File saved!");
    } else if (activeFile === "alqavi.md") {
      downloadFile("alqavi.md", editedContent || "");
    } else if (activeFile === "contact.md") {
      downloadFile("contact.md", editedContent || "");
    }
  }, [activeFile, editedContent, fileSystem]);

  const handleSaveAs = () => {
    if (!activeFile) return;
    const fileName = prompt("Enter file name:");
    if (fileName && fileName.trim()) {
      const content = editedContent || "";
      downloadFile(fileName.trim(), content);
    }
  };

  const handleToggleEditMode = () => {
    if (editorMode === "view") {
      setEditorMode("edit");
      if (!activeFile) {
        setEditedContent("");
        return;
      }

      const fsFile = fileSystem.getFile(activeFile);
      if (fsFile) {
        setEditedContent(fsFile.content);
        return;
      }

      if (activeFile === "alqavi.md") {
        fetch("/api/alqavi")
          .then((res) => res.json())
          .then((data) => setEditedContent(data.content))
          .catch(() => setEditedContent(""));
        return;
      }

      if (activeFile === "contact.md") {
        fetch("/api/contact")
          .then((res) => res.json())
          .then((data) => setEditedContent(data.content))
          .catch(() => setEditedContent(""));
        return;
      }

      if (activeFile.includes("petral")) {
        fetch("/api/petral")
          .then((res) => res.json())
          .then((data) => setEditedContent(data.content))
          .catch(() => setEditedContent(""));
        return;
      }

      setEditedContent("");
    } else {
      setEditorMode("view");
      setEditedContent("");
    }
  };

  // Reset edit mode when switching files
  useEffect(() => {
    if (editorMode === "edit") {
      setEditorMode("view");
      setEditedContent("");
    }
  }, [activeFile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Ctrl+P for Command Palette
      if (e.ctrlKey && (e.key === "k" || e.key === "p")) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      // Ctrl+` for Terminal toggle
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setTerminalCollapsed((prev) => !prev);
      }
      // Ctrl+S to save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+N for new file
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        handleNewFile();
      }
      // Ctrl+O to open file
      if (e.ctrlKey && e.key === "o") {
        e.preventDefault();
        handleOpenFile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleNewFile]);

  return (
    <div 
      data-theme={activeTheme}
      className="h-screen w-screen flex flex-col overflow-hidden bg-base text-text-primary font-mono select-none"
    >
      {/* Menu Bar */}
      <MenuBar
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onAppearance={() => setCommandPaletteOpen(true)}
        onToggleTerminal={() => setTerminalCollapsed(!terminalCollapsed)}
        onToggleExplorer={() => {
          setActiveView(activeView ? "" : "explorer");
          setMobileSidebarOpen(!mobileSidebarOpen);
        }}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onSetTheme={handleSetTheme}
        activeTheme={activeTheme}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept=".txt,.md,.js,.ts,.tsx,.jsx,.json,.css,.html,.py"
      />

      {/* Main Workstation Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Activity Bar - Desktop only */}
        <div className="hidden md:block h-full flex-shrink-0">
          <ActivityBar 
            activeView={activeView} 
            onViewChange={setActiveView}
            onThemeClick={() => setCommandPaletteOpen(true)}
          />
        </div>
        
        {/* Sidebar Panel */}
        {activeView && (
          <div
            ref={sidebarRef}
            className={`
              fixed md:static inset-y-0 md:inset-y-auto left-0 z-50 md:z-auto
              transform transition-transform duration-300 ease-in-out
              ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0
              bg-surface-0
              md:h-full
              flex-shrink-0
            `}
            style={{ width: isMobile ? "280px" : `${sidebarWidth}px` }}
          >
            <Sidebar
              activeView={activeView}
              openFiles={openFiles}
              activeFile={activeFile}
              onFileClick={(file) => {
                handleFileClick(file);
                setMobileSidebarOpen(false);
              }}
              onProjectClick={(fileId) => {
                handleProjectClick(fileId);
                setMobileSidebarOpen(false);
              }}
              customFiles={customFiles}
              onDeleteFile={(id) => {
                fileSystem.deleteFile(id);
                setCustomFiles((prev) => prev.filter((f) => f.id !== id));
                if (activeFile === id) {
                  const newOpenFiles = openFiles.filter((f) => f !== id);
                  setOpenFiles(newOpenFiles);
                  setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
                }
              }}
              onNewFile={handleNewFile}
            />
          </div>
        )}

        {/* Desktop Sidebar Resizer */}
        {activeView && (
          <div
            className="hidden md:block w-[1px] cursor-col-resize hover:bg-blue/60 transition-colors flex-shrink-0 bg-border"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = sidebarWidth;

              const handleMouseMove = (e: MouseEvent) => {
                const diff = e.clientX - startX;
                const newWidth = Math.max(160, Math.min(480, startWidth + diff));
                if (sidebarRef.current) {
                  sidebarRef.current.style.width = `${newWidth}px`;
                }
                setSidebarWidth(newWidth);
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
          />
        )}

        {/* Mobile Explorer Toggle Floating Pill */}
        <button
          onClick={() => {
            setActiveView("explorer");
            setMobileSidebarOpen(true);
          }}
          className="md:hidden fixed bottom-10 right-4 z-30 bg-blue text-base px-3.5 py-2 rounded-full shadow-2xl hover:bg-blue-light transition-all flex items-center gap-2 text-xs font-bold font-mono"
        >
          <Folder size={16} />
          <span>Files</span>
        </button>

        {/* Center/Right Area: Editor & Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Editor
            openFiles={openFiles}
            activeFile={activeFile}
            onFileClose={handleFileClose}
            onFileSelect={handleFileSelect}
            fileSystem={fileSystem}
            customFiles={customFiles}
            editorMode={editorMode}
            editedContent={editedContent}
            onContentChange={setEditedContent}
            onToggleEditMode={handleToggleEditMode}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onToggleTerminal={() => setTerminalCollapsed(!terminalCollapsed)}
          />

          {/* Terminal Vertical Resizer */}
          {!terminalCollapsed && (
            <div
              className="h-[1px] cursor-row-resize hover:bg-blue/60 transition-colors flex-shrink-0 bg-border"
              onMouseDown={(e) => {
                e.preventDefault();
                const startY = e.clientY;
                const startHeight = terminalHeight;

                const handleMouseMove = (e: MouseEvent) => {
                  const diff = startY - e.clientY;
                  const newHeight = Math.max(100, Math.min(600, startHeight + diff));
                  if (terminalRef.current) {
                    terminalRef.current.style.height = `${newHeight}px`;
                  }
                  setTerminalHeight(newHeight);
                };

                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                  document.body.style.cursor = "";
                  document.body.style.userSelect = "";
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
                document.body.style.cursor = "row-resize";
                document.body.style.userSelect = "none";
              }}
            />
          )}

          {/* Terminal Component */}
          <Terminal
            ref={terminalRef}
            isCollapsed={terminalCollapsed}
            onToggle={() => setTerminalCollapsed(!terminalCollapsed)}
            height={terminalHeight}
            onOpenFile={handleFileClick}
            onSetTheme={handleSetTheme}
          />
        </div>
      </div>

      {/* VS Code Bottom Status Bar */}
      <StatusBar
        activeFile={activeFile}
        activeTheme={activeTheme}
        onThemeClick={() => setCommandPaletteOpen(true)}
        terminalCollapsed={terminalCollapsed}
        onToggleTerminal={() => setTerminalCollapsed(!terminalCollapsed)}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenFile={handleFileClick}
        onSetTheme={handleSetTheme}
        onToggleTerminal={() => setTerminalCollapsed(!terminalCollapsed)}
        onNewFile={handleNewFile}
      />
    </div>
  );
}

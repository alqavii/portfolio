"use client";

import { useState, useRef, useEffect } from "react";
import { Folder } from "lucide-react";
import ActivityBar from "@/components/ActivityBar";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Terminal from "@/components/Terminal";
import MenuBar from "@/components/MenuBar";
import { FileSystem, FileSystemFile } from "@/lib/fileSystem";

export default function Home() {
  const [activeView, setActiveView] = useState("explorer");
  const [openFiles, setOpenFiles] = useState<string[]>(["alqavi.md"]);
  const [activeFile, setActiveFile] = useState<string | null>("alqavi.md");
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(256);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [fileSystem] = useState(() => new FileSystem());
  const [customFiles, setCustomFiles] = useState<FileSystemFile[]>([]);
  const [editorMode, setEditorMode] = useState<"view" | "edit">("view");
  const [editedContent, setEditedContent] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleFileClick = (file: string) => {
    setActiveFile(file);
    if (!openFiles.includes(file)) {
      setOpenFiles([...openFiles, file]);
    }
  };

  const handleProjectClick = (project: any) => {
    handleFileClick(project.id);
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

  const handleNewFile = () => {
    const fileName = prompt("Enter file name (e.g., newfile.txt or newfile.md):");
    if (fileName && fileName.trim()) {
      const file = fileSystem.createFile(fileName.trim());
      setCustomFiles([...customFiles, file]);
      handleFileClick(file.id);
      setEditorMode("edit");
      setEditedContent(file.content);
    }
  };

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
        setCustomFiles([...customFiles, fsFile]);
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

  const handleSave = () => {
    if (!activeFile) return;
    
    const fsFile = fileSystem.getFile(activeFile);
    if (fsFile) {
      fileSystem.updateFile(activeFile, editedContent);
      setCustomFiles(customFiles.map(f => f.id === activeFile ? fileSystem.getFile(activeFile)! : f));
      alert("File saved!");
    } else if (activeFile === "alqavi.md") {
      // For alqavi.md, download it
      downloadFile("alqavi.md", editedContent || "");
    } else if (activeFile === "contact.md") {
      // For contact.md, download it
      downloadFile("contact.md", editedContent || "");
    }
  };

  const handleSaveAs = () => {
    if (!activeFile) return;
    
    const fileName = prompt("Enter file name:");
    if (fileName && fileName.trim()) {
      const content = editedContent || "";
      downloadFile(fileName.trim(), content);
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

  const handleToggleEditMode = () => {
    if (editorMode === "view") {
      setEditorMode("edit");
      // Load current content into edit mode based on file type
      if (!activeFile) {
        setEditedContent("");
        return;
      }

      // Check if it's a custom file
      const fsFile = fileSystem.getFile(activeFile);
      if (fsFile) {
        setEditedContent(fsFile.content);
        return;
      }

      // If it's alqavi.md, load from API
      if (activeFile === "alqavi.md") {
        fetch("/api/alqavi")
          .then(res => res.json())
          .then(data => setEditedContent(data.content))
          .catch(() => setEditedContent(""));
        return;
      }

      // If it's contact.md, load from API
      if (activeFile === "contact.md") {
        fetch("/api/contact")
          .then(res => res.json())
          .then(data => setEditedContent(data.content))
          .catch(() => setEditedContent(""));
        return;
      }

      // For projects, we can't edit them
      setEditedContent("");
    } else {
      setEditorMode("view");
      // When switching back to view, reload the content
      setEditedContent("");
    }
  };

  // Reset edit mode when switching files
  useEffect(() => {
    if (editorMode === "edit") {
      setEditorMode("view");
      setEditedContent("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile]);

  const handleAppearance = () => {
    const themes = [
      "Catppuccin Mocha (Current)",
      "Catppuccin Latte",
      "Catppuccin Frappé",
      "Catppuccin Macchiato",
    ];
    const choice = prompt(
      `Appearance Settings\n\nAvailable themes:\n${themes.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nEnter theme number (1-4):`
    );
    if (choice) {
      const themeNum = parseInt(choice);
      if (themeNum >= 1 && themeNum <= 4) {
        alert(`Theme "${themes[themeNum - 1]}" selected!\n\nNote: Currently only Catppuccin Mocha is implemented. Other themes coming soon!`);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+N to new file
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
  }, [activeFile, editedContent]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-base">
      {/* Menu Bar */}
      <MenuBar
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onAppearance={handleAppearance}
        onToggleTerminal={() => setTerminalCollapsed(!terminalCollapsed)}
        onToggleExplorer={() => {
          setActiveView(activeView === "explorer" ? "" : "explorer");
          setMobileSidebarOpen(!mobileSidebarOpen);
        }}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept=".txt,.md,.js,.ts,.tsx,.jsx,.json,.css,.html"
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Activity Bar - Hidden on mobile */}
        <div className="hidden md:block h-full">
          <ActivityBar activeView={activeView} onViewChange={setActiveView} />
        </div>
        
        {/* Sidebar - Drawer on mobile, normal on desktop */}
        {activeView === "explorer" && (
          <div
            ref={sidebarRef}
            className={`
              fixed md:static inset-y-0 md:inset-y-auto left-0 z-50 md:z-auto
              transform transition-transform duration-300 ease-in-out
              ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0
              bg-surface-0
              md:h-full
            `}
            style={{ width: isMobile ? "280px" : `${sidebarWidth}px` }}
          >
            <Sidebar
              openFiles={openFiles}
              activeFile={activeFile}
              onFileClick={(file) => {
                handleFileClick(file);
                setMobileSidebarOpen(false);
              }}
              onProjectClick={(project) => {
                handleProjectClick(project);
                setMobileSidebarOpen(false);
              }}
              customFiles={customFiles}
              onDeleteFile={(id) => {
                fileSystem.deleteFile(id);
                setCustomFiles(customFiles.filter(f => f.id !== id));
                if (activeFile === id) {
                  const newOpenFiles = openFiles.filter(f => f !== id);
                  setOpenFiles(newOpenFiles);
                  setActiveFile(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null);
                }
              }}
            />
          </div>
        )}

        {/* Desktop Resizer - Hidden on mobile */}
        {activeView === "explorer" && (
          <div
            className="hidden md:block w-1 cursor-col-resize hover:bg-blue/20 transition-colors flex-shrink-0"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = sidebarWidth;

              const handleMouseMove = (e: MouseEvent) => {
                const diff = e.clientX - startX;
                const newWidth = Math.max(150, Math.min(500, startWidth + diff));
                
                // Update directly via ref for immediate visual feedback
                if (sidebarRef.current) {
                  sidebarRef.current.style.width = `${newWidth}px`;
                }
                
                // Update state for persistence
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

        {/* Mobile Explorer Toggle Button */}
        <button
          onClick={() => {
            setActiveView("explorer");
            setMobileSidebarOpen(true);
          }}
          className="md:hidden fixed bottom-4 right-4 z-30 bg-blue text-base px-4 py-2 rounded-lg shadow-lg hover:bg-blue-light transition-colors flex items-center gap-2"
        >
          <Folder size={20} />
          <span className="text-sm">Explorer</span>
        </button>

        <div className="flex-1 flex flex-col overflow-hidden">
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
          />
          {!terminalCollapsed && (
            <div
              className="h-1 cursor-row-resize hover:bg-blue/20 transition-colors flex-shrink-0"
              onMouseDown={(e) => {
                e.preventDefault();
                const startY = e.clientY;
                const startHeight = terminalHeight;

                const handleMouseMove = (e: MouseEvent) => {
                  const diff = startY - e.clientY; // Inverted because we're resizing from top
                  const newHeight = Math.max(100, Math.min(600, startHeight + diff));
                  
                  // Update directly via ref for immediate visual feedback
                  if (terminalRef.current) {
                    terminalRef.current.style.height = `${newHeight}px`;
                  }
                  
                  // Update state for persistence
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
          <Terminal
            ref={terminalRef}
            isCollapsed={terminalCollapsed}
            onToggle={() => setTerminalCollapsed(!terminalCollapsed)}
            height={terminalHeight}
          />
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Github, 
  MoreVertical,
  Edit2, 
  Eye, 
  ChevronRight,
  Activity,
  FileText,
  Play,
  RotateCcw,
  Sliders
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import { FileSystem, FileSystemFile } from "@/lib/fileSystem";
import PetralInteractiveDemo from "@/components/PetralInteractiveDemo";
import WelcomeView from "@/components/WelcomeView";

interface EditorProps {
  openFiles: string[];
  activeFile: string | null;
  onFileClose: (file: string) => void;
  onFileSelect: (file: string) => void;
  fileSystem?: FileSystem;
  customFiles?: FileSystemFile[];
  editorMode?: "view" | "edit";
  editedContent?: string;
  onContentChange?: (content: string) => void;
  onToggleEditMode?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleTerminal?: () => void;
}

export default function Editor({
  openFiles,
  activeFile,
  onFileClose,
  onFileSelect,
  fileSystem,
  customFiles = [],
  editorMode = "view",
  editedContent = "",
  onContentChange,
  onToggleEditMode,
  onOpenCommandPalette = () => {},
  onToggleTerminal = () => {},
}: EditorProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showProjectPreview, setShowProjectPreview] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [petralTab, setPetralTab] = useState<"docs" | "simulator">("docs");

  useEffect(() => {
    const loadContent = async () => {
      if (!activeFile) {
        setContent("");
        if (onContentChange) onContentChange("");
        return;
      }

      // 1. alqavi.md
      if (activeFile === "alqavi.md") {
        try {
          const response = await fetch("/api/alqavi");
          if (response.ok) {
            const data = await response.json();
            setContent(data.content);
            if (onContentChange) onContentChange(data.content);
          } else {
            setContent("# About AlQavi\n\nFailed to load alqavi.md");
          }
        } catch (error) {
          setContent("# About AlQavi\n\nFailed to load alqavi.md");
        }
        return;
      }

      // 2. contact.md
      if (activeFile === "contact.md") {
        try {
          const response = await fetch("/api/contact");
          if (response.ok) {
            const data = await response.json();
            setContent(data.content);
            if (onContentChange) onContentChange(data.content);
          } else {
            setContent("# Contact\n\nFailed to load contact.md");
          }
        } catch (error) {
          setContent("# Contact\n\nFailed to load contact.md");
        }
        return;
      }

      // 3. petral documentation (direct API for reliability & speed)
      if (activeFile === "projects/petral/README.md" || activeFile === "petral.md") {
        try {
          const response = await fetch("/api/petral");
          if (response.ok) {
            const data = await response.json();
            setContent(data.content);
            if (onContentChange) onContentChange(data.content);
            return;
          }
        } catch (error) {
          // fallback continues below
        }
      }

      // 4. Custom files from FileSystem
      if (fileSystem) {
        const customFile = fileSystem.getFile(activeFile);
        if (customFile) {
          setContent(customFile.content);
          if (onContentChange) onContentChange(customFile.content);
          return;
        }
      }

      // 5. Project README files
      if (activeFile.startsWith("projects/") && activeFile.endsWith("/README.md")) {
        const projectId = activeFile.split("/")[1];
        const project = projectsData.find((p) => p.id === projectId);
        if (project && project.githubUrl) {
          setLoading(true);
          try {
            const repoUrl = project.githubUrl.replace("github.com", "raw.githubusercontent.com");
            let readmeUrl = `${repoUrl}/main/README.md`;
            let response = await fetch(readmeUrl);
            
            if (!response.ok) {
              readmeUrl = `${repoUrl}/master/README.md`;
              response = await fetch(readmeUrl);
            }
            
            if (response.ok) {
              const text = await response.text();
              setContent(text);
              if (onContentChange) onContentChange(text);
            } else {
              setContent(`# ${project.displayName}\n\n${project.description}\n\n**GitHub Repository:** [${project.githubUrl}](${project.githubUrl})`);
            }
          } catch (error) {
            setContent(`# ${project.displayName}\n\n${project.description}\n\n**GitHub Repository:** [${project.githubUrl}](${project.githubUrl})`);
          } finally {
            setLoading(false);
          }
          return;
        }
      }

      // 6. Project Demo files
      if (activeFile.startsWith("projects/") && !activeFile.endsWith("/README.md")) {
        setContent("");
        return;
      }

      setContent(`# Unknown File\n\nNo content available.`);
    };

    if (editorMode === "view") {
      loadContent();
    }
  }, [activeFile, editorMode, fileSystem, onContentChange]);

  useEffect(() => {
    setShowProjectPreview(false);
    setIframeError(false);
    setIframeLoading(true);
  }, [activeFile]);

  const getFileName = (fileId: string) => {
    if (fileId === "alqavi.md") return "alqavi.md";
    if (fileId === "contact.md") return "contact.md";
    if (fileSystem) {
      const customFile = fileSystem.getFile(fileId);
      if (customFile) return customFile.name;
    }
    if (fileId.startsWith("projects/")) {
      const parts = fileId.split("/");
      if (parts.length === 3) {
        if (parts[1] === "petral" && parts[2] === "petral") return "petral-simulator";
        return parts[2];
      }
    }
    return fileId;
  };

  const isEditable = () => {
    if (!activeFile) return false;
    if (activeFile === "alqavi.md") return true;
    if (activeFile === "contact.md") return true;
    if (fileSystem && fileSystem.getFile(activeFile)) return true;
    return false;
  };

  const getProjectInfo = () => {
    if (!activeFile || !activeFile.startsWith("projects/")) return null;
    const parts = activeFile.split("/");
    if (parts.length === 3 && !activeFile.endsWith("/README.md")) {
      const projectId = parts[1];
      const project = projectsData.find((p) => p.id === projectId);
      return project || null;
    }
    return null;
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // If no files are open, show the modern Welcome / Getting Started view
  if (!activeFile || openFiles.length === 0) {
    return (
      <WelcomeView
        onOpenFile={onFileSelect}
        onOpenCommandPalette={onOpenCommandPalette}
        onToggleTerminal={onToggleTerminal}
      />
    );
  }

  const isPetralFile = activeFile.includes("petral");
  const isPetralSimulatorOnly = activeFile === "projects/petral/petral";
  const projectInfo = getProjectInfo();
  const isDemoFile = activeFile.startsWith("projects/") && !activeFile.endsWith("/README.md");

  // Breadcrumbs calculation
  const breadcrumbParts = activeFile.split("/");

  return (
    <div className="flex-1 flex flex-col bg-base overflow-hidden font-mono">
      {/* Tab Bar */}
      <div className="flex items-center bg-surface-0 border-b border-surface-2 overflow-x-auto scrollbar-thin select-none">
        {openFiles.map((file) => {
          const fileName = getFileName(file);
          const isActive = file === activeFile;
          const isPetralTab = file.includes("petral");

          return (
            <div
              key={file}
              className={cn(
                "flex items-center gap-1.5 md:gap-2 px-3 py-2 border-r border-surface-2 cursor-pointer group min-w-fit transition-colors text-xs",
                isActive 
                  ? "bg-surface-1 text-text-primary border-t-2 border-t-blue font-semibold" 
                  : "bg-surface-0 text-text-secondary hover:bg-surface-1/60 hover:text-text-primary"
              )}
              onClick={() => onFileSelect(file)}
            >
              {isPetralTab ? (
                <Activity size={13} className="text-green flex-shrink-0" />
              ) : file.endsWith(".md") ? (
                <FileText size={13} className="text-blue flex-shrink-0" />
              ) : (
                <FileText size={13} className="text-yellow flex-shrink-0" />
              )}
              <span className="whitespace-nowrap truncate max-w-[130px] md:max-w-none">{fileName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClose(file);
                }}
                className="opacity-70 hover:opacity-100 text-text-tertiary hover:text-red hover:bg-surface-2 p-0.5 rounded transition-all ml-1"
                title="Close tab"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        {/* Tab Bar Actions (Right side) */}
        <div className="ml-auto flex items-center gap-1 px-3">
          {/* Petral quick switch tab if active file is petral */}
          {isPetralFile && (
            <div className="flex items-center bg-surface-1 rounded p-0.5 border border-surface-2 text-[11px] mr-2">
              <button
                onClick={() => setPetralTab("docs")}
                className={cn(
                  "px-2 py-0.5 rounded transition-colors flex items-center gap-1",
                  petralTab === "docs" ? "bg-surface-3 text-text-primary font-bold" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <FileText size={11} />
                <span className="hidden sm:inline">Docs</span>
              </button>
              <button
                onClick={() => setPetralTab("simulator")}
                className={cn(
                  "px-2 py-0.5 rounded transition-colors flex items-center gap-1",
                  petralTab === "simulator" ? "bg-surface-3 text-green font-bold" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Activity size={11} />
                <span className="hidden sm:inline">Simulator</span>
              </button>
            </div>
          )}

          {isEditable() && onToggleEditMode && (
            <button
              onClick={onToggleEditMode}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-1 rounded transition-colors border border-surface-2"
              title={editorMode === "edit" ? "Switch to View Mode" : "Switch to Edit Mode"}
            >
              {editorMode === "edit" ? (
                <>
                  <Eye size={12} className="text-blue" />
                  <span className="hidden sm:inline">View</span>
                </>
              ) : (
                <>
                  <Edit2 size={12} className="text-mauve" />
                  <span className="hidden sm:inline">Edit</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumbs Navigation Bar */}
      <div className="flex items-center px-4 py-1.5 bg-surface-1/40 border-b border-surface-2 text-[11px] text-text-tertiary select-none">
        <span className="hover:text-text-secondary cursor-pointer">alqavi-portfolio</span>
        {breadcrumbParts.map((part, index) => (
          <React.Fragment key={index}>
            <ChevronRight size={12} className="mx-1 text-text-tertiary" />
            <span
              className={cn(
                index === breadcrumbParts.length - 1
                  ? "text-text-secondary font-medium"
                  : "hover:text-text-secondary cursor-pointer"
              )}
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin relative bg-base">
        {loading ? (
          <div className="flex items-center justify-center h-full text-text-tertiary text-xs gap-2">
            <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" />
            <span>Loading content...</span>
          </div>
        ) : isPetralSimulatorOnly || (isPetralFile && petralTab === "simulator") ? (
          /* Dedicated Petral Simulator view */
          <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <PetralInteractiveDemo />
          </div>
        ) : isDemoFile && projectInfo ? (
          /* Interactive Demo View for Projects */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-12 text-center">
            <div className="max-w-xl w-full bg-surface-0 border border-surface-2 rounded-xl p-8 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-blue/15 text-blue font-bold">
                  PROJECT DEMO LAUNCHER
                </span>
                <h2 className="text-2xl font-bold text-text-primary">
                  {projectInfo.displayName || projectInfo.name}
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {projectInfo.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {projectInfo.demoUrl && projectInfo.demoUrl !== "interactive:petral" && (
                  <a
                    href={projectInfo.demoUrl.replace("?embed=true", "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue text-base font-bold rounded-lg hover:bg-blue-light transition-colors text-xs"
                  >
                    <ExternalLink size={14} />
                    <span>Launch External Demo</span>
                  </a>
                )}
                {projectInfo.githubUrl && (
                  <a
                    href={projectInfo.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-1 hover:bg-surface-2 border border-surface-2 text-text-primary font-bold rounded-lg transition-colors text-xs"
                  >
                    <Github size={14} />
                    <span>View GitHub Repo</span>
                  </a>
                )}
                {projectInfo.id === "petral" && (
                  <button
                    onClick={() => setPetralTab("simulator")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green/15 hover:bg-green/25 text-green border border-green/30 font-bold rounded-lg transition-colors text-xs"
                  >
                    <Activity size={14} />
                    <span>Run Curve Simulator</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : editorMode === "edit" && isEditable() ? (
          /* Edit Mode textarea */
          <textarea
            value={editedContent}
            onChange={(e) => {
              if (onContentChange) onContentChange(e.target.value);
            }}
            className="w-full h-full bg-base text-text-primary font-mono text-xs md:text-sm p-4 md:p-8 outline-none resize-none leading-relaxed"
            placeholder="Edit markdown..."
            spellCheck={false}
          />
        ) : (
          /* Markdown Document View */
          <div className="p-4 md:p-10 max-w-4xl mx-auto relative">
            {/* If viewing Petral README, show the interactive demo directly inside! */}
            {isPetralFile && (
              <div className="mb-8">
                <PetralInteractiveDemo />
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="markdown-content space-y-4"
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary pb-3 border-b border-surface-2 mb-6" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl md:text-2xl font-bold text-text-primary mt-8 mb-4 flex items-center gap-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-base md:text-lg font-bold text-text-primary mt-6 mb-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-4" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) => {
                    if (inline) {
                      return (
                        <code
                          className="bg-surface-2 text-peach px-1.5 py-0.5 rounded text-[12px] font-mono border border-surface-3"
                          {...props}
                        />
                      );
                    }
                    return (
                      <code
                        className="block bg-surface-0 text-text-primary p-4 rounded-xl overflow-x-auto my-4 text-xs font-mono border border-surface-2"
                        {...props}
                      />
                    );
                  },
                  pre: ({ node, ...props }) => (
                    <pre className="bg-surface-0 p-4 rounded-xl overflow-x-auto my-4 border border-surface-2 text-xs" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-blue pl-4 py-2 italic text-xs md:text-sm text-text-secondary bg-surface-1/40 rounded-r-lg my-4"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside text-xs md:text-sm text-text-secondary space-y-1.5 my-3 pl-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside text-xs md:text-sm text-text-secondary space-y-1.5 my-3 pl-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-text-secondary leading-relaxed" {...props} />
                  ),
                  a: ({ node, href, children, ...props }: any) => {
                    const isContact = activeFile === "contact.md";
                    let copyVal = href || "";
                    if (copyVal.startsWith("mailto:")) copyVal = copyVal.replace("mailto:", "");
                    if (copyVal.startsWith("tel:")) copyVal = copyVal.replace("tel:", "");
                    const isCopied = copiedId === copyVal;

                    return (
                      <span className="inline-flex items-center gap-1.5 group">
                        <a
                          className="text-blue hover:text-blue-light underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={href}
                          {...props}
                        >
                          {children}
                        </a>
                        {isContact && href && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleCopy(copyVal, copyVal);
                            }}
                            className="text-text-tertiary hover:text-text-primary transition-colors p-0.5"
                            title="Copy"
                          >
                            {isCopied ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                          </button>
                        )}
                      </span>
                    );
                  },
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 border border-surface-2 rounded-lg">
                      <table className="min-w-full divide-y divide-surface-2 text-xs" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-3 py-2 bg-surface-1 font-bold text-left text-text-primary" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-3 py-2 border-t border-surface-2 text-text-secondary" {...props} />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

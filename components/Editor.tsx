"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Github, 
  Edit2, 
  Eye, 
  ChevronRight,
  FileText,
  RotateCw,
  Lock,
  Globe,
  AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import { FileSystem, FileSystemFile } from "@/lib/fileSystem";

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
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

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
        } catch {
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
        } catch {
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
        } catch {
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
          } catch {
            setContent(`# ${project.displayName}\n\n${project.description}\n\n**GitHub Repository:** [${project.githubUrl}](${project.githubUrl})`);
          } finally {
            setLoading(false);
          }
          return;
        }
      }

      // 6. Project Demo files (handled by iframe renderer)
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

  // Reset iframe state when active file changes
  useEffect(() => {
    setIframeLoading(true);
    setIframeError(false);
  }, [activeFile, iframeKey]);

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
        if (parts[2] === "README.md") return `${parts[1]}/README.md`;
        return `${parts[2]} (Preview)`;
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
      if (project?.demoUrl) {
        const url = project.demoUrl;
        const normalizedUrl = url.startsWith("/")
          ? url
          : url.startsWith("http://") 
          ? url.replace("http://", "https://")
          : url.startsWith("https://")
          ? url
          : `https://${url}`;
        return { ...project, demoUrl: normalizedUrl };
      }
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

  // If no files are open, show authentic VS Code empty editor watermark
  if (!activeFile || openFiles.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-base text-text-tertiary select-none font-mono p-6">
        <div className="space-y-6 max-w-sm w-full text-center">
          <div className="flex items-center justify-center gap-2 text-text-secondary opacity-60">
            <span className="text-xl font-bold tracking-widest">ALQAVI</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-surface-1 border border-border">IDE</span>
          </div>
          
          <div className="space-y-2 text-xs text-text-tertiary">
            <div className="flex items-center justify-between py-1">
              <span>Show All Commands</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-border text-text-secondary">Ctrl+Shift+P</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Go to File</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-border text-text-secondary">Ctrl+P</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span>Toggle Terminal</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-border text-text-secondary">Ctrl+`</kbd>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onFileSelect("alqavi.md")}
              className="text-xs text-blue hover:text-blue-light hover:underline transition-colors"
            >
              Open alqavi.md
            </button>
          </div>
        </div>
      </div>
    );
  }

  const projectInfo = getProjectInfo();
  const isDemoFile = activeFile.startsWith("projects/") && !activeFile.endsWith("/README.md");
  const breadcrumbParts = activeFile.split("/");

  return (
    <div className="flex-1 flex flex-col bg-base overflow-hidden font-mono">
      {/* Tab Bar */}
      <div className="flex items-center bg-surface-0 border-b border-border overflow-x-auto scrollbar-thin select-none">
        {openFiles.map((file) => {
          const fileName = getFileName(file);
          const isActive = file === activeFile;
          const isPreviewTab = file.startsWith("projects/") && !file.endsWith("/README.md");

          return (
            <div
              key={file}
              className={cn(
                "flex items-center gap-1.5 md:gap-2 px-3 py-2 border-r border-border cursor-pointer group min-w-fit transition-colors text-xs",
                isActive 
                  ? "bg-base text-text-primary border-t-2 border-t-blue font-medium" 
                  : "bg-surface-0 text-text-secondary hover:bg-surface-1/70 hover:text-text-primary"
              )}
              onClick={() => onFileSelect(file)}
            >
              {isPreviewTab ? (
                <Globe size={13} className="text-green flex-shrink-0" />
              ) : (
                <FileText size={13} className="text-blue flex-shrink-0" />
              )}
              <span className="whitespace-nowrap truncate max-w-[150px] md:max-w-none">{fileName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClose(file);
                }}
                className="opacity-70 hover:opacity-100 text-text-tertiary hover:text-red hover:bg-surface-1 p-0.5 rounded transition-all ml-1"
                title="Close tab"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        {/* Tab Bar Right Actions */}
        {isEditable() && onToggleEditMode && (
          <div className="ml-auto px-3">
            <button
              onClick={onToggleEditMode}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-1 rounded transition-colors border border-border"
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
          </div>
        )}
      </div>

      {/* Breadcrumbs Navigation Bar (hidden during full iframe preview) */}
      {!isDemoFile && (
        <div className="flex items-center px-4 py-1.5 bg-surface-1/30 border-b border-border text-[11px] text-text-tertiary select-none">
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
      )}

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-base">
        {loading ? (
          <div className="flex items-center justify-center h-full text-text-tertiary text-xs gap-2">
            <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" />
            <span>Loading content...</span>
          </div>
        ) : isDemoFile && projectInfo && projectInfo.demoUrl ? (
          /* ============================================================ */
          /* AUTHENTIC VS CODE WEBVIEW / EMBEDDED IFRAME                  */
          /* ============================================================ */
          <div className="w-full h-full flex flex-col bg-base overflow-hidden">
            {/* VS Code Simple Browser Navigation Bar */}
            <div className="h-8 bg-surface-0 border-b border-border flex items-center justify-between px-3 gap-2 select-none text-xs">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <button
                  onClick={() => {
                    setIframeLoading(true);
                    setIframeKey((prev) => prev + 1);
                  }}
                  className="p-1 text-text-tertiary hover:text-text-primary hover:bg-surface-1 rounded transition-colors"
                  title="Reload webview"
                >
                  <RotateCw size={12} className={cn(iframeLoading && "animate-spin text-blue")} />
                </button>
                
                {/* Embedded URL address pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-surface-1 rounded border border-border text-[11px] text-text-secondary flex-1 max-w-xl truncate">
                  <Lock size={10} className="text-green flex-shrink-0" />
                  <span className="truncate select-text">
                    {projectInfo.demoUrl.startsWith("/") 
                      ? `https://www.alqavi.xyz${projectInfo.demoUrl}` 
                      : projectInfo.demoUrl}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {projectInfo.githubUrl && (
                  <a
                    href={projectInfo.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-text-tertiary hover:text-text-primary hover:bg-surface-1 rounded transition-colors"
                    title="View Source on GitHub"
                  >
                    <Github size={13} />
                  </a>
                )}
                <a
                  href={projectInfo.demoUrl.replace("?embed=true", "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-0.5 text-text-secondary hover:text-text-primary hover:bg-surface-1 rounded transition-colors border border-border text-[11px]"
                  title="Open in new browser tab"
                >
                  <ExternalLink size={11} />
                  <span className="hidden sm:inline">Open in New Tab</span>
                </a>
              </div>
            </div>

            {/* Embedded Iframe Container */}
            <div className="flex-1 relative w-full h-full bg-base overflow-hidden">
              <iframe
                key={iframeKey}
                src={projectInfo.demoUrl}
                className="w-full h-full border-0 bg-base"
                title={projectInfo.displayName || projectInfo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeError(true);
                  setIframeLoading(false);
                }}
              />

              {/* Loading Overlay */}
              {iframeLoading && !iframeError && (
                <div className="absolute inset-0 bg-base/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-text-tertiary text-xs z-10">
                  <div className="w-5 h-5 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                  <span>Loading {projectInfo.name}...</span>
                </div>
              )}

              {/* Iframe Error / X-Frame-Options Fallback */}
              {iframeError && (
                <div className="absolute inset-0 bg-base flex flex-col items-center justify-center p-6 text-center z-20">
                  <div className="max-w-md w-full bg-surface-0 border border-border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-center text-peach">
                      <AlertCircle size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-text-primary">
                        Embedded Preview Blocked
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        The live service at <code className="text-text-primary px-1 rounded bg-surface-1">{projectInfo.demoUrl}</code> restricts embedded iframe display via security headers (e.g. X-Frame-Options).
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <a
                        href={projectInfo.demoUrl.replace("?embed=true", "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue text-base font-bold rounded text-xs hover:bg-blue-light transition-colors"
                      >
                        <ExternalLink size={13} />
                        <span>Open in New Tab</span>
                      </a>
                      {projectInfo.githubUrl && (
                        <a
                          href={projectInfo.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-1 hover:bg-surface-2 border border-border text-text-primary font-bold rounded text-xs transition-colors"
                        >
                          <Github size={13} />
                          <span>View Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : editorMode === "edit" && isEditable() ? (
          /* Edit Mode Textarea */
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
          /* Clean Markdown Document Viewer */
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-8 max-w-4xl mx-auto w-full">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="markdown-content space-y-4"
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary pb-2 border-b border-border mb-6" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-lg md:text-xl font-bold text-text-primary mt-8 mb-3 flex items-center gap-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-sm md:text-base font-bold text-text-primary mt-6 mb-2" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-4" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) => {
                    if (inline) {
                      return (
                        <code
                          className="bg-surface-1 text-peach px-1.5 py-0.5 rounded text-[11px] font-mono border border-border"
                          {...props}
                        />
                      );
                    }
                    return (
                      <code
                        className="block bg-surface-0 text-text-primary p-3 rounded overflow-x-auto my-3 text-xs font-mono border border-border"
                        {...props}
                      />
                    );
                  },
                  pre: ({ node, ...props }) => (
                    <pre className="bg-surface-0 p-3 rounded overflow-x-auto my-3 border border-border text-xs" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-2 border-blue pl-3 py-1.5 italic text-xs text-text-secondary bg-surface-1/40 rounded-r my-3"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside text-xs md:text-sm text-text-secondary space-y-1 my-3 pl-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside text-xs md:text-sm text-text-secondary space-y-1 my-3 pl-2" {...props} />
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
                      <span className="inline-flex items-center gap-1 group">
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
                            {isCopied ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                          </button>
                        )}
                      </span>
                    );
                  },
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 border border-border rounded">
                      <table className="min-w-full divide-y divide-border text-xs" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-3 py-1.5 bg-surface-1 font-semibold text-left text-text-primary" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-3 py-1.5 border-t border-border text-text-secondary" {...props} />
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

"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, ExternalLink, Github, MoreVertical } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import projectsData from "@/data/projects.json";

import { FileSystem, FileSystemFile } from "@/lib/fileSystem";
import { Edit2, Eye } from "lucide-react";

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
}: EditorProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showProjectPreview, setShowProjectPreview] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      if (!activeFile) {
        setContent("");
        if (onContentChange) {
          onContentChange("");
        }
        return;
      }

      // Priority order: special files first, then custom files, then projects
      
      // 1. If it's alqavi.md, load from local file (highest priority)
      if (activeFile === "alqavi.md") {
        try {
          const response = await fetch("/api/alqavi");
          if (response.ok) {
            const data = await response.json();
            setContent(data.content);
            if (onContentChange) {
              onContentChange(data.content);
            }
          } else {
            setContent("# Error\n\nFailed to load alqavi.md");
            if (onContentChange) {
              onContentChange("");
            }
          }
        } catch (error) {
          setContent("# Error\n\nFailed to load alqavi.md");
          if (onContentChange) {
            onContentChange("");
          }
        }
        return;
      }

      // 2. If it's contact.md, load from local file
      if (activeFile === "contact.md") {
        try {
          const response = await fetch("/api/contact");
          if (response.ok) {
            const data = await response.json();
            setContent(data.content);
            if (onContentChange) {
              onContentChange(data.content);
            }
          } else {
            setContent("# Error\n\nFailed to load contact.md");
            if (onContentChange) {
              onContentChange("");
            }
          }
        } catch (error) {
          setContent("# Error\n\nFailed to load contact.md");
          if (onContentChange) {
            onContentChange("");
          }
        }
        return;
      }

      // 3. Check if it's a custom file (but not alqavi.md or contact.md)
      if (fileSystem) {
        const customFile = fileSystem.getFile(activeFile);
        if (customFile) {
          setContent(customFile.content);
          if (onContentChange) {
            onContentChange(customFile.content);
          }
          return;
        }
      }

      // 4. Check if it's a project README.md file (projects/{projectId}/README.md)
      if (activeFile.startsWith("projects/") && activeFile.endsWith("/README.md")) {
        const projectId = activeFile.split("/")[1];
        const project = projectsData.find((p) => p.id === projectId);
      if (project && project.githubUrl) {
        setLoading(true);
        try {
          // Convert GitHub URL to raw README URL
          const repoUrl = project.githubUrl.replace("github.com", "raw.githubusercontent.com");
          
          // Try main branch first
          let readmeUrl = `${repoUrl}/main/README.md`;
          let response = await fetch(readmeUrl, {
            method: "GET",
            headers: {
              Accept: "text/plain",
            },
          });
          
          if (!response.ok) {
            // Try master branch if main doesn't work
            readmeUrl = `${repoUrl}/master/README.md`;
            response = await fetch(readmeUrl, {
              method: "GET",
              headers: {
                Accept: "text/plain",
              },
            });
          }
          
          if (response.ok) {
            const text = await response.text();
            setContent(text || `# ${project.displayName}\n\n${project.description || "No README content."}`);
            if (onContentChange) {
              onContentChange(text || "");
            }
          } else {
            const errorContent = `# ${project.displayName}\n\n${project.description || "No README available."}\n\n**Note**: Could not fetch README from GitHub. Please check the repository URL.`;
            setContent(errorContent);
            if (onContentChange) {
              onContentChange("");
            }
          }
        } catch (error) {
          const errorContent = `# ${project.displayName}\n\n${project.description || "Failed to load README from GitHub."}\n\n**Error**: ${error instanceof Error ? error.message : "Unknown error"}`;
          setContent(errorContent);
          if (onContentChange) {
            onContentChange("");
          }
        } finally {
          setLoading(false);
        }
        return;
        }
      }

      // 5. Check if it's a project demo file (projects/{projectId}/{projectName})
      if (activeFile.startsWith("projects/") && !activeFile.endsWith("/README.md")) {
        const parts = activeFile.split("/");
        if (parts.length === 3) {
          const projectId = parts[1];
          const project = projectsData.find((p) => p.id === projectId);
          if (project && project.demoUrl) {
            // This will be handled by the render logic below
            setContent(""); // Empty content, we'll render iframe instead
            if (onContentChange) {
              onContentChange("");
            }
            return;
          }
        }
      }

      // 6. Fallback - no content found
      setContent(`# Unknown File\n\nNo content available for this file.`);
      if (onContentChange) {
        onContentChange("");
      }
    };

    if (editorMode === "view") {
      loadContent();
    }
  }, [activeFile, editorMode, fileSystem, onContentChange]);

  // Reset preview state when switching files
  useEffect(() => {
    setShowProjectPreview(false);
    setIframeError(false);
    setIframeLoading(true);
  }, [activeFile]);

  // Prevent scrolling when preview card is open
  useEffect(() => {
    if (showProjectPreview) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      // Prevent editor content scroll by storing scroll position
      const editorContent = document.querySelector('.flex-1.overflow-y-auto');
      if (editorContent) {
        (editorContent as HTMLElement).style.overflow = 'hidden';
      }
      
      return () => {
        document.body.style.overflow = '';
        if (editorContent) {
          (editorContent as HTMLElement).style.overflow = '';
        }
      };
    }
  }, [showProjectPreview]);

  const getFileName = (fileId: string) => {
    if (fileId === "alqavi.md") return "alqavi.md";
    if (fileId === "contact.md") return "contact.md";
    if (fileSystem) {
      const customFile = fileSystem.getFile(fileId);
      if (customFile) return customFile.name;
    }
    // Handle project files
    if (fileId.startsWith("projects/")) {
      const parts = fileId.split("/");
      if (parts.length === 3) {
        return parts[2]; // Return the filename (README.md or project name)
      }
    }
    return fileId;
  };

  const isEditable = () => {
    if (!activeFile) return false;
    if (activeFile === "alqavi.md") return true;
    if (activeFile === "contact.md") return true;
    if (fileSystem && fileSystem.getFile(activeFile)) return true;
    // Project files are not editable
    return false;
  };

  const getProjectInfo = () => {
    if (!activeFile || !activeFile.startsWith("projects/")) return null;
    const parts = activeFile.split("/");
    if (parts.length === 3 && !activeFile.endsWith("/README.md")) {
      const projectId = parts[1];
      const project = projectsData.find((p) => p.id === projectId);
      if (project?.demoUrl) {
        // Ensure URL uses HTTPS to avoid mixed content errors
        const url = project.demoUrl;
        const normalizedUrl = url.startsWith('http://') 
          ? url.replace('http://', 'https://')
          : url.startsWith('https://')
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

  // Get the current content to display
  const getDisplayContent = () => {
    if (editorMode === "edit" && isEditable()) {
      return editedContent;
    }
    return content;
  };

  const displayContent = getDisplayContent();

  return (
    <div className="flex-1 flex flex-col bg-base overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center bg-surface-1 border-b border-surface-2 overflow-x-auto scrollbar-thin">
        {openFiles.map((file) => {
          const fileName = getFileName(file);
          const isActive = file === activeFile;
          return (
            <div
              key={file}
              className={cn(
                "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 border-r border-surface-2 cursor-pointer group min-w-fit",
                isActive ? "bg-base border-b-2 border-b-blue" : "bg-surface-1 hover:bg-surface-2"
              )}
              onClick={() => onFileSelect(file)}
            >
              <span className="text-xs md:text-sm text-text-secondary whitespace-nowrap truncate max-w-[120px] md:max-w-none">{fileName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClose(file);
                }}
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-text-tertiary hover:text-text-primary transition-opacity flex-shrink-0"
              >
                <X size={12} className="md:w-[14px] md:h-[14px]" />
              </button>
            </div>
          );
        })}
        {isEditable() && onToggleEditMode && !getProjectInfo() && (
          <div className="ml-auto px-2 md:px-4">
            <button
              onClick={onToggleEditMode}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
              title={editorMode === "edit" ? "Switch to View Mode" : "Switch to Edit Mode"}
            >
              {editorMode === "edit" ? (
                <>
                  <Eye size={12} className="md:w-[14px] md:h-[14px]" />
                  <span className="hidden sm:inline">View</span>
                </>
              ) : (
                <>
                  <Edit2 size={12} className="md:w-[14px] md:h-[14px]" />
                  <span className="hidden sm:inline">Edit</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className={cn("flex-1 overflow-y-auto scrollbar-thin relative", showProjectPreview && "overflow-hidden")}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-text-tertiary">Loading...</div>
          </div>
        ) : (() => {
          const projectInfo = getProjectInfo();
          // Render iframe for project demo files
          if (projectInfo && projectInfo.demoUrl && editorMode === "view") {
            // Show error fallback if iframe fails
            if (iframeError) {
              return (
                <div className="w-full h-full bg-base flex items-center justify-center p-8">
                  <div className="max-w-2xl w-full space-y-6">
                    {/* Project Preview Card as fallback */}
                    <div className="bg-surface-1 border border-surface-2 rounded-lg p-8 space-y-6">
                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-text-primary">
                          {projectInfo.displayName || projectInfo.name}
                        </h1>
                        {projectInfo.description && (
                          <p className="text-text-secondary text-lg">
                            {projectInfo.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4">
                        <a
                          href={projectInfo.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-base rounded-lg hover:bg-blue-light transition-colors font-medium"
                        >
                          <ExternalLink size={18} />
                          Open Demo
                        </a>
                        {projectInfo.githubUrl && (
                          <a
                            href={projectInfo.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-surface-2 hover:bg-surface-0 text-text-secondary hover:text-text-primary rounded-lg transition-colors font-medium border border-surface-2"
                          >
                            <Github size={18} />
                            View on GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Render iframe
            return (
              <div className="w-full h-full bg-base relative">
                <iframe
                  src={projectInfo.demoUrl}
                  className="w-full h-full border-0"
                  title="Project Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => {
                    setIframeLoading(false);
                  }}
                  onError={() => {
                    setIframeError(true);
                    setIframeLoading(false);
                  }}
                />
                {/* Loading overlay */}
                {iframeLoading && !iframeError && (
                  <div className="absolute inset-0 bg-base/90 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-text-tertiary">Loading...</div>
                  </div>
                )}
                {/* Fallback button - always visible in corner for easy access */}
                <div className="absolute top-4 right-4 z-10">
                  <a
                    href={projectInfo.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-surface-1 hover:bg-surface-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors text-sm border border-surface-2"
                    title="Open in new tab (if iframe is blocked)"
                  >
                    <ExternalLink size={14} />
                    <span className="hidden sm:inline">Open in New Tab</span>
                  </a>
                </div>
              </div>
            );
          }
          
          // Check if we're viewing a project README and should show preview
          const isProjectReadme = activeFile?.startsWith("projects/") && activeFile.endsWith("/README.md");
          const readmeProjectInfo = isProjectReadme ? (() => {
            const parts = activeFile.split("/");
            if (parts.length === 3) {
              const projectId = parts[1];
              const project = projectsData.find((p) => p.id === projectId);
              if (project?.demoUrl) {
                // Ensure URL uses HTTPS to avoid mixed content errors
                const url = project.demoUrl;
                const normalizedUrl = url.startsWith('http://') 
                  ? url.replace('http://', 'https://')
                  : url.startsWith('https://')
                  ? url
                  : `https://${url}`;
                return { ...project, demoUrl: normalizedUrl };
              }
              return project || null;
            }
            return null;
          })() : null;
          
          // Don't return early if showing preview - we'll render it as overlay
          
          // Render edit mode for editable files
          if (editorMode === "edit" && isEditable()) {
            return (
          <textarea
            value={editedContent}
            onChange={(e) => {
              if (onContentChange) {
                onContentChange(e.target.value);
              }
            }}
            className="w-full h-full bg-base text-text-primary font-mono text-sm p-4 md:p-8 outline-none resize-none"
            placeholder="Start typing..."
            spellCheck={false}
          />
            );
          }
          
          // Render markdown content (default)
          return (
            <>
            {/* Preview card overlay - fixed to editor viewport center */}
            {showProjectPreview && readmeProjectInfo && readmeProjectInfo.demoUrl && (
              <div 
                className="absolute inset-0 z-50 flex items-center justify-center p-4"
                onClick={() => setShowProjectPreview(false)}
              >
                {/* Blurred backdrop */}
                <div className="absolute inset-0 bg-base/80 backdrop-blur-sm" />
                {/* Preview card */}
                <div 
                  className="relative max-w-2xl w-full bg-surface-1 border border-surface-2 rounded-lg p-8 space-y-6 shadow-2xl z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-text-primary">
                      {readmeProjectInfo.displayName || readmeProjectInfo.name}
                    </h1>
                    {readmeProjectInfo.description && (
                      <p className="text-text-secondary text-lg">
                        {readmeProjectInfo.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <a
                      href={readmeProjectInfo.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue text-base rounded-lg hover:bg-blue-light transition-colors font-medium"
                    >
                      <ExternalLink size={18} />
                      Open Demo
                    </a>
                    {readmeProjectInfo.githubUrl && (
                      <a
                        href={readmeProjectInfo.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-surface-2 hover:bg-surface-0 text-text-secondary hover:text-text-primary rounded-lg transition-colors font-medium border border-surface-2"
                      >
                        <Github size={18} />
                        View on GitHub
                      </a>
                    )}
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={() => setShowProjectPreview(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-0 border border-surface-2 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
            <div className="prose prose-invert max-w-none p-4 md:p-8 relative">
            {/* Menu button for project README */}
            {isProjectReadme && readmeProjectInfo && readmeProjectInfo.demoUrl && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowProjectPreview(!showProjectPreview)}
                  className="w-8 h-8 rounded-full bg-surface-1 hover:bg-surface-2 border border-surface-2 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                  title="Show Project Preview"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="markdown-content"
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold text-text-primary mb-4 mt-6" {...props} />
                ),
                h2: ({ node, ...props }) => {
                  const isContactFile = activeFile === "contact.md";
                  return (
                    <h2 
                      className={cn(
                        "text-2xl font-bold text-text-primary",
                        isContactFile ? "mb-2 mt-4" : "mb-3 mt-5"
                      )} 
                      {...props} 
                    />
                  );
                },
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-bold text-text-primary mb-2 mt-4" {...props} />
                ),
                p: ({ node, children, ...props }: any) => {
                  const isContactFile = activeFile === "contact.md";
                  // Reduce spacing for paragraphs in contact.md
                  return (
                    <p 
                      className={cn(
                        "text-text-secondary leading-relaxed",
                        isContactFile ? "mb-2" : "mb-4"
                      )} 
                      {...props}
                    >
                      {children}
                    </p>
                  );
                },
                code: ({ node, inline, ...props }: any) => {
                  if (inline) {
                    return (
                      <code
                        className="bg-surface-2 text-peach px-1.5 py-0.5 rounded text-sm"
                        {...props}
                      />
                    );
                  }
                  return (
                    <code
                      className="block bg-surface-0 text-text-primary p-4 rounded-lg overflow-x-auto mb-4"
                      {...props}
                    />
                  );
                },
                pre: ({ node, ...props }) => (
                  <pre className="bg-surface-0 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
                ),
                a: ({ node, href, children, ...props }: any) => {
                  const isContactFile = activeFile === "contact.md";
                  if (isContactFile && href) {
                    // Extract the text to copy (email, phone, or URL)
                    let copyText = href;
                    if (href.startsWith("mailto:")) {
                      copyText = href.replace("mailto:", "");
                    } else if (href.startsWith("tel:")) {
                      copyText = href.replace("tel:", "");
                    } else {
                      copyText = href;
                    }
                    const linkId = `contact-link-${copyText}`;
                    const isCopied = copiedId === linkId;

                    return (
                      <span className="inline-flex items-center gap-1.5 group">
                        <a
                          className="text-blue hover:text-blue-light underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={href}
                          {...props}
                        >
                          {children}
                        </a>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleCopy(copyText, linkId);
                          }}
                          className="opacity-60 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-text-primary ml-0.5"
                          title="Copy to clipboard"
                        >
                          {isCopied ? (
                            <Check size={14} className="text-green" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </span>
                    );
                  }
                  return (
                  <a
                    className="text-blue hover:text-blue-light underline"
                    target="_blank"
                    rel="noopener noreferrer"
                      href={href}
                    {...props}
                    >
                      {children}
                    </a>
                  );
                },
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 text-text-secondary space-y-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 text-text-secondary space-y-1" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-text-secondary" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-blue pl-4 italic text-text-tertiary mb-4"
                    {...props}
                  />
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>
          </>
          );
        })()}
      </div>
    </div>
  );
}


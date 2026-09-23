"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Github,
  Pencil,
  Eye,
  ChevronRight,
  FileText,
  RotateCw,
  Globe,
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

const isPreviewFile = (file: string) =>
  file.startsWith("projects/") && !file.endsWith("/README.md");

export default function Editor({
  openFiles,
  activeFile,
  onFileClose,
  onFileSelect,
  fileSystem,
  editorMode = "view",
  editedContent = "",
  onContentChange,
  onToggleEditMode,
}: EditorProps) {
  const [content, setContent] = useState<string>("");
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (editorMode !== "view") return;

    if (!activeFile || isPreviewFile(activeFile)) {
      setContent("");
      return;
    }

    const customFile = fileSystem?.getFile(activeFile);
    if (customFile) {
      setContent(customFile.content);
      onContentChange?.(customFile.content);
      return;
    }

    let cancelled = false;
    fetch(`/api/content?file=${encodeURIComponent(activeFile)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        setContent(data.content);
        onContentChange?.(data.content);
      })
      .catch(() => {
        if (!cancelled) setContent(`Could not load ${activeFile}.`);
      });

    return () => {
      cancelled = true;
    };
  }, [activeFile, editorMode, fileSystem, onContentChange]);

  useEffect(() => {
    setIframeLoading(true);
    setIframeError(false);
  }, [activeFile, iframeKey]);

  const getFileName = (fileId: string) => {
    const customFile = fileSystem?.getFile(fileId);
    if (customFile) return customFile.name;
    if (fileId.startsWith("projects/")) {
      const [, project, file] = fileId.split("/");
      return file === "README.md" ? "README.md" : `Preview ${project}`;
    }
    return fileId;
  };

  const isEditable = () => {
    if (!activeFile) return false;
    if (activeFile === "alqavi.md" || activeFile === "contact.md") return true;
    return Boolean(fileSystem?.getFile(activeFile));
  };

  const getProjectInfo = () => {
    if (!activeFile || !isPreviewFile(activeFile)) return null;
    const project = projectsData.find((p) => p.id === activeFile.split("/")[1]);
    return project?.demoUrl ? project : null;
  };

  if (!activeFile || openFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor text-text-secondary select-none p-6">
        <div className="grid grid-cols-[auto_auto] gap-x-6 gap-y-2.5 text-base">
          <span className="text-right">Show All Commands</span>
          <span className="font-mono text-sm">Ctrl + K</span>
          <span className="text-right">Toggle Terminal</span>
          <span className="font-mono text-sm">Ctrl + `</span>
          <span className="text-right">New File</span>
          <span className="font-mono text-sm">Ctrl + N</span>
        </div>
      </div>
    );
  }

  const projectInfo = getProjectInfo();
  const isDemoFile = isPreviewFile(activeFile);
  const breadcrumbParts = activeFile.split("/");

  return (
    <div className="flex-1 flex flex-col bg-editor overflow-hidden min-h-0">
      {/* Tabs */}
      <div className="flex items-stretch h-[35px] bg-tab border-b border-border overflow-x-auto overflow-y-hidden scrollbar-thin select-none flex-shrink-0">
        {openFiles.map((file) => {
          const isActive = file === activeFile;
          const Icon = isPreviewFile(file) ? Globe : FileText;

          return (
            <div
              key={file}
              className={cn(
                "flex items-center gap-1.5 pl-3 pr-1.5 border-r border-border cursor-pointer group min-w-fit text-base relative",
                isActive
                  ? "bg-editor text-text-primary"
                  : "bg-tab text-text-secondary hover:text-text-primary"
              )}
              onClick={() => onFileSelect(file)}
            >
              {isActive && <div className="absolute inset-x-0 top-0 h-px bg-accent" />}
              {isActive && <div className="absolute inset-x-0 -bottom-px h-px bg-editor" />}
              <Icon size={14} className="text-text-secondary flex-shrink-0" />
              <span className="whitespace-nowrap">{getFileName(file)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileClose(file);
                }}
                className={cn(
                  "p-0.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-2",
                  isActive ? "visible" : "invisible group-hover:visible"
                )}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {isEditable() && onToggleEditMode && (
          <div className="ml-auto flex items-center px-2">
            <button
              onClick={onToggleEditMode}
              className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-1"
              title={editorMode === "edit" ? "Open Preview" : "Edit"}
            >
              {editorMode === "edit" ? <Eye size={16} /> : <Pencil size={15} />}
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumbs */}
      {!isDemoFile && (
        <div className="flex items-center h-[22px] px-3 bg-editor text-base text-text-secondary select-none flex-shrink-0">
          {breadcrumbParts.map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} className="mx-0.5" />}
              <span className={cn(index === breadcrumbParts.length - 1 && "text-text-primary")}>
                {part}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative bg-editor min-h-0">
        {isDemoFile && projectInfo ? (
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Simple Browser toolbar */}
            <div className="h-[30px] bg-editor border-b border-border flex items-center gap-1 px-2 select-none flex-shrink-0">
              <button
                onClick={() => setIframeKey((prev) => prev + 1)}
                className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-1"
                title="Reload"
              >
                <RotateCw size={14} />
              </button>
              <div className="flex-1 mx-1 px-2 h-[22px] flex items-center bg-input border border-border-strong rounded-sm text-base text-text-primary truncate select-text">
                {projectInfo.demoUrl.startsWith("/")
                  ? `https://www.alqavi.xyz${projectInfo.demoUrl}`
                  : projectInfo.demoUrl}
              </div>
              <a
                href={projectInfo.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-1"
                title="View source"
              >
                <Github size={14} />
              </a>
              <a
                href={projectInfo.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-1"
                title="Open in browser"
              >
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="flex-1 relative overflow-hidden">
              {iframeLoading && !iframeError && (
                <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden z-10">
                  <div className="h-full w-1/3 bg-accent animate-pulse" />
                </div>
              )}
              <iframe
                key={iframeKey}
                src={projectInfo.demoUrl}
                className="w-full h-full border-0 bg-editor"
                title={projectInfo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeError(true);
                  setIframeLoading(false);
                }}
              />

              {iframeError && (
                <div className="absolute inset-0 bg-editor flex flex-col items-center justify-center gap-3 text-base text-text-secondary">
                  <span>This page can&apos;t be shown here.</span>
                  <a
                    href={projectInfo.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-accent hover:opacity-90 text-white rounded-sm"
                  >
                    Open in browser
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : editorMode === "edit" && isEditable() ? (
          <textarea
            value={editedContent}
            onChange={(e) => onContentChange?.(e.target.value)}
            className="w-full h-full bg-editor text-text-primary font-mono text-md px-6 py-2 outline-none resize-none leading-[22px] select-text"
            spellCheck={false}
          />
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin px-7 py-4 select-text">
            <div className="max-w-[860px] w-full">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-[28px] leading-[1.25] font-semibold text-text-primary pb-[0.3em] mb-4 mt-6 first:mt-2 border-b border-border-strong" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-[21px] leading-[1.25] font-semibold text-text-primary pb-[0.3em] mt-6 mb-4 border-b border-border-strong" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-[17px] font-semibold text-text-primary mt-6 mb-3" {...props} />
                  ),
                  p: ({ node, ...props }) => <p className="text-md text-text-primary mb-4" {...props} />,
                  hr: () => <hr className="my-6 border-t border-border-strong" />,
                  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                  code: ({ node, ...props }) => (
                    <code className="font-mono text-[13px] bg-white/[0.07] px-1 py-px rounded-[3px]" {...props} />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre className="font-mono bg-white/[0.04] rounded-[3px] p-4 overflow-x-auto my-4 text-[13px] leading-relaxed scrollbar-thin [&_code]:bg-transparent [&_code]:p-0" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-[5px] border-border-strong pl-4 pr-4 my-4 text-md text-text-secondary" {...props} />
                  ),
                  ul: ({ node, ...props }) => <ul className="list-disc text-md text-text-primary my-4 pl-8" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal text-md text-text-primary my-4 pl-8" {...props} />,
                  li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
                  a: ({ node, ...props }) => (
                    <a className="text-blue hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 scrollbar-thin">
                      <table className="text-md tnum border-collapse" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-2 py-1 font-semibold text-left border-b-2 border-border-strong" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-2 py-1 border-b border-border" {...props} />
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

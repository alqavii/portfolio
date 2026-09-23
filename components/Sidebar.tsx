"use client";

import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Globe,
  Github,
  Trash2,
  FilePlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import { FileSystemFile } from "@/lib/fileSystem";

interface SidebarProps {
  activeView: string;
  openFiles: string[];
  activeFile: string | null;
  onFileClick: (file: string) => void;
  onProjectClick?: (fileId: string) => void;
  customFiles?: FileSystemFile[];
  onDeleteFile?: (id: string) => void;
  onNewFile?: () => void;
}

const INDENT = 8;

function PanelHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="h-[35px] flex-shrink-0 px-5 flex items-center justify-between text-2xs uppercase tracking-wide text-text-secondary">
      <span>{title}</span>
      {children}
    </div>
  );
}

function rowClass(active: boolean) {
  return cn(
    "flex items-center h-[22px] pr-2 cursor-pointer border border-transparent",
    active ? "bg-surface-2 text-text-primary border-accent" : "text-text-primary hover:bg-surface-1"
  );
}

function FolderRow({
  name,
  depth,
  expanded,
  onToggle,
}: {
  name: string;
  depth: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Chevron = expanded ? ChevronDown : ChevronRight;
  return (
    <div className={rowClass(false)} style={{ paddingLeft: depth * INDENT + 4 }} onClick={onToggle}>
      <Chevron size={16} className="text-text-secondary mr-0.5 flex-shrink-0" />
      <span className="truncate">{name}</span>
    </div>
  );
}

function FileRow({
  name,
  depth,
  active,
  onOpen,
  icon: Icon = FileText,
  children,
}: {
  name: string;
  depth: number;
  active: boolean;
  onOpen: () => void;
  icon?: React.ElementType;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(rowClass(active), "group")}
      style={{ paddingLeft: depth * INDENT + 22 }}
      onClick={onOpen}
    >
      <Icon size={14} className="text-text-secondary mr-1.5 flex-shrink-0" />
      <span className="flex-1 truncate">{name}</span>
      {children}
    </div>
  );
}

export default function Sidebar({
  activeView = "explorer",
  activeFile,
  onFileClick,
  customFiles = [],
  onDeleteFile,
  onNewFile,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFolder = (folder: string) => {
    setCollapsed((prev) =>
      prev.includes(folder) ? prev.filter((f) => f !== folder) : [...prev, folder]
    );
  };
  const isExpanded = (folder: string) => !collapsed.includes(folder);

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const searchableItems = [
      { fileId: "alqavi.md", title: "alqavi.md", snippet: "1st Year Chemical Engineering Student @ Sheffield" },
      ...projectsData.map((p) => ({
        fileId: `projects/${p.id}/README.md`,
        title: `${p.name}/README.md`,
        snippet: p.description,
      })),
    ];

    return searchableItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.snippet.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="w-full bg-surface-0 text-text-primary flex flex-col h-full border-r border-border select-none overflow-hidden text-base">
      {activeView === "explorer" && (
        <>
          <PanelHeader title="Explorer">
            {onNewFile && (
              <button
                onClick={onNewFile}
                className="p-0.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-1"
                title="New File"
              >
                <FilePlus size={16} />
              </button>
            )}
          </PanelHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div
              className="flex items-center h-[22px] px-1 cursor-pointer text-2xs font-bold uppercase text-text-primary"
              onClick={() => toggleFolder("root")}
            >
              {isExpanded("root") ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="ml-0.5">alqavi</span>
            </div>

            {isExpanded("root") && (
              <>
                <FolderRow name="projects" depth={1} expanded={isExpanded("projects")} onToggle={() => toggleFolder("projects")} />
                {isExpanded("projects") &&
                  projectsData.map((project) => {
                    const folderId = `project-${project.id}`;
                    const readmeId = `projects/${project.id}/README.md`;
                    const previewId = `projects/${project.id}/${project.name}`;
                    return (
                      <div key={project.id}>
                        <FolderRow name={project.name} depth={2} expanded={isExpanded(folderId)} onToggle={() => toggleFolder(folderId)} />
                        {isExpanded(folderId) && (
                          <>
                            <FileRow
                              name="README.md"
                              depth={3}
                              active={activeFile === readmeId}
                              onOpen={() => onFileClick(readmeId)}
                            />
                            <FileRow
                              name="preview"
                              depth={3}
                              active={activeFile === previewId}
                              onOpen={() => onFileClick(previewId)}
                              icon={Globe}
                            >
                              {project.githubUrl && (
                                <a
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary"
                                  title="Open on GitHub"
                                >
                                  <Github size={13} />
                                </a>
                              )}
                            </FileRow>
                          </>
                        )}
                      </div>
                    );
                  })}

                {customFiles.length > 0 && (
                  <>
                    <FolderRow name="files" depth={1} expanded={isExpanded("files")} onToggle={() => toggleFolder("files")} />
                    {isExpanded("files") &&
                      customFiles.map((file) => (
                        <FileRow key={file.id} active={activeFile === file.id} onOpen={() => onFileClick(file.id)} name={file.name} depth={2}>
                          {onDeleteFile && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete ${file.name}?`)) {
                                  onDeleteFile(file.id);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-text-secondary hover:text-text-primary"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </FileRow>
                      ))}
                  </>
                )}

                <FileRow active={activeFile === "alqavi.md"} onOpen={() => onFileClick("alqavi.md")} name="alqavi.md" depth={1} />
              </>
            )}
          </div>
        </>
      )}

      {activeView === "search" && (
        <div className="flex flex-col h-full">
          <PanelHeader title="Search" />
          <div className="px-3 pb-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-input border border-border-strong rounded-sm px-1.5 py-1 text-base text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 top-1.5 text-text-secondary hover:text-text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {searchQuery && (
              <div className="text-sm text-text-secondary px-5 pb-1">
                {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
              </div>
            )}
            {searchResults.map((result) => (
              <div
                key={result.fileId}
                onClick={() => onFileClick(result.fileId)}
                className="px-5 py-1 hover:bg-surface-1 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-text-secondary" />
                  <span>{result.title}</span>
                </div>
                <div className="text-sm text-text-secondary pl-5 truncate">{result.snippet}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === "git" && (
        <div className="flex flex-col h-full">
          <PanelHeader title="Source Control" />
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {[
              { name: "petral", url: "https://github.com/alqavii/petral" },
              { name: "qtc", url: "https://github.com/alqavii/qtc" },
              { name: "ssvi-surface", url: "https://github.com/alqavii/ssvi-surface" },
              { name: "portfolio", url: "https://github.com/alqavii/portfolio" },
            ].map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-[22px] px-5 hover:bg-surface-1"
              >
                <Github size={14} className="text-text-secondary" />
                <span>{repo.name}</span>
                <span className="text-text-secondary text-sm ml-auto">main</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

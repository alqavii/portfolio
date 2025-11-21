"use client";

import { useState, useEffect } from "react";
import { File, Folder, FolderOpen, ExternalLink, Github, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import { FileSystemFile } from "@/lib/fileSystem";

interface SidebarProps {
  openFiles: string[];
  activeFile: string | null;
  onFileClick: (file: string) => void;
  onProjectClick: (project: any) => void;
  customFiles?: FileSystemFile[];
  onDeleteFile?: (id: string) => void;
}

export default function Sidebar({
  openFiles,
  activeFile,
  onFileClick,
  onProjectClick,
  customFiles = [],
  onDeleteFile,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["root", "projects", "files"]);

  useEffect(() => {
    // Ensure root folder is expanded on mount
    setExpandedFolders((prev) => {
      const newFolders = [...prev];
      if (!newFolders.includes("root")) {
        newFolders.push("root");
      }
      if (customFiles.length > 0 && !newFolders.includes("files")) {
        newFolders.push("files");
      }
      return newFolders;
    });
  }, [customFiles.length]);

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folder)
        ? prev.filter((f) => f !== folder)
        : [...prev, folder]
    );
  };

  const isExpanded = (folder: string) => expandedFolders.includes(folder);

  return (
    <div className="w-full bg-surface-0 text-text-secondary flex flex-col h-full border-r border-surface-2">
      <div className="px-4 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider border-b border-surface-2 bg-surface-2/50">
        Explorer
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="py-2">
          {/* Root folder */}
          <div className="select-none">
            <div
              className="flex items-center px-2 py-1 hover:bg-surface-2 cursor-pointer transition-colors"
              onClick={() => toggleFolder("root")}
            >
              {isExpanded("root") ? (
                <FolderOpen size={16} className="text-blue mr-2" />
              ) : (
                <Folder size={16} className="text-blue mr-2" />
              )}
              <span className="text-sm font-medium">ALQAVI</span>
            </div>

            {isExpanded("root") && (
              <div className="ml-4">
                {/* alqavi.md file */}
                <div
                  className={cn(
                    "flex items-center px-2 py-1 cursor-pointer transition-colors",
                    activeFile === "alqavi.md" && "bg-surface-2 text-text-primary",
                    "hover:bg-surface-2"
                  )}
                  onClick={() => {
                    if (!openFiles.includes("alqavi.md")) {
                      onFileClick("alqavi.md");
                    } else {
                      onFileClick("alqavi.md");
                    }
                  }}
                >
                  <File size={16} className="text-blue mr-2" />
                  <span className="text-sm">alqavi.md</span>
                </div>

                {/* contact.md file */}
                <div
                  className={cn(
                    "flex items-center px-2 py-1 cursor-pointer transition-colors",
                    activeFile === "contact.md" && "bg-surface-2 text-text-primary",
                    "hover:bg-surface-2"
                  )}
                  onClick={() => {
                    if (!openFiles.includes("contact.md")) {
                      onFileClick("contact.md");
                    } else {
                      onFileClick("contact.md");
                    }
                  }}
                >
                  <File size={16} className="text-blue mr-2" />
                  <span className="text-sm">contact.md</span>
                </div>

                {/* Custom Files folder */}
                {customFiles.length > 0 && (
                  <div>
                    <div
                      className="flex items-center px-2 py-1 hover:bg-surface-2 cursor-pointer transition-colors"
                      onClick={() => toggleFolder("files")}
                    >
                      {isExpanded("files") ? (
                        <FolderOpen size={16} className="text-mauve mr-2" />
                      ) : (
                        <Folder size={16} className="text-mauve mr-2" />
                      )}
                      <span className="text-sm">files</span>
                    </div>

                    {isExpanded("files") && (
                      <div className="ml-4">
                        {customFiles.map((file) => (
                          <div
                            key={file.id}
                            className={cn(
                              "flex items-center px-2 py-1 cursor-pointer group transition-colors",
                              activeFile === file.id && "bg-surface-2 text-text-primary",
                              "hover:bg-surface-2"
                            )}
                            onClick={() => onFileClick(file.id)}
                          >
                            <File size={16} className="text-blue mr-2" />
                            <span className="text-sm flex-1">{file.name}</span>
                            {onDeleteFile && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete ${file.name}?`)) {
                                    onDeleteFile(file.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red transition-opacity ml-2"
                                title="Delete file"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Projects folder */}
                <div>
                  <div
                    className="flex items-center px-2 py-1 hover:bg-surface-2 cursor-pointer transition-colors"
                    onClick={() => toggleFolder("projects")}
                  >
                    {isExpanded("projects") ? (
                      <FolderOpen size={16} className="text-yellow mr-2" />
                    ) : (
                      <Folder size={16} className="text-yellow mr-2" />
                    )}
                    <span className="text-sm">projects</span>
                  </div>

                  {isExpanded("projects") && (
                    <div className="ml-4">
                      {projectsData.map((project) => (
                        <div
                          key={project.id}
                          className={cn(
                            "flex items-center px-2 py-1 cursor-pointer group transition-colors",
                            activeFile === project.id && "bg-surface-2 text-text-primary",
                            "hover:bg-surface-2"
                          )}
                          onClick={() => onProjectClick(project)}
                        >
                          <File size={16} className="text-green mr-2" />
                          <span className="text-sm flex-1">{project.name}</span>
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-text-tertiary hover:text-blue"
                              >
                                <Github size={14} />
                              </a>
                            )}
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-text-tertiary hover:text-blue"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


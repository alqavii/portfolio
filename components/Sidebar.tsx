"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  File, 
  Folder, 
  FolderOpen, 
  ExternalLink, 
  Github, 
  Trash2, 
  Plus, 
  Search, 
  GitBranch, 
  Play, 
  Box, 
  Check, 
  Globe,
  Code2,
  X
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

export default function Sidebar({
  activeView = "explorer",
  openFiles,
  activeFile,
  onFileClick,
  onProjectClick,
  customFiles = [],
  onDeleteFile,
  onNewFile,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([
    "root", 
    "projects", 
    "files",
    "project-petral"
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [extensionQuery, setExtensionQuery] = useState("");

  useEffect(() => {
    setExpandedFolders((prev) => {
      const newFolders = [...prev];
      if (!newFolders.includes("root")) newFolders.push("root");
      if (!newFolders.includes("projects")) newFolders.push("projects");
      if (!newFolders.includes("project-petral")) newFolders.push("project-petral");
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

  // Search results
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const searchableItems = [
      {
        fileId: "alqavi.md",
        title: "alqavi.md",
        snippet: "About AlQavi Hasan • Chemical Engineering student at Imperial College London focused on quantitative finance and commodities markets (oil & refined products).",
      },
      {
        fileId: "projects/petral/README.md",
        title: "petral/README.md",
        snippet: "Petral Crude Oil Desk Dashboard • Nelson-Siegel parametric calibration, calendar spreads, roll yields.",
      },
      {
        fileId: "projects/petral/petral",
        title: "petral (Live Preview)",
        snippet: "Live crude oil trading desk dashboard deployed at petral.xyz.",
      },
      {
        fileId: "contact.md",
        title: "contact.md",
        snippet: "Contact info • Email: alqavihasan@gmail.com • GitHub: github.com/alqavii",
      },
      {
        fileId: "projects/qtc-quant/README.md",
        title: "qtc-quant/README.md",
        snippet: "Trading platform for QT Capital Alpha • Real-time data pipeline and live execution for 10+ teams.",
      },
      {
        fileId: "projects/ssvi-surface/README.md",
        title: "ssvi-surface/README.md",
        snippet: "SSVI Calibration and Visualization Tool • Volatility surface modeling for commodities & equity options.",
      },
    ];

    return searchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Extensions / Skills data
  const extensions = [
    {
      id: "commodities-quant",
      name: "Commodities Term Structure",
      publisher: "alqavi.hasan",
      version: "v2.4.0",
      description: "Nelson-Siegel forward curve fitting, calendar spreads, crack spread modeling & roll yield analytics.",
    },
    {
      id: "python-quant",
      name: "Python Quant Stack",
      publisher: "python.org",
      version: "v3.11",
      description: "NumPy, SciPy, Pandas, Scikit-learn for mathematical modeling, optimization & quantitative research.",
    },
    {
      id: "fastapi-pipelines",
      name: "FastAPI & Market Data",
      publisher: "qt-capital",
      version: "v1.2.0",
      description: "Production-grade execution infrastructure, Parquet storage pipelines, Alpaca-py integration.",
    },
    {
      id: "nextjs-dashboards",
      name: "Next.js & Streamlit UI",
      publisher: "vercel",
      version: "v16.0",
      description: "Next.js, TypeScript, Tailwind CSS, Streamlit & Plotly interactive volatility surfaces & desk dashboards.",
    },
  ];

  const filteredExtensions = extensions.filter(
    (ext) =>
      !extensionQuery.trim() ||
      ext.name.toLowerCase().includes(extensionQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(extensionQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-surface-0 text-text-secondary flex flex-col h-full border-r border-border select-none overflow-hidden font-mono text-xs">
      {/* ============================================================ */}
      {/* VIEW 1: EXPLORER                                             */}
      {/* ============================================================ */}
      {activeView === "explorer" && (
        <>
          <div className="px-4 py-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider border-b border-border bg-surface-0 flex items-center justify-between">
            <span>Explorer</span>
            <div className="flex items-center gap-1">
              {onNewFile && (
                <button
                  onClick={onNewFile}
                  className="p-1 hover:text-text-primary text-text-tertiary rounded hover:bg-surface-1 transition-colors"
                  title="New File"
                >
                  <Plus size={13} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
            <div className="select-none">
              {/* Root Workspace */}
              <div
                className="flex items-center px-3 py-1 hover:bg-surface-1/60 cursor-pointer transition-colors text-xs font-semibold text-text-primary"
                onClick={() => toggleFolder("root")}
              >
                {isExpanded("root") ? (
                  <FolderOpen size={14} className="text-blue mr-1.5" />
                ) : (
                  <Folder size={14} className="text-blue mr-1.5" />
                )}
                <span>ALQAVI</span>
              </div>

              {isExpanded("root") && (
                <div className="ml-3 pl-1.5 border-l border-border/40 space-y-0.5">
                  {/* alqavi.md file */}
                  <div
                    className={cn(
                      "flex items-center px-2 py-1 cursor-pointer transition-colors rounded-l",
                      activeFile === "alqavi.md"
                        ? "bg-surface-1 text-blue font-medium"
                        : "hover:bg-surface-1/60 text-text-secondary hover:text-text-primary"
                    )}
                    onClick={() => onFileClick("alqavi.md")}
                  >
                    <File size={13} className="text-blue mr-2 flex-shrink-0" />
                    <span className="truncate">alqavi.md</span>
                  </div>

                  {/* contact.md file */}
                  <div
                    className={cn(
                      "flex items-center px-2 py-1 cursor-pointer transition-colors rounded-l",
                      activeFile === "contact.md"
                        ? "bg-surface-1 text-mauve font-medium"
                        : "hover:bg-surface-1/60 text-text-secondary hover:text-text-primary"
                    )}
                    onClick={() => onFileClick("contact.md")}
                  >
                    <File size={13} className="text-mauve mr-2 flex-shrink-0" />
                    <span className="truncate">contact.md</span>
                  </div>

                  {/* Projects folder */}
                  <div className="mt-1">
                    <div
                      className="flex items-center px-2 py-1 hover:bg-surface-1/60 cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
                      onClick={() => toggleFolder("projects")}
                    >
                      {isExpanded("projects") ? (
                        <FolderOpen size={13} className="text-yellow mr-1.5 flex-shrink-0" />
                      ) : (
                        <Folder size={13} className="text-yellow mr-1.5 flex-shrink-0" />
                      )}
                      <span>projects</span>
                      <span className="ml-auto text-[10px] text-text-tertiary">
                        {projectsData.length}
                      </span>
                    </div>

                    {isExpanded("projects") && (
                      <div className="ml-2 pl-1.5 border-l border-border/40 space-y-0.5">
                        {projectsData.map((project) => {
                          const projectFolderId = `project-${project.id}`;
                          const isProjectFolderExpanded = isExpanded(projectFolderId);
                          const readmeId = `projects/${project.id}/README.md`;
                          const projectFileId = `projects/${project.id}/${project.name}`;

                          return (
                            <div key={project.id} className="mt-0.5">
                              <div
                                className="flex items-center px-2 py-1 hover:bg-surface-1/60 cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
                                onClick={() => toggleFolder(projectFolderId)}
                              >
                                {isProjectFolderExpanded ? (
                                  <FolderOpen size={13} className="text-yellow mr-1.5 flex-shrink-0" />
                                ) : (
                                  <Folder size={13} className="text-yellow mr-1.5 flex-shrink-0" />
                                )}
                                <span className="truncate">{project.name}</span>
                              </div>

                              {isProjectFolderExpanded && (
                                <div className="ml-2 pl-1.5 border-l border-border/40 space-y-0.5">
                                  {/* README.md */}
                                  <div
                                    className={cn(
                                      "flex items-center px-2 py-1 cursor-pointer transition-colors rounded-l",
                                      activeFile === readmeId
                                        ? "bg-surface-1 text-green font-medium"
                                        : "hover:bg-surface-1/60 text-text-secondary hover:text-text-primary"
                                    )}
                                    onClick={() => onFileClick(readmeId)}
                                  >
                                    <File size={13} className="text-green mr-2 flex-shrink-0" />
                                    <span>README.md</span>
                                  </div>

                                  {/* Project Live Iframe File */}
                                  <div
                                    className={cn(
                                      "flex items-center px-2 py-1 cursor-pointer group transition-colors rounded-l",
                                      activeFile === projectFileId
                                        ? "bg-surface-1 text-blue font-medium"
                                        : "hover:bg-surface-1/60 text-text-secondary hover:text-text-primary"
                                    )}
                                    onClick={() => onFileClick(projectFileId)}
                                  >
                                    <Globe size={13} className="text-blue mr-2 flex-shrink-0" />
                                    <span className="flex-1 truncate">{project.name}</span>
                                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 items-center">
                                      {project.githubUrl && (
                                        <a
                                          href={project.githubUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-text-tertiary hover:text-blue"
                                          title="GitHub Repo"
                                        >
                                          <Github size={12} />
                                        </a>
                                      )}
                                      {project.demoUrl && (
                                        <a
                                          href={project.demoUrl.replace("?embed=true", "")}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-text-tertiary hover:text-blue"
                                          title="Open external link"
                                        >
                                          <ExternalLink size={12} />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Custom Files folder */}
                  {customFiles.length > 0 && (
                    <div className="mt-1">
                      <div
                        className="flex items-center px-2 py-1 hover:bg-surface-1/60 cursor-pointer transition-colors text-text-secondary hover:text-text-primary"
                        onClick={() => toggleFolder("files")}
                      >
                        {isExpanded("files") ? (
                          <FolderOpen size={13} className="text-mauve mr-1.5 flex-shrink-0" />
                        ) : (
                          <Folder size={13} className="text-mauve mr-1.5 flex-shrink-0" />
                        )}
                        <span>files</span>
                        <span className="ml-auto text-[10px] text-text-tertiary">
                          {customFiles.length}
                        </span>
                      </div>

                      {isExpanded("files") && (
                        <div className="ml-2 pl-1.5 border-l border-border/40 space-y-0.5">
                          {customFiles.map((file) => (
                            <div
                              key={file.id}
                              className={cn(
                                "flex items-center px-2 py-1 cursor-pointer group transition-colors rounded-l",
                                activeFile === file.id
                                  ? "bg-surface-1 text-blue font-medium"
                                  : "hover:bg-surface-1/60 text-text-secondary hover:text-text-primary"
                              )}
                              onClick={() => onFileClick(file.id)}
                            >
                              <File size={13} className="text-blue mr-2 flex-shrink-0" />
                              <span className="flex-1 truncate">{file.name}</span>
                              {onDeleteFile && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete ${file.name}?`)) {
                                      onDeleteFile(file.id);
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red transition-opacity ml-1"
                                  title="Delete file"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* VIEW 2: SEARCH                                               */}
      {/* ============================================================ */}
      {activeView === "search" && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider border-b border-border bg-surface-0">
            Search
          </div>
          <div className="p-3 border-b border-border">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files and projects..."
                className="w-full bg-surface-1 border border-border rounded px-2.5 py-1 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-blue"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1.5 text-text-tertiary hover:text-text-primary"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1">
            {searchQuery && (
              <div className="text-[10px] text-text-tertiary px-2 py-1">
                {searchResults.length} result{searchResults.length === 1 ? "" : "s"} found
              </div>
            )}
            {searchResults.map((result) => (
              <div
                key={result.fileId}
                onClick={() => onFileClick(result.fileId)}
                className="p-2 rounded hover:bg-surface-1 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-blue font-medium">
                  <File size={12} />
                  <span>{result.title}</span>
                </div>
                <div className="text-[11px] text-text-tertiary mt-1 line-clamp-2 leading-relaxed">
                  {result.snippet}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 3: SOURCE CONTROL                                       */}
      {/* ============================================================ */}
      {activeView === "git" && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider border-b border-border bg-surface-0 flex items-center justify-between">
            <span>Source Control</span>
            <div className="flex items-center gap-1 text-[10px] text-green font-medium">
              <GitBranch size={12} />
              <span>main</span>
            </div>
          </div>
          <div className="p-3 border-b border-border text-[11px] text-text-secondary flex items-center justify-between">
            <span>alqavii/portfolio</span>
            <span className="text-green text-[10px]">Clean working tree</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-3">
            <div className="text-[11px] font-medium text-text-tertiary uppercase">Active Repositories</div>
            <div className="space-y-1">
              {[
                { name: "alqavii/petral", desc: "Crude oil trading desk dashboard", url: "https://github.com/alqavii/petral" },
                { name: "alqavii/portfolio", desc: "Interactive quant developer IDE", url: "https://github.com/alqavii/portfolio" },
                { name: "alqavii/qtc", desc: "QT Capital Alpha trading platform", url: "https://github.com/alqavii/qtc" },
                { name: "alqavii/ssvi-surface", desc: "SSVI options volatility surface", url: "https://github.com/alqavii/ssvi-surface" },
              ].map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded hover:bg-surface-1 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary group-hover:text-blue font-medium">{repo.name}</span>
                    <Github size={12} className="text-text-tertiary group-hover:text-blue" />
                  </div>
                  <div className="text-[10px] text-text-tertiary mt-0.5">{repo.desc}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 4: RUN AND DEBUG                                        */}
      {/* ============================================================ */}
      {activeView === "debug" && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider border-b border-border bg-surface-0">
            Run & Debug
          </div>
          <div className="p-3 border-b border-border text-[11px] text-text-secondary">
            <span>Configuration: </span>
            <span className="text-blue font-medium">Embedded Previews (Iframes)</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2">
            <div className="text-[10px] uppercase font-semibold text-text-tertiary mb-1">Available Targets</div>
            {projectsData.map((project) => (
              <div
                key={project.id}
                onClick={() => onFileClick(`projects/${project.id}/${project.name}`)}
                className="p-2 rounded hover:bg-surface-1 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Play size={12} className="text-green flex-shrink-0" />
                  <span className="text-text-primary group-hover:text-blue truncate">{project.displayName || project.name}</span>
                </div>
                <ExternalLink size={12} className="text-text-tertiary group-hover:text-text-primary flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 5: EXTENSIONS                                           */}
      {/* ============================================================ */}
      {activeView === "extensions" && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider border-b border-border bg-surface-0">
            Extensions
          </div>
          <div className="p-3 border-b border-border">
            <input
              type="text"
              value={extensionQuery}
              onChange={(e) => setExtensionQuery(e.target.value)}
              placeholder="Filter installed extensions..."
              className="w-full bg-surface-1 border border-border rounded px-2.5 py-1 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-blue"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1">
            {filteredExtensions.map((ext) => (
              <div
                key={ext.id}
                className="p-2 rounded hover:bg-surface-1 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text-primary">{ext.name}</span>
                  <span className="text-[10px] text-text-tertiary">{ext.version}</span>
                </div>
                <div className="text-[10px] text-blue">{ext.publisher}</div>
                <p className="text-[11px] text-text-tertiary line-clamp-2 leading-relaxed">
                  {ext.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

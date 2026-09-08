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
  Star,
  Activity,
  Code2,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders
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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Extension filter state
  const [extensionQuery, setExtensionQuery] = useState("");

  useEffect(() => {
    // Ensure root folder and petral are expanded on mount
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

  // Search results calculation
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
        snippet: "Petral Crude Oil Forward Curve & Term Structure Engine • Nelson-Siegel parametric calibration, calendar spreads, roll yields.",
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

  // Skills / Extensions data
  const extensions = [
    {
      id: "commodities-quant",
      name: "Commodities Term Structure & Spreads",
      author: "AlQavi Hasan",
      version: "v2.4.0",
      description: "Nelson-Siegel forward curve fitting, WTI/Brent calendar spreads, crack spread modeling & roll yield analytics.",
      rating: 5.0,
      tags: ["Quantitative", "Energy", "Oil"],
    },
    {
      id: "python-quant",
      name: "Python Quant & Scientific Stack",
      author: "Python Software Foundation",
      version: "v3.11",
      description: "NumPy, SciPy, Pandas, Scikit-learn, Matplotlib for mathematical modeling, optimization & quantitative research.",
      rating: 5.0,
      tags: ["Python", "Optimization", "Data"],
    },
    {
      id: "trading-engine",
      name: "FastAPI & Market Data Pipeline",
      author: "QT Capital Alpha",
      version: "v1.2.0",
      description: "Production-grade execution infrastructure, Parquet storage pipelines, Alpaca-py integration, live metrics.",
      rating: 4.9,
      tags: ["FastAPI", "Pipelines", "Execution"],
    },
    {
      id: "frontend-dashboard",
      name: "Next.js & Interactive Visualizations",
      author: "Next.js & Streamlit",
      version: "v14.2.0",
      description: "Next.js, TypeScript, Tailwind CSS, Streamlit & Plotly interactive volatility surfaces & dashboards.",
      rating: 4.9,
      tags: ["Next.js", "TypeScript", "UI"],
    },
  ];

  const filteredExtensions = extensions.filter(
    (ext) =>
      !extensionQuery.trim() ||
      ext.name.toLowerCase().includes(extensionQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(extensionQuery.toLowerCase()) ||
      ext.tags.some((t) => t.toLowerCase().includes(extensionQuery.toLowerCase()))
  );

  return (
    <div className="w-full bg-surface-0 text-text-secondary flex flex-col h-full border-r border-surface-2 select-none overflow-hidden font-mono">
      {/* VIEW 1: EXPLORER */}
      {activeView === "explorer" && (
        <>
          <div className="px-4 py-2.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider border-b border-surface-2 bg-surface-1 flex items-center justify-between">
            <span>Explorer</span>
            <div className="flex items-center gap-1">
              {onNewFile && (
                <button
                  onClick={onNewFile}
                  className="p-1 hover:text-text-primary text-text-tertiary rounded hover:bg-surface-2 transition-colors"
                  title="New File"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
            {/* Root folder */}
            <div className="select-none">
              <div
                className="flex items-center px-3 py-1.5 hover:bg-surface-2/60 cursor-pointer transition-colors text-xs font-bold text-text-primary"
                onClick={() => toggleFolder("root")}
              >
                {isExpanded("root") ? (
                  <FolderOpen size={15} className="text-blue mr-2" />
                ) : (
                  <Folder size={15} className="text-blue mr-2" />
                )}
                <span>ALQAVI-PORTFOLIO</span>
              </div>

              {isExpanded("root") && (
                <div className="ml-3 pl-2 border-l border-surface-2/40">
                  {/* alqavi.md file */}
                  <div
                    className={cn(
                      "flex items-center px-2 py-1.5 cursor-pointer transition-colors text-xs rounded-l",
                      activeFile === "alqavi.md"
                        ? "bg-surface-2 text-blue font-semibold"
                        : "hover:bg-surface-1 text-text-secondary"
                    )}
                    onClick={() => onFileClick("alqavi.md")}
                  >
                    <File size={14} className="text-blue mr-2 flex-shrink-0" />
                    <span className="truncate">alqavi.md</span>
                  </div>

                  {/* contact.md file */}
                  <div
                    className={cn(
                      "flex items-center px-2 py-1.5 cursor-pointer transition-colors text-xs rounded-l",
                      activeFile === "contact.md"
                        ? "bg-surface-2 text-mauve font-semibold"
                        : "hover:bg-surface-1 text-text-secondary"
                    )}
                    onClick={() => onFileClick("contact.md")}
                  >
                    <File size={14} className="text-mauve mr-2 flex-shrink-0" />
                    <span className="truncate">contact.md</span>
                  </div>

                  {/* Projects folder */}
                  <div className="mt-1">
                    <div
                      className="flex items-center px-2 py-1.5 hover:bg-surface-1 cursor-pointer transition-colors text-xs font-medium text-text-secondary"
                      onClick={() => toggleFolder("projects")}
                    >
                      {isExpanded("projects") ? (
                        <FolderOpen size={14} className="text-yellow mr-2 flex-shrink-0" />
                      ) : (
                        <Folder size={14} className="text-yellow mr-2 flex-shrink-0" />
                      )}
                      <span>projects</span>
                      <span className="ml-auto text-[10px] text-text-tertiary px-1.5 py-0.5 rounded bg-surface-2">
                        {projectsData.length}
                      </span>
                    </div>

                    {isExpanded("projects") && (
                      <div className="ml-2 pl-2 border-l border-surface-2/40">
                        {projectsData.map((project) => {
                          const projectFolderId = `project-${project.id}`;
                          const isProjectFolderExpanded = isExpanded(projectFolderId);
                          const readmeId = `projects/${project.id}/README.md`;
                          const projectFileId = `projects/${project.id}/${project.name}`;
                          const isPetral = project.id === "petral";

                          return (
                            <div key={project.id} className="mt-0.5">
                              <div
                                className="flex items-center px-2 py-1.5 hover:bg-surface-1 cursor-pointer transition-colors text-xs"
                                onClick={() => toggleFolder(projectFolderId)}
                              >
                                {isProjectFolderExpanded ? (
                                  <FolderOpen size={14} className={isPetral ? "text-green mr-2" : "text-yellow mr-2"} />
                                ) : (
                                  <Folder size={14} className={isPetral ? "text-green mr-2" : "text-yellow mr-2"} />
                                )}
                                <span className={cn(isPetral ? "text-text-primary font-bold" : "text-text-secondary")}>
                                  {project.name}
                                </span>
                                {isPetral && (
                                  <span className="ml-auto text-[9px] px-1 py-0.2 rounded bg-green/20 text-green font-bold">
                                    NEW
                                  </span>
                                )}
                              </div>

                              {isProjectFolderExpanded && (
                                <div className="ml-2 pl-2 border-l border-surface-2/40">
                                  {/* README.md file */}
                                  <div
                                    className={cn(
                                      "flex items-center px-2 py-1 cursor-pointer transition-colors text-xs rounded-l",
                                      activeFile === readmeId
                                        ? "bg-surface-2 text-green font-semibold"
                                        : "hover:bg-surface-1 text-text-secondary"
                                    )}
                                    onClick={() => onFileClick(readmeId)}
                                  >
                                    <File size={13} className="text-green mr-2 flex-shrink-0" />
                                    <span>README.md</span>
                                  </div>

                                  {/* Project demo file */}
                                  <div
                                    className={cn(
                                      "flex items-center px-2 py-1 cursor-pointer group transition-colors text-xs rounded-l",
                                      activeFile === projectFileId
                                        ? "bg-surface-2 text-blue font-semibold"
                                        : "hover:bg-surface-1 text-text-secondary"
                                    )}
                                    onClick={() => onFileClick(projectFileId)}
                                  >
                                    {isPetral ? (
                                      <Activity size={13} className="text-blue mr-2 flex-shrink-0" />
                                    ) : (
                                      <File size={13} className="text-blue mr-2 flex-shrink-0" />
                                    )}
                                    <span className="flex-1 truncate">
                                      {isPetral ? "simulator.py" : project.name}
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 items-center">
                                      {project.githubUrl && (
                                        <a
                                          href={project.githubUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-text-tertiary hover:text-blue p-0.5"
                                          title="GitHub Repo"
                                        >
                                          <Github size={12} />
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
                        className="flex items-center px-2 py-1.5 hover:bg-surface-1 cursor-pointer transition-colors text-xs"
                        onClick={() => toggleFolder("files")}
                      >
                        {isExpanded("files") ? (
                          <FolderOpen size={14} className="text-mauve mr-2" />
                        ) : (
                          <Folder size={14} className="text-mauve mr-2" />
                        )}
                        <span>custom-files</span>
                      </div>

                      {isExpanded("files") && (
                        <div className="ml-2 pl-2 border-l border-surface-2/40">
                          {customFiles.map((file) => (
                            <div
                              key={file.id}
                              className={cn(
                                "flex items-center px-2 py-1 cursor-pointer group transition-colors text-xs rounded-l",
                                activeFile === file.id
                                  ? "bg-surface-2 text-blue font-semibold"
                                  : "hover:bg-surface-1 text-text-secondary"
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
                                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red transition-opacity p-0.5"
                                  title="Delete"
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

      {/* VIEW 2: SEARCH */}
      {activeView === "search" && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider border-b border-surface-2 bg-surface-1">
            Search
          </div>
          <div className="p-3 border-b border-surface-2 bg-surface-0">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across files..."
                className="w-full bg-surface-1 border border-surface-2 rounded px-3 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-blue"
              />
              <Search size={14} className="absolute right-2.5 top-2 text-text-tertiary pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-1">
            {searchQuery && searchResults.length === 0 && (
              <div className="p-4 text-center text-xs text-text-tertiary">
                No matching results found.
              </div>
            )}
            {!searchQuery && (
              <div className="p-4 text-center text-xs text-text-tertiary">
                Type above to search bio, Petral, QTC, spreads, or skills.
              </div>
            )}
            {searchResults.map((result) => (
              <div
                key={result.fileId}
                onClick={() => onFileClick(result.fileId)}
                className="p-2.5 rounded hover:bg-surface-1 cursor-pointer transition-colors text-xs group"
              >
                <div className="flex items-center gap-1.5 font-bold text-blue group-hover:underline">
                  <File size={13} />
                  <span>{result.title}</span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                  {result.snippet}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: SOURCE CONTROL (GIT) */}
      {activeView === "git" && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider border-b border-surface-2 bg-surface-1 flex items-center justify-between">
            <span>Source Control: Git</span>
            <GitBranch size={14} className="text-blue" />
          </div>
          <div className="p-3 border-b border-surface-2 bg-surface-1/40">
            <div className="flex items-center gap-2 text-xs text-text-primary">
              <span className="font-bold">Branch:</span>
              <span className="px-2 py-0.5 rounded bg-surface-2 text-blue font-mono">main</span>
              <span className="text-[10px] text-green ml-auto">✓ Up to date</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-4">
            <div>
              <span className="text-[11px] uppercase font-bold text-text-tertiary block mb-2">
                Connected Repositories
              </span>
              <div className="space-y-1.5">
                {[
                  {
                    name: "petral",
                    desc: "Crude oil trading desk dashboard • petral.xyz",
                    url: "https://github.com/alqavii/petral",
                    tag: "FastAPI + Next.js",
                  },
                  {
                    name: "portfolio",
                    desc: "Interactive VS Code workstation portfolio",
                    url: "https://github.com/alqavii/portfolio",
                    tag: "Next.js",
                  },
                  {
                    name: "qtc",
                    desc: "QT Capital trading platform & backend pipeline",
                    url: "https://github.com/alqavii/qtc",
                    tag: "FastAPI",
                  },
                  {
                    name: "ssvi-surface",
                    desc: "SSVI calibration and visualization tool",
                    url: "https://github.com/alqavii/ssvi-surface",
                    tag: "Streamlit",
                  },
                ].map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2.5 rounded bg-surface-1 hover:bg-surface-2 border border-surface-2/60 transition-colors group text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary group-hover:text-blue transition-colors">
                        alqavii/{repo.name}
                      </span>
                      <ExternalLink size={12} className="text-text-tertiary group-hover:text-blue" />
                    </div>
                    <p className="text-[11px] text-text-tertiary mt-1">
                      {repo.desc}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: RUN AND DEBUG */}
      {activeView === "debug" && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider border-b border-surface-2 bg-surface-1">
            Run & Debug: Projects
          </div>
          <div className="p-3 border-b border-surface-2 bg-surface-1/40">
            <span className="text-[11px] text-text-secondary block">
              Kernel: <span className="text-green font-bold">Python 3.11 (Quant Engine)</span>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-3">
            {/* Petral Runner */}
            <div className="p-3 rounded-lg bg-surface-1 border border-surface-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">Petral Trading Desk</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green/20 text-green font-bold">LIVE</span>
              </div>
              <p className="text-[11px] text-text-tertiary">
                Launch institutional crude oil desk dashboard (petral.xyz) or run curve simulator.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://petral.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 rounded bg-blue/15 hover:bg-blue/25 text-blue border border-blue/30 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <ExternalLink size={12} />
                  <span>petral.xyz</span>
                </a>
                <button
                  onClick={() => onFileClick("projects/petral/petral")}
                  className="py-1.5 rounded bg-green/15 hover:bg-green/25 text-green border border-green/30 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Play size={12} />
                  <span>Simulator</span>
                </button>
              </div>
            </div>

            {/* QTC Quant Runner */}
            <div className="p-3 rounded-lg bg-surface-1 border border-surface-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">QT Capital Alpha Platform</span>
              </div>
              <p className="text-[11px] text-text-tertiary">
                Launch production trading system dashboard.
              </p>
              <button
                onClick={() => onFileClick("projects/qtc-quant/qtc-quant")}
                className="w-full py-1.5 rounded bg-blue/15 hover:bg-blue/25 text-blue border border-blue/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Play size={12} />
                <span>Open Dashboard</span>
              </button>
            </div>

            {/* SSVI Surface */}
            <div className="p-3 rounded-lg bg-surface-1 border border-surface-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">SSVI Volatility Surface</span>
              </div>
              <p className="text-[11px] text-text-tertiary">
                Calibrate parametric options smile surface.
              </p>
              <button
                onClick={() => onFileClick("projects/ssvi-surface/ssvi-surface")}
                className="w-full py-1.5 rounded bg-mauve/15 hover:bg-mauve/25 text-mauve border border-mauve/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Play size={12} />
                <span>Launch Streamlit App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: EXTENSIONS (SKILLS & TECH STACK) */}
      {activeView === "extensions" && (
        <div className="flex flex-col h-full">
          <div className="px-4 py-2.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider border-b border-surface-2 bg-surface-1 flex items-center justify-between">
            <span>Extensions: Tech Stack</span>
            <Box size={14} className="text-blue" />
          </div>
          <div className="p-3 border-b border-surface-2 bg-surface-0">
            <input
              type="text"
              value={extensionQuery}
              onChange={(e) => setExtensionQuery(e.target.value)}
              placeholder="Search skills & packages..."
              className="w-full bg-surface-1 border border-surface-2 rounded px-3 py-1.5 text-xs text-text-primary placeholder:text-text-tertiary outline-none focus:border-blue"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin space-y-2">
            {filteredExtensions.map((ext) => (
              <div
                key={ext.id}
                className="p-2.5 rounded bg-surface-1 border border-surface-2/60 hover:border-surface-3 transition-colors space-y-1.5 text-xs"
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h4 className="font-bold text-text-primary">{ext.name}</h4>
                    <span className="text-[10px] text-text-tertiary font-mono">{ext.author} • {ext.version}</span>
                  </div>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue/15 text-blue text-[10px] font-bold">
                    <Check size={10} /> Installed
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {ext.description}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {ext.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] px-1.5 py-0.2 rounded bg-surface-2 text-text-tertiary"
                    >
                      {t}
                    </span>
                  ))}
                  <div className="ml-auto flex items-center gap-0.5 text-yellow text-[10px]">
                    <Star size={10} fill="currentColor" />
                    <span>{ext.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

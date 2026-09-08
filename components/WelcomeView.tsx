"use client";

import React from "react";
import { 
  FileText, 
  Activity, 
  Terminal, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  FolderGit2, 
  Compass, 
  Command, 
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";
import projectsData from "@/data/projects.json";

interface WelcomeViewProps {
  onOpenFile: (file: string) => void;
  onOpenCommandPalette: () => void;
  onToggleTerminal: () => void;
}

export default function WelcomeView({
  onOpenFile,
  onOpenCommandPalette,
  onToggleTerminal,
}: WelcomeViewProps) {
  return (
    <div className="flex-1 h-full overflow-y-auto p-6 md:p-12 bg-base font-mono select-none scrollbar-thin text-text-primary">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="space-y-3 border-b border-surface-2 pb-6">
          <div className="flex items-center gap-2 text-xs text-blue">
            <Cpu size={16} />
            <span>PORTFOLIO WORKSTATION v2.0</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
            AlQavi Hasan
          </h1>
          <p className="text-sm md:text-base text-text-secondary max-w-2xl leading-relaxed">
            Chemical Engineering student at Imperial College London focused on quantitative finance, commodities term structure modeling, and systematic trading infrastructure.
          </p>
        </div>

        {/* Quick Start & Key Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Start Actions */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
              <Compass size={14} className="text-blue" />
              <span>Quick Start</span>
            </h2>

            <div className="space-y-2">
              <button
                onClick={() => onOpenFile("alqavi.md")}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-0 hover:bg-surface-1 border border-surface-2 hover:border-blue/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-blue/10 text-blue group-hover:bg-blue/20 transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary group-hover:text-blue transition-colors">
                      About AlQavi (alqavi.md)
                    </div>
                    <div className="text-xs text-text-secondary">
                      Bio, Imperial Algorithmic Trading Society leadership & experience
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-text-tertiary group-hover:text-blue group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onOpenFile("projects/petral/README.md")}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-0 hover:bg-surface-1 border border-surface-2 hover:border-green/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-green/10 text-green group-hover:bg-green/20 transition-colors">
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary group-hover:text-green transition-colors flex items-center gap-2">
                      <span>Petral Trading Desk Dashboard</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-green/20 text-green font-normal">petral.xyz</span>
                    </div>
                    <div className="text-xs text-text-secondary">
                      Sourced crude analytics, spreads, carry framing & Nelson-Siegel curves
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-text-tertiary group-hover:text-green group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onOpenFile("contact.md")}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-0 hover:bg-surface-1 border border-surface-2 hover:border-mauve/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-mauve/10 text-mauve group-hover:bg-mauve/20 transition-colors">
                    <FolderGit2 size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary group-hover:text-mauve transition-colors">
                      Get In Touch (contact.md)
                    </div>
                    <div className="text-xs text-text-secondary">
                      Direct email, phone, and GitHub profile links
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-text-tertiary group-hover:text-mauve group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={onToggleTerminal}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-0 hover:bg-surface-1 border border-surface-2 hover:border-yellow/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-yellow/10 text-yellow group-hover:bg-yellow/20 transition-colors">
                    <Terminal size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-primary group-hover:text-yellow transition-colors">
                      Interactive Terminal
                    </div>
                    <div className="text-xs text-text-secondary">
                      Run commands like <code className="text-yellow">petral</code>, <code className="text-yellow">projects</code>, <code className="text-yellow">theme</code>
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-text-tertiary group-hover:text-yellow group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Right: Featured Projects & Omnibar */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-peach" />
              <span>Featured Systems</span>
            </h2>

            <div className="space-y-2">
              {projectsData.map((project) => (
                <div
                  key={project.id}
                  onClick={() => onOpenFile(`projects/${project.id}/README.md`)}
                  className="p-3 rounded-lg bg-surface-0 hover:bg-surface-1 border border-surface-2 hover:border-surface-4 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary group-hover:text-blue transition-colors">
                      {project.displayName || project.name}
                    </span>
                    <span className="text-[11px] text-text-tertiary font-mono group-hover:text-text-secondary">
                      View README →
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Command Palette shortcut card */}
            <div
              onClick={onOpenCommandPalette}
              className="p-3 rounded-lg bg-surface-0/60 border border-dashed border-surface-3 hover:border-blue/50 transition-all cursor-pointer flex items-center justify-between text-xs text-text-secondary"
            >
              <div className="flex items-center gap-2">
                <Command size={14} className="text-blue" />
                <span>Search everything or jump to files</span>
              </div>
              <kbd className="px-2 py-0.5 rounded bg-surface-2 text-text-primary font-mono text-[10px] border border-surface-3">
                Ctrl + K
              </kbd>
            </div>
          </div>
        </div>

        {/* Footer shortcuts note */}
        <div className="pt-4 border-t border-surface-2 flex flex-wrap items-center justify-between text-xs text-text-tertiary gap-2">
          <div className="flex items-center gap-4">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-surface-2 text-text-secondary">Ctrl+K</kbd> to open Command Palette</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-surface-2 text-text-secondary">Ctrl+`</kbd> to toggle Terminal</span>
          </div>
          <div>Imperial College London • 2026</div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { 
  Folder, 
  Search, 
  GitBranch, 
  Play, 
  Box 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const items = [
    { id: "explorer", icon: Folder, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
    { id: "debug", icon: Play, label: "Run and Debug" },
    { id: "extensions", icon: Box, label: "Extensions" },
  ];

  return (
    <div className="w-12 bg-surface-0 flex flex-col items-center py-2 border-r border-surface-2/50">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        if (!Icon) {
          console.error(`Icon is undefined for item: ${item.id}`);
          return null;
        }
        
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded mb-1 transition-colors",
              isActive
                ? "bg-surface-2 text-blue"
                : "text-overlay-0 hover:text-text-primary hover:bg-surface-1"
            )}
            title={item.label}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </div>
  );
}


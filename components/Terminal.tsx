"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface TerminalLine {
  type: "input" | "output" | "error";
  text: string;
}

export default function Terminal({ isCollapsed, onToggle }: TerminalProps) {
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
    { type: "output", text: "Windows PowerShell" },
    { type: "output", text: "Copyright (C) Microsoft Corporation. All rights reserved." },
    { type: "output", text: "" },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentPath, setCurrentPath] = useState("C:\\Users\\alqavi");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsed && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleCommand = (command: string) => {
    if (!command.trim()) {
      // Empty command, just show prompt
      setTerminalHistory((prev) => [
        ...prev,
        { type: "input", text: `${currentPath}> ` },
      ]);
      return;
    }

    // Add the command to history
    setTerminalHistory((prev) => [
      ...prev,
      { type: "input", text: `${currentPath}> ${command}` },
    ]);

    // Handle special commands
    const cmd = command.toLowerCase().trim();
    if (cmd === "cls" || cmd === "clear") {
      setTerminalHistory([
        { type: "output", text: "Windows PowerShell" },
        { type: "output", text: "Copyright (C) Microsoft Corporation. All rights reserved." },
        { type: "output", text: "" },
      ]);
      return;
    }

    if (cmd === "cd" || cmd.startsWith("cd ")) {
      const newPath = command.substring(2).trim();
      if (newPath) {
        setCurrentPath(newPath);
        setTerminalHistory((prev) => [
          ...prev,
          { type: "output", text: "" },
        ]);
      } else {
        // Just "cd" without arguments - show current path
        setTerminalHistory((prev) => [
          ...prev,
          { type: "output", text: currentPath },
        ]);
      }
      return;
    }

    // For all other commands, show Windows error
    const commandName = command.split(" ")[0];
    const errorMessage = `'${commandName}' is not recognized as an internal or external command,\noperable program or batch file.`;
    
    setTerminalHistory((prev) => [
      ...prev,
      { type: "error", text: errorMessage },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(currentInput);
      setCurrentInput("");
    } else if (e.key === "Escape") {
      setCurrentInput("");
    }
  };

  return (
    <div
      className={cn(
        "bg-surface-0 border-t border-surface-2/50 flex flex-col transition-all duration-300",
        isCollapsed ? "h-8" : "h-48 md:h-64"
      )}
    >
      <div className="flex items-center justify-between px-4 py-1 bg-surface-2/30 border-b border-surface-2/50">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-text-tertiary" />
          <span className="text-xs text-text-tertiary">TERMINAL</span>
        </div>
        <button
          onClick={onToggle}
          className="text-text-tertiary hover:text-text-primary transition-colors"
        >
          {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      {!isCollapsed && (
        <div
          ref={terminalRef}
          className="flex-1 p-2 md:p-4 font-mono text-xs md:text-sm overflow-y-auto scrollbar-thin"
          onClick={() => inputRef.current?.focus()}
        >
          {terminalHistory.map((item, index) => (
            <div
              key={index}
              className={cn(
                "whitespace-pre-wrap",
                item.type === "input"
                  ? "text-green"
                  : item.type === "error"
                  ? "text-red"
                  : "text-text-secondary"
              )}
            >
              {item.text}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-green">{currentPath}&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-text-secondary outline-none border-none focus:text-text-primary"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
}


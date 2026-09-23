"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import projectsData from "@/data/projects.json";
import { THEMES, isTheme } from "@/lib/themes";

interface TerminalProps {
  isCollapsed: boolean;
  onToggle: () => void;
  height?: number;
  onOpenFile?: (file: string) => void;
  onSetTheme?: (theme: string) => void;
}

interface TerminalLine {
  type: "input" | "output" | "error";
  text: string;
}

const PROMPT = "PS C:\\Users\\alqavi>";

const GREETING: TerminalLine[] = [
  { type: "output", text: "Type 'help' to see available commands." },
  { type: "output", text: "" },
];

const THEME_IDS = THEMES.map((t) => t.id).join(", ");

const Terminal = forwardRef<HTMLDivElement, TerminalProps>(
  ({ isCollapsed, onToggle, height = 256, onOpenFile, onSetTheme }, ref) => {
    const [history, setHistory] = useState<TerminalLine[]>(GREETING);
    const [currentInput, setCurrentInput] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isCollapsed) inputRef.current?.focus();
    }, [isCollapsed]);

    useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [history]);

    const print = (...lines: (string | TerminalLine)[]) =>
      setHistory((prev) => [
        ...prev,
        ...lines.map((l) => (typeof l === "string" ? { type: "output" as const, text: l } : l)),
      ]);

    const openTarget = (arg: string): string | null => {
      const name = arg.replace(/\.md$/, "");
      if (name === "alqavi" || name === "about") return "alqavi.md";
      const project = projectsData.find((p) => p.id === name || p.id.startsWith(name));
      return project ? `projects/${project.id}/README.md` : null;
    };

    const handleCommand = (command: string) => {
      const trimmed = command.trim();
      setHistory((prev) => [...prev, { type: "input", text: `${PROMPT} ${command}` }]);
      if (!trimmed) return;

      const [rawCmd, ...rest] = trimmed.split(/\s+/);
      const cmd = rawCmd.toLowerCase();
      const arg = rest.join(" ").toLowerCase();

      switch (cmd) {
        case "clear":
        case "cls":
          setHistory([]);
          return;

        case "help":
          print(
            "  about           open alqavi.md",
            "  contact         show email and phone",
            "  ls              list projects",
            "  open <name>     open a file or project README",
            `  theme <name>    ${THEME_IDS}`,
            "  clear           clear the terminal",
            ""
          );
          return;

        case "about":
        case "whoami":
          print("AlQavi Hasan, 1st Year Chemical Engineering Student @ Sheffield", "");
          onOpenFile?.("alqavi.md");
          return;

        case "contact":
          print("alqavihasan@gmail.com", "+44 7392 516153", "");
          onOpenFile?.("alqavi.md");
          return;

        case "ls":
        case "dir":
          print(...projectsData.map((p) => `  ${p.name.padEnd(14)}${p.description}`), "");
          return;

        case "open":
        case "cat":
        case "code": {
          const target = arg ? openTarget(arg) : null;
          if (target) {
            onOpenFile?.(target);
          } else {
            print({ type: "error", text: arg ? `Cannot find '${arg}'.` : "Usage: open <name>" });
          }
          return;
        }

        case "theme":
          if (isTheme(arg)) {
            onSetTheme?.(arg);
          } else {
            print(`Themes: ${THEME_IDS}`);
          }
          return;

        default:
          print({
            type: "error",
            text: `${rawCmd}: The term '${rawCmd}' is not recognized. Type 'help' for commands.`,
          });
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-panel border-t border-border flex flex-col select-none flex-shrink-0",
          isCollapsed && "h-[35px]"
        )}
        style={!isCollapsed ? { height: `${height}px` } : undefined}
      >
        <div className="flex items-center justify-between h-[35px] px-2 flex-shrink-0">
          <div className="flex items-center h-full">
            <span className="px-2.5 h-full flex items-center text-xs uppercase tracking-wide text-text-primary border-b border-text-primary">
              Terminal
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={onToggle}
              className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-1"
              title={isCollapsed ? "Maximize Panel" : "Close Panel"}
            >
              {isCollapsed ? <ChevronUp size={16} /> : <X size={16} />}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div
            ref={scrollRef}
            className="flex-1 px-5 pb-2 font-mono text-[13px] leading-[19px] overflow-y-auto scrollbar-thin select-text"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "whitespace-pre-wrap min-h-[19px]",
                  line.type === "error" ? "text-red" : "text-text-primary"
                )}
              >
                {line.text}
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="flex-shrink-0 text-text-primary">{PROMPT}</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCommand(currentInput);
                    setCurrentInput("");
                  } else if (e.key === "Escape") {
                    setCurrentInput("");
                  }
                }}
                className="flex-1 bg-transparent text-text-primary outline-none font-mono text-[13px] caret-text-primary"
                spellCheck={false}
                aria-label="Terminal input"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

Terminal.displayName = "Terminal";

export default Terminal;

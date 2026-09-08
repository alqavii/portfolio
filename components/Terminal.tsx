"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronUp, ChevronDown, Terminal as TerminalIcon, Sparkles, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalProps {
  isCollapsed: boolean;
  onToggle: () => void;
  height?: number;
  onOpenFile?: (file: string) => void;
  onSetTheme?: (theme: string) => void;
}

interface TerminalLine {
  type: "input" | "output" | "error" | "success" | "accent";
  text: string;
}

const Terminal = forwardRef<HTMLDivElement, TerminalProps>(
  ({ isCollapsed, onToggle, height = 256, onOpenFile, onSetTheme }, ref) => {
    const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([
      { type: "output", text: "AlQavi Hasan • Quant Workstation Shell [Version 2.0.1]" },
      { type: "output", text: "Type 'help' for available commands, or click any shortcut below." },
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
      const trimmed = command.trim();
      if (!trimmed) {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "input", text: `${currentPath}> ` },
        ]);
        return;
      }

      setTerminalHistory((prev) => [
        ...prev,
        { type: "input", text: `${currentPath}> ${command}` },
      ]);

      const cmdParts = trimmed.split(" ");
      const cmd = cmdParts[0].toLowerCase();
      const arg = cmdParts.slice(1).join(" ").trim().toLowerCase();

      // Command: cls / clear
      if (cmd === "cls" || cmd === "clear") {
        setTerminalHistory([
          { type: "output", text: "AlQavi Hasan • Quant Workstation Shell [Version 2.0.1]" },
          { type: "output", text: "Type 'help' for available commands." },
          { type: "output", text: "" },
        ]);
        return;
      }

      // Command: help / commands
      if (cmd === "help" || cmd === "commands") {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "accent", text: "AVAILABLE COMMANDS:" },
          { type: "output", text: "  petral        - Run Nelson-Siegel crude oil forward curve calibration & simulator" },
          { type: "output", text: "  about         - View AlQavi's background, education & quant experience" },
          { type: "output", text: "  projects      - List quantitative systems & repositories" },
          { type: "output", text: "  skills        - Display tech stack and quantitative domains" },
          { type: "output", text: "  contact       - Display email, phone, and social channels" },
          { type: "output", text: "  open <file>   - Open file (e.g. 'open petral', 'open alqavi.md', 'open qtc')" },
          { type: "output", text: "  theme <name>  - Change theme (oled, vscode, tokyo, catppuccin)" },
          { type: "output", text: "  clear / cls   - Clear the terminal console" },
          { type: "output", text: "" },
        ]);
        return;
      }

      // Command: petral / run petral
      if (cmd === "petral" || (cmd === "run" && arg === "petral")) {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "accent", text: "[PETRAL DASHBOARD] Institutional Crude Oil Trading Desk Dashboard" },
          { type: "output", text: "  → Live URL:      https://petral.xyz" },
          { type: "output", text: "  → Backend API:   https://petral2.vercel.app" },
          { type: "output", text: "  → GitHub:        https://github.com/alqavii/petral" },
          { type: "output", text: "  → Synthesis:     Sourced & proxy-labelled data, benchmark board (WTI/Brent/Dubai)" },
          { type: "output", text: "  → Analytics:     Levels, spreads, z-scores, carry framing, consensus-vs-actual" },
          { type: "success", text: "  ✓ Calibration:   Pure-NumPy Nelson-Siegel forward curves (M1 -> M24)" },
          { type: "accent", text: "[Opening Petral overview & simulator in editor...]" },
          { type: "output", text: "" },
        ]);
        if (onOpenFile) {
          onOpenFile("projects/petral/README.md");
        }
        return;
      }

      // Command: about / bio
      if (cmd === "about" || cmd === "bio") {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "accent", text: "ALQAVI HASAN" },
          { type: "output", text: "  Chemical Engineering student at Imperial College London" },
          { type: "output", text: "  Focus: Quantitative finance, commodities term structure (oil & refined products)" },
          { type: "output", text: "  Role: Head of Back-End, Imperial Algorithmic Trading Society (QT Capital Alpha)" },
          { type: "output", text: "  Languages: English (native), Italian, Spanish" },
          { type: "output", text: "  Opening alqavi.md..." },
          { type: "output", text: "" },
        ]);
        if (onOpenFile) {
          onOpenFile("alqavi.md");
        }
        return;
      }

      // Command: projects
      if (cmd === "projects" || cmd === "ls" || cmd === "dir") {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "accent", text: "PORTFOLIO PROJECTS:" },
          { type: "output", text: "  1. petral       - Crude oil term structure & Nelson-Siegel curve engine" },
          { type: "output", text: "  2. qtc-quant    - QT Capital Alpha multi-team trading execution platform" },
          { type: "output", text: "  3. ssvi-surface - SSVI Volatility Surface calibration tool" },
          { type: "output", text: "  4. alqavi.md    - Personal introduction and leadership background" },
          { type: "output", text: "  5. contact.md   - Contact information & links" },
          { type: "output", text: "Type 'open <project>' to view any project." },
          { type: "output", text: "" },
        ]);
        return;
      }

      // Command: skills / stack
      if (cmd === "skills" || cmd === "stack") {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "accent", text: "TECHNICAL & QUANTITATIVE SKILLS:" },
          { type: "output", text: "  • Quant Modeling: Nelson-Siegel forward curves, SSVI surfaces, roll yields, spreads" },
          { type: "output", text: "  • Programming:    Python, TypeScript, SQL, Bash" },
          { type: "output", text: "  • Quant Libraries: NumPy, SciPy, Pandas, Scikit-learn, Matplotlib, Plotly" },
          { type: "output", text: "  • Infrastructure:  FastAPI, Parquet, Alpaca-py, WebSockets, Next.js, Docker" },
          { type: "output", text: "  • Commodities:    WTI/Brent crude, crack spreads, calendar spreads, OPEC flows" },
          { type: "output", text: "" },
        ]);
        return;
      }

      // Command: contact
      if (cmd === "contact") {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "accent", text: "CONTACT INFORMATION:" },
          { type: "output", text: "  Email:    alqavihasan@gmail.com" },
          { type: "output", text: "  Phone:    +44 7392 516153" },
          { type: "output", text: "  GitHub:   https://github.com/alqavii" },
          { type: "output", text: "  LinkedIn: https://linkedin.com/in/alqavi" },
          { type: "output", text: "" },
        ]);
        if (onOpenFile) {
          onOpenFile("contact.md");
        }
        return;
      }

      // Command: open <file>
      if (cmd === "open" || cmd === "cat") {
        if (!arg) {
          setTerminalHistory((prev) => [
            ...prev,
            { type: "error", text: "Usage: open <filename> (e.g. 'open petral', 'open alqavi.md')" },
          ]);
          return;
        }

        if (arg === "petral" || arg === "petral.md") {
          onOpenFile?.("projects/petral/README.md");
          setTerminalHistory((prev) => [...prev, { type: "success", text: "Opening Petral documentation..." }]);
          return;
        }
        if (arg === "alqavi" || arg === "alqavi.md" || arg === "about") {
          onOpenFile?.("alqavi.md");
          setTerminalHistory((prev) => [...prev, { type: "success", text: "Opening alqavi.md..." }]);
          return;
        }
        if (arg === "contact" || arg === "contact.md") {
          onOpenFile?.("contact.md");
          setTerminalHistory((prev) => [...prev, { type: "success", text: "Opening contact.md..." }]);
          return;
        }
        if (arg === "qtc" || arg === "qtc-quant") {
          onOpenFile?.("projects/qtc-quant/README.md");
          setTerminalHistory((prev) => [...prev, { type: "success", text: "Opening QTC Quant..." }]);
          return;
        }
        if (arg === "ssvi" || arg === "ssvi-surface") {
          onOpenFile?.("projects/ssvi-surface/README.md");
          setTerminalHistory((prev) => [...prev, { type: "success", text: "Opening SSVI Surface..." }]);
          return;
        }

        setTerminalHistory((prev) => [
          ...prev,
          { type: "error", text: `File not found: ${arg}. Try 'projects' to list available files.` },
        ]);
        return;
      }

      // Command: theme <name>
      if (cmd === "theme") {
        if (!arg) {
          setTerminalHistory((prev) => [
            ...prev,
            { type: "output", text: "Available themes: oled, vscode, tokyo, catppuccin" },
            { type: "output", text: "Example: theme oled" },
          ]);
          return;
        }

        const validThemes = ["oled", "vscode", "tokyo", "catppuccin"];
        if (validThemes.includes(arg)) {
          onSetTheme?.(arg);
          setTerminalHistory((prev) => [
            ...prev,
            { type: "success", text: `✓ Theme successfully set to '${arg}'` },
          ]);
        } else {
          setTerminalHistory((prev) => [
            ...prev,
            { type: "error", text: `Unknown theme: '${arg}'. Choose from: oled, vscode, tokyo, catppuccin` },
          ]);
        }
        return;
      }

      // Command: cd
      if (cmd === "cd") {
        if (arg) {
          setCurrentPath(arg);
          setTerminalHistory((prev) => [...prev, { type: "output", text: "" }]);
        } else {
          setTerminalHistory((prev) => [...prev, { type: "output", text: currentPath }]);
        }
        return;
      }

      // Fallback
      setTerminalHistory((prev) => [
        ...prev,
        {
          type: "error",
          text: `'${cmd}' is not recognized. Type 'help' to see supported commands.`,
        },
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

    const suggestions = ["help", "petral", "about", "projects", "skills", "contact", "theme oled", "clear"];

    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-0 border-t border-border flex flex-col font-mono select-none",
          isCollapsed ? "h-8 transition-all duration-300" : ""
        )}
        style={!isCollapsed ? { height: `${height}px` } : undefined}
      >
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-surface-1/70 border-b border-border">
          <div className="flex items-center gap-2">
            <TerminalIcon size={13} className="text-yellow" />
            <span className="text-[11px] font-bold text-text-secondary">QUANT TERMINAL</span>
            <span className="text-[10px] text-text-tertiary hidden sm:inline">• PowerShell 7</span>
          </div>

          {/* Quick suggestions pills */}
          {!isCollapsed && (
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
              {suggestions.slice(0, 6).map((s) => (
                <button
                  key={s}
                  onClick={() => handleCommand(s)}
                  className="px-2 py-0.5 rounded bg-surface-2/60 hover:bg-surface-3 text-[10px] text-text-secondary hover:text-text-primary transition-colors border border-border"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="text-text-tertiary hover:text-text-primary p-0.5 rounded transition-colors"
              title={isCollapsed ? "Expand Terminal" : "Collapse Terminal"}
            >
              {isCollapsed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        {/* Terminal Output Body */}
        {!isCollapsed && (
          <div
            ref={terminalRef}
            className="flex-1 p-3 font-mono text-xs overflow-y-auto scrollbar-thin space-y-0.5 bg-base"
            onClick={() => inputRef.current?.focus()}
          >
            {terminalHistory.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "whitespace-pre-wrap leading-relaxed",
                  item.type === "input"
                    ? "text-blue font-semibold"
                    : item.type === "error"
                    ? "text-red"
                    : item.type === "success"
                    ? "text-green font-semibold"
                    : item.type === "accent"
                    ? "text-yellow font-bold"
                    : "text-text-secondary"
                )}
              >
                {item.text}
              </div>
            ))}
            {/* Input Line */}
            <div className="flex items-center gap-2 mt-1.5 pt-1">
              <span className="text-green font-semibold flex-shrink-0">{currentPath}&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-text-primary outline-none font-mono text-xs"
                placeholder="Type command ('help', 'petral', 'projects')..."
                spellCheck={false}
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

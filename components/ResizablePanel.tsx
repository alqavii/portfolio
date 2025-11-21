"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: "horizontal" | "vertical";
  onResize?: (size: number) => void;
}

export default function ResizablePanel({
  children,
  defaultSize = 300,
  minSize = 100,
  maxSize = 800,
  direction = "horizontal",
  onResize,
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      let newSize: number;
      if (direction === "horizontal") {
        newSize = e.clientX;
      } else {
        newSize = e.clientY;
      }

      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
      onResize?.(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, direction, minSize, maxSize, onResize]);

  return (
    <>
      <div
        ref={panelRef}
        className={cn(
          "flex-shrink-0",
          direction === "horizontal" ? "w-px" : "h-px"
        )}
        style={
          direction === "horizontal"
            ? { width: `${size}px` }
            : { height: `${size}px` }
        }
      >
        {children}
      </div>
      <div
        className={cn(
          "flex-shrink-0 cursor-col-resize hover:bg-blue/20 transition-colors",
          direction === "horizontal" ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"
        )}
        onMouseDown={() => setIsResizing(true)}
      />
    </>
  );
}


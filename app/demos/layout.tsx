import type { Viewport } from "next";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function DemosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

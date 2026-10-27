import type { Metadata, Viewport } from "next";
import "../globals.css";

// Easter egg: the old VS Code-style site. Not linked from the homepage.
export const metadata: Metadata = {
  title: "alqavi.md · terminal",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#181818",
  maximumScale: 5,
};

export default function TerminalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

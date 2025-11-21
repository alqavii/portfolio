import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alqavi - Portfolio",
  description: "VS Code-themed interactive portfolio",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


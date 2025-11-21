import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlQavi's Portfolio",
  description: "All my projects :)",
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


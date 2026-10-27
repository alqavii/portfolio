import type { Metadata, Viewport } from "next";

const TAGLINE =
  "1st Year Chemical Engineering Student @ University of Sheffield · seeking commodity trading internships";

export const metadata: Metadata = {
  metadataBase: new URL("https://alqavi.xyz"),
  title: "AlQavi Hasan",
  description: TAGLINE,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "AlQavi Hasan",
    title: "AlQavi Hasan",
    description: TAGLINE,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "AlQavi Hasan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlQavi Hasan",
    description: TAGLINE,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
  ],
};

// Styles live with each route: app/home.css for the homepage,
// app/globals.css (Tailwind + VS Code tokens) for /terminal and /demos.
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

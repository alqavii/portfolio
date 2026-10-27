// Homepage project grid. Edit this array to add, reorder or hide cards.
// Thumbnails live in /public/thumbs at 16:10 (e.g. 1200x750). To swap a
// placeholder for a real screenshot, drop the file in and update `thumbnail`.

export interface Project {
  title: string;
  description: string;
  href: string;
  thumbnail: string;
  /** Opens in a new tab. */
  external: boolean;
  /** Set false to hide the card without deleting it. */
  visible: boolean;
}

export const projects: Project[] = [
  {
    title: "Petral",
    description: "Live crude oil market terminal: curves, spreads, arbs, flows",
    href: "https://petral.xyz",
    thumbnail: "/thumbs/petral.png",
    external: true,
    visible: true,
  },
  {
    title: "Trade Journal",
    description: "Weekly oil trade ideas and post-mortems",
    href: "/journal",
    thumbnail: "/thumbs/trade-journal.png",
    external: false,
    visible: false,
  },
  {
    title: "Market Models",
    description: "Excel crude arb, refinery margin and freight models",
    href: "/models",
    thumbnail: "/thumbs/market-models.png",
    external: false,
    visible: false,
  },
  {
    title: "Chokepoint",
    description: "Short videos on one commodity headline a week",
    // TODO: replace with the Chokepoint YouTube channel URL
    href: "https://www.youtube.com/@TODO-chokepoint",
    thumbnail: "/thumbs/chokepoint.png",
    external: true,
    visible: false,
  },
  {
    title: "QT Capital",
    description:
      "Multi-team live trading platform built for Imperial's algo trading society",
    href: "/demos/qtc",
    thumbnail: "/thumbs/qt-capital.png",
    external: false,
    visible: true,
  },
  {
    title: "SSVI Surface",
    description:
      "Arbitrage-free implied volatility surface fitted to market options",
    href: "/demos/ssvi",
    thumbnail: "/thumbs/ssvi-surface.png",
    external: false,
    visible: true,
  },
];

export const THEMES = [
  { id: "dark-modern", name: "Dark Modern" },
  { id: "dark-plus", name: "Dark+" },
] as const;

export const DEFAULT_THEME = "dark-modern";

export const THEME_STORAGE_KEY = "alqavi_portfolio_theme";

export function themeName(id: string) {
  return THEMES.find((t) => t.id === id)?.name ?? id;
}

export function isTheme(id: string) {
  return THEMES.some((t) => t.id === id);
}

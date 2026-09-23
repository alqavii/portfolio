import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        editor: "var(--theme-base)",
        surface: {
          DEFAULT: "var(--theme-surface-2)",
          "0": "var(--theme-surface-0)",
          "1": "var(--theme-surface-1)",
          "2": "var(--theme-surface-2)",
          "3": "var(--theme-surface-3)",
          "4": "var(--theme-surface-4)",
        },
        titlebar: "var(--theme-titlebar)",
        activitybar: "var(--theme-activitybar)",
        tab: "var(--theme-tab-inactive)",
        panel: "var(--theme-panel)",
        statusbar: {
          DEFAULT: "var(--theme-statusbar)",
          fg: "var(--theme-statusbar-fg)",
          hover: "var(--theme-statusbar-hover)",
        },
        input: "var(--theme-input)",
        text: {
          DEFAULT: "var(--theme-text-primary)",
          primary: "var(--theme-text-primary)",
          secondary: "var(--theme-text-secondary)",
          tertiary: "var(--theme-text-tertiary)",
        },
        blue: {
          DEFAULT: "var(--theme-blue)",
          light: "var(--theme-blue-light)",
        },
        green: "var(--theme-green)",
        red: "var(--theme-red)",
        yellow: "var(--theme-yellow)",
        peach: "var(--theme-peach)",
        mauve: "var(--theme-mauve)",
        accent: {
          DEFAULT: "var(--theme-accent)",
          muted: "var(--theme-accent-muted)",
        },
        border: {
          DEFAULT: "var(--theme-border)",
          strong: "var(--theme-border-strong)",
        },
      },
      borderColor: {
        DEFAULT: "var(--theme-border)",
      },
      fontFamily: {
        mono: [
          "Cascadia Code",
          "Consolas",
          "SFMono-Regular",
          "Menlo",
          "ui-monospace",
          "monospace",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe WPC",
          "Segoe UI",
          "system-ui",
          "Ubuntu",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["12px", { lineHeight: "18px" }],
        base: ["13px", { lineHeight: "20px" }],
        md: ["14px", { lineHeight: "22px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["19px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["28px", { lineHeight: "36px" }],
      },
      maxWidth: {
        prose: "72ch",
      },
    },
  },
  plugins: [],
};

export default config;

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
        base: {
          DEFAULT: "var(--theme-base)",
          "50": "var(--theme-surface-3)",
          "100": "var(--theme-surface-4)",
          "200": "#6c7086",
          "300": "#7f849c",
          "400": "#9399b2",
          "500": "#a6adc8",
          "600": "#bac2de",
          "700": "#cdd6f4",
          "800": "#f5e0dc",
          "900": "#f9e2af",
        },
        surface: {
          DEFAULT: "var(--theme-surface-2)",
          "0": "var(--theme-surface-0)",
          "1": "var(--theme-surface-1)",
          "2": "var(--theme-surface-2)",
          "3": "var(--theme-surface-3)",
          "4": "var(--theme-surface-4)",
        },
        overlay: {
          DEFAULT: "var(--theme-text-tertiary)",
          "0": "var(--theme-text-tertiary)",
          "1": "var(--theme-text-secondary)",
          "2": "var(--theme-text-primary)",
        },
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
        lavender: {
          DEFAULT: "var(--theme-blue-light)",
        },
        sapphire: {
          DEFAULT: "var(--theme-blue)",
        },
        sky: {
          DEFAULT: "var(--theme-blue-light)",
        },
        teal: {
          DEFAULT: "var(--theme-green)",
        },
        green: {
          DEFAULT: "var(--theme-green)",
        },
        yellow: {
          DEFAULT: "var(--theme-yellow)",
        },
        peach: {
          DEFAULT: "var(--theme-peach)",
        },
        maroon: {
          DEFAULT: "var(--theme-red)",
        },
        red: {
          DEFAULT: "var(--theme-red)",
        },
        mauve: {
          DEFAULT: "var(--theme-mauve)",
        },
        pink: {
          DEFAULT: "var(--theme-mauve)",
        },
        flamingo: {
          DEFAULT: "var(--theme-peach)",
        },
        rosewater: {
          DEFAULT: "#f5e0dc",
        },
        themeBorder: "var(--theme-border)",
        border: "var(--theme-border)",
        accent: "var(--theme-accent)",
      },
      borderColor: {
        DEFAULT: "var(--theme-border)",
        border: "var(--theme-border)",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "'Liberation Mono'",
          "'Courier New'",
          "monospace",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(56, 189, 248, 0.2)" },
          "100%": { boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

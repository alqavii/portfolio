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
        // Catppuccin Mocha Theme
        base: {
          DEFAULT: "#1e1e2e",
          "50": "#45475a",
          "100": "#585b70",
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
          DEFAULT: "#313244",
          "0": "#181825", // Mantle - darkest, for sidebars
          "1": "#1e1e2e", // Base - main background
          "2": "#313244", // Surface0 - panels
          "3": "#45475a", // Surface1 - hover states
          "4": "#585b70", // Surface2 - active states
        },
        overlay: {
          DEFAULT: "#6c7086",
          "0": "#6c7086",
          "1": "#7f849c",
          "2": "#9399b2",
        },
        text: {
          DEFAULT: "#cdd6f4",
          "primary": "#cdd6f4",
          "secondary": "#bac2de",
          "tertiary": "#a6adc8",
        },
        blue: {
          DEFAULT: "#89b4fa",
          light: "#b4befe",
        },
        lavender: {
          DEFAULT: "#b4befe",
        },
        sapphire: {
          DEFAULT: "#74c7ec",
        },
        sky: {
          DEFAULT: "#89dceb",
        },
        teal: {
          DEFAULT: "#94e2d5",
        },
        green: {
          DEFAULT: "#a6e3a1",
        },
        yellow: {
          DEFAULT: "#f9e2af",
        },
        peach: {
          DEFAULT: "#fab387",
        },
        maroon: {
          DEFAULT: "#eba0ac",
        },
        red: {
          DEFAULT: "#f38ba8",
        },
        mauve: {
          DEFAULT: "#cba6f7",
        },
        pink: {
          DEFAULT: "#f5c2e7",
        },
        flamingo: {
          DEFAULT: "#f2cdcd",
        },
        rosewater: {
          DEFAULT: "#f5e0dc",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;


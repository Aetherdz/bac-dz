import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        raised: "rgb(var(--raised) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        "brand-ink": "rgb(var(--brand-ink) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "IBM Plex Sans Arabic", "Segoe UI", "Tahoma", "sans-serif"],
        display: ["var(--font-display)", "Amiri", "Georgia", "serif"],
      },
      maxWidth: {
        shell: "1240px",
        prose: "68ch",
      },
      borderRadius: {
        card: "2px",
      },
      boxShadow: {
        none: "none",
      },
      keyframes: {
        in: { from: { opacity: "0", transform: "translateY(3px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        in: "in 220ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

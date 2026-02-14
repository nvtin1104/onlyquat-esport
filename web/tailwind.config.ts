import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--bg-tertiary) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
        },
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-tertiary": "rgb(var(--text-tertiary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          secondary: "rgb(var(--border-secondary) / <alpha-value>)",
        },
        accent: {
          blue: "#0EA5E9",
          "blue-hover": "#0284C7",
          "blue-light": "#38BDF8",
          "blue-dark": "#0369A1",
          purple: "#9333ea",
          red: "#EF4444",
          gold: "#FFD700",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        heading: ["Rajdhani", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      screens: {
        xs: "475px",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px #0EA5E9" },
          "50%": { boxShadow: "0 0 20px #0EA5E9" },
        },
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 6s ease infinite",
        "glow-blue": "glow 2s ease-in-out infinite",
        "pulse-live": "pulse-live 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

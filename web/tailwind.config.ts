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
        surface: {
          DEFAULT: "#0f1117",
          raised: "#161b26",
          overlay: "#1c2333",
          border: "#2a3344",
        },
        muted: {
          DEFAULT: "#8b95a8",
          dim: "#5c6578",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.35)",
        soft: "0 2px 12px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;

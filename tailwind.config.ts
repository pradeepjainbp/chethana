import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sage: {
          DEFAULT: "var(--sage)",
          light: "var(--sage-light)",
          dark: "var(--sage-dark)",
        },
        cream: {
          DEFAULT: "var(--cream)",
          mid: "var(--cream-mid)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          mid: "var(--ink-mid)",
          soft: "var(--ink-soft)",
        },
        gold: "var(--gold)",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-dm-serif)", "Georgia", "serif"],
        mono: ["var(--font-jb-mono)", "monospace"],
      }
    },
  },
  plugins: [],
};
export default config;

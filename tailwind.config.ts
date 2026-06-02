import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-soft": "var(--paper-soft)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        accent: "var(--accent)",
        "accent-deep": "var(--accent-deep)",
        "accent-alt": "var(--accent-alt)",
        "accent-alt-deep": "var(--accent-alt-deep)",
        line: "var(--line)",
      },
      fontFamily: {
        head: ["var(--font-sans)", "system-ui", "sans-serif"],
        body: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

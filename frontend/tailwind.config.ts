import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // One accent colour; everything else is neutral (stone).
        accent: {
          50: "#eef6f5",
          100: "#d5ebe8",
          200: "#acd6d0",
          500: "#2b8a80",
          600: "#1f7168",
          700: "#195b54",
          800: "#154a45",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,25,23,.04), 0 1px 3px rgba(28,25,23,.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;

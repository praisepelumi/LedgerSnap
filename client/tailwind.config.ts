import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', "serif"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        ink: {
          50: "#F5F3F0",
          100: "#EBE7E0",
          200: "#D6CFC2",
          300: "#B8AE9C",
          400: "#9A8E76",
          500: "#7C6E50",
          600: "#5E5038",
          700: "#3F3420",
          800: "#2A2215",
          900: "#15110A",
        },
        receipt: {
          cream: "#FEFCF3",
          paper: "#FBF8EF",
          line: "#E8E1D0",
          stamp: "#C14533",
          highlight: "#F0C75E",
          success: "#4A9F6E",
          warning: "#D4913D",
          danger: "#B84233",
        },
      },
      boxShadow: {
        receipt:
          "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)",
        "receipt-hover":
          "0 4px 12px rgba(0,0,0,0.1), 0 12px 32px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;

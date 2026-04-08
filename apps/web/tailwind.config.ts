import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/shared/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#11243e",
        cream: "#fbf5ea",
        coral: "#f97360",
        gold: "#f6b94c",
        teal: "#1c9a9c",
        mist: "#e6f0ef"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      boxShadow: {
        card: "0 18px 40px rgba(17, 36, 62, 0.12)"
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at top left, rgba(28,154,156,0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(249,115,96,0.18), transparent 40%)"
      }
    }
  },
  plugins: []
};

export default config;

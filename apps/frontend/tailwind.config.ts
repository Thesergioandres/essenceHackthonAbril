import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/infrastructure/ui/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f8f6ef",
        accent: "#0f766e",
        ember: "#c2410c",
        ink: "#1f2937"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
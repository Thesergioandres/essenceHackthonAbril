import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/infrastructure/ui/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f8f9fa",
        background: "#f8f9fa",
        accent: "#006d37",
        ember: "#c2410c",
        ink: "#191c1d",
        primary: "#006d37",
        "primary-container": "#27ae60",
        "primary-fixed-dim": "#61de8a",
        "on-primary": "#ffffff",
        "on-primary-container": "#00391a",
        secondary: "#944a00",
        "secondary-container": "#fc8f34",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#663100",
        tertiary: "#006497",
        "tertiary-container": "#509fda",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#003451",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#191c1d",
        "on-surface-variant": "#3d4a3f",
        outline: "#6d7a6e",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2"
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
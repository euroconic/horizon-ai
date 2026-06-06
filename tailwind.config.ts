import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0c0f1a",
        panel: "#141a2b",
        edge: "#1f2740",
        accent: "#6ea8fe",
        warn: "#f5c451",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["var(--font-nunito)", "sans-serif"],
        fredoka: ["var(--font-fredoka)", "cursive"],
        lora: ["var(--font-lora)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

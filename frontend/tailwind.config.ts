import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#211d19",
        cream: "#f8f5ef",
        wine: "#572b35",
        gold: "#bd965d",
        sage: "#68745d"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(43, 32, 24, .08)"
      }
    }
  },
  plugins: []
};

export default config;

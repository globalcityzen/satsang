import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sankalpa: {
          purple: "#7F77DD",
          "purple-light": "#EEEDFE",
          "purple-mid": "#AFA9EC",
          "purple-dark": "#534AB7",
          "purple-deep": "#3C3489",
        },
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

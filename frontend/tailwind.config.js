/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink:   "rgb(var(--color-ink)   / <alpha-value>)",
        ash:   "rgb(var(--color-ash)   / <alpha-value>)",
        fog:   "rgb(var(--color-fog)   / <alpha-value>)",
        sun:   "rgb(var(--color-sun)   / <alpha-value>)",
        moss:  "rgb(var(--color-moss)  / <alpha-value>)",
        sky:   "rgb(var(--color-sky)   / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter Tight'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

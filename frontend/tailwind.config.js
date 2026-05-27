/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f4ee",       // warm off-white
        ink: "#1a1a1a",
        ash: "#5c5b58",
        fog: "#d8d4cb",
        sun: "#e3611d",         // burnt orange accent
        moss: "#3d4a3a",        // deep forest secondary
        sky: "#a8b5b8",
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

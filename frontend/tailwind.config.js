/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // ROBO+ EduTech palette, sampled directly from the logo
      colors: {
        ink: {
          950: "#142850",
          900: "#1f3f80",
          800: "#24488c",
          700: "#2f57a0",
          500: "#5b6b8f",
          300: "#a2b0cf",
        },
        paper: {
          50: "#ffffff",
          100: "#f4f6fb",
          200: "#e8ecf5",
          300: "#d7deec",
        },
        ledger: {
          600: "#2a9aab",
          500: "#3ac2d5",
          400: "#5ccede",
          100: "#dbf3f7",
        },
        gold: {
          500: "#e8b928",
          100: "#faf0d1",
        },
        rust: {
          600: "#c73a1a",
          500: "#ee4a24",
          100: "#fbdcd2",
        },
      },
      fontFamily: {
        display: ["Poppins", "Helvetica Neue", "sans-serif"],
        sans: ["Inter", "Helvetica Neue", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

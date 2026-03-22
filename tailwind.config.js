/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      animation: {
        "float-slow": "float 14s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
      },
      fontFamily: {
        sans: [
          '"Segoe UI"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: [
          '"Segoe UI"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      keyframes: {
        float: {
          "0%, 100%": {
            transform: "translate3d(0, 0, 0)",
            opacity: "0.55",
          },
          "50%": {
            transform: "translate3d(0, -18px, 0)",
            opacity: "0.9",
          },
        },
        drift: {
          "0%, 100%": {
            transform: "translate3d(0, 0, 0) scale(1)",
            opacity: "0.45",
          },
          "50%": {
            transform: "translate3d(20px, -12px, 0) scale(1.04)",
            opacity: "0.8",
          },
        },
      },
    },
  },
  plugins: [],
};

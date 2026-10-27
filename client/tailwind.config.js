/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./App.jsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        headline: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        body: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        display: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        mono: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        michroma: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
      },
    },
  },
  plugins: [],
}

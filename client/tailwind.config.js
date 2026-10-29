/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./App.jsx"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F5F2FB", 100: "#EBE4F6", 200: "#D5C8EC", 300: "#B6A1DD", 400: "#9175CA",
          500: "#6E4DB3", 600: "#5B379C", 700: "#4B2683", 800: "#3D1F6B", 900: "#2D1750", 950: "#1C0E33",
        },
        navy: {
          50: "#F0F2F8", 100: "#DEE2EF", 200: "#BCC4DF", 300: "#94A0C9", 400: "#6B7BAF", 500: "#4E5F96",
          600: "#3A4B83", 700: "#2B3C73", 800: "#21305D", 900: "#172246", 950: "#0D1430",
        },
        ink: { DEFAULT: "#1A1D2B", soft: "#4A4F63", muted: "#7C8196", faint: "#A6AABB" },
        line: { DEFAULT: "#E8E9F0", soft: "#F1F2F6" },
        surface: { DEFAULT: "#FFFFFF", subtle: "#F7F7FA", sunken: "#F1F1F6" },
        ok: { 50: "#ECFBF3", 100: "#D3F5E3", 600: "#16A065", 700: "#0E7F50" },
        warn: { 50: "#FFF7EB", 100: "#FDECCB", 600: "#C27806", 700: "#9A5D02" },
        bad: { 50: "#FDEFF0", 100: "#FAD9DC", 600: "#D33A49", 700: "#AE2533" },
        info: { 50: "#EEF4FF", 100: "#DCE7FE", 600: "#3563D9", 700: "#2649AE" },
      },
      fontFamily: {
        sans: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        headline: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        body: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        display: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        mono: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
        michroma: ["'29LT Bukra'", "'F29LT Bukra'", "'29LTBukra'", "sans-serif"],
      },
      fontSize: { "2xs": ["0.6875rem", { lineHeight: "1rem" }] },
      borderRadius: { xl: "0.875rem", "2xl": "1.125rem", "3xl": "1.5rem" },
      boxShadow: {
        card: "0 1px 2px rgba(20, 16, 48, 0.04), 0 1px 1px rgba(20, 16, 48, 0.03)",
        lift: "0 6px 20px -8px rgba(45, 23, 80, 0.18), 0 2px 6px -2px rgba(45, 23, 80, 0.08)",
        cta: "0 8px 20px -8px rgba(75, 38, 131, 0.55)",
        nav: "0 -1px 0 rgba(20,16,48,0.06), 0 -8px 24px -12px rgba(20,16,48,0.12)",
      },
    },
  },
  plugins: [],
}

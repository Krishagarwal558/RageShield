import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#111111",
          900: "#1b1b1f",
          700: "#3a3a44",
          500: "#666776",
          300: "#a8aab7",
          100: "#eef0f4"
        },
        calm: {
          50: "#f7fbfa",
          100: "#edf6f2",
          300: "#b7d9cf",
          500: "#4b9f8d",
          700: "#287566"
        },
        signal: {
          low: "#37a875",
          mid: "#c59c27",
          high: "#c95252"
        }
      },
      boxShadow: {
        panel: "0 16px 42px rgba(16, 24, 40, 0.14)"
      }
    }
  },
  plugins: []
}

export default config

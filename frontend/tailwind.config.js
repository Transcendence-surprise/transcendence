/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
      },
      colors: {
        // Brand colors
        "cyan-bright": "var(--color-cyan-bright)",
        magenta: "var(--color-magenta)",
        pink: "var(--color-pink)",

        // Animation colors
        "blue-hero": "var(--color-blue-hero)",
        "purple-hero": "var(--color-purple-hero)",
        "cyan-teal": "var(--color-cyan-teal)",

        // Backgrounds
        "bg-dark": "var(--color-bg-dark)",
        "bg-dark-primary": "var(--color-bg-dark-primary)",
        "bg-dark-secondary": "var(--color-bg-dark-secondary)",
        "bg-dark-tertiary": "var(--color-bg-dark-tertiary)",
        "bg-modal": "var(--color-bg-modal)",

        // Text colors
        "light-cyan": "var(--color-text-light-cyan)",
        "lighter-cyan": "var(--color-text-lighter-cyan)",
        "lightest-cyan": "var(--color-text-lightest-cyan)",
        "muted-400": "var(--color-text-gray-400)",
        "muted-500": "var(--color-text-gray-500)",
        "muted-600": "var(--color-text-gray-600)",

        // Borders
        "border-subtle": "var(--color-border-subtle)",
        "border-blue": "var(--color-border-blue)",
        "border-cyan": "var(--color-border-cyan)",
        "border-pink": "var(--color-border-pink)",

        // Game board
        "cell-border": "var(--color-cell-border)",
        "tile-i": "var(--color-tile-i)",
        "tile-l": "var(--color-tile-l)",
        "tile-t": "var(--color-tile-t)",
        "tile-x": "var(--color-tile-x)",

        // Interactive
        "button-cyan-bg": "var(--color-button-cyan-bg)",
        "button-cyan-hover": "var(--color-button-cyan-hover)",

        // Optional compatibility colors
        white: "#FFFFFF",
        black: "#000000",
        gray: {
          300: "#d1d5db",
          400: "#9ca3af",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        blue: {
          600: "#2563eb",
        },
        green: {
          400: "#4ade80",
        },
        cyan: {
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#06b6d4",
          500: "#06b6d4",
        },
        "pink-400": "#f472b6",
      },
    },
  },
  plugins: [],
};
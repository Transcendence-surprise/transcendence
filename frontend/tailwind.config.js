/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
      },

      colors: {
        /* Brand */
        white: "var(--color-white)",
        "cyan-bright": "var(--color-cyan-bright)",
        magenta: "var(--color-magenta)",
        pink: "var(--color-pink)",

        /* Hero / canvas */
        "blue-hero": "var(--color-blue-hero)",
        "purple-hero": "var(--color-purple-hero)",
        "cyan-teal": "var(--color-cyan-teal)",

        /* Backgrounds */
        "bg-dark": "var(--color-bg-dark)",
        "bg-dark-primary": "var(--color-bg-dark-primary)",
        "bg-dark-secondary": "var(--color-bg-dark-secondary)",
        "bg-dark-tertiary": "var(--color-bg-dark-tertiary)",
        "bg-modal": "var(--color-bg-modal)",

        /* Text-like colors */
        "light-cyan": "var(--color-light-cyan)",
        "lighter-cyan": "var(--color-lighter-cyan)",
        "lightest-cyan": "var(--color-lightest-cyan)",
        "cyan-100": "var(--color-cyan-100)",
        "cyan-400": "var(--color-cyan-400)",
        "gray-400": "var(--color-gray-400)",
        "gray-500": "var(--color-gray-500)",
        "gray-600": "var(--color-gray-600)",
        "border-softgray": "var(--color-border-softgray, #D1D5DB)", // softer, modern border
        "text-muted": "var(--color-text-muted, #9CA3AF)", // instead of gray-400
        "text-soft": "var(--color-text-soft, #6B7280)", // instead of gray-500
        "text-hover": "var(--color-text-hover, #D1D5DB)", // instead of gray-300

        /* Borders / utility colors */
        "border-subtle": "var(--color-border-subtle)",
        "border-blue": "var(--color-border-blue)",
        "border-cyan": "var(--color-border-cyan)",
        "border-pink": "var(--color-border-pink)",
        "border-gray": "var(--color-border-gray)",

        /* Game board */
        "cell-border": "var(--color-cell-border)",
        "tile-i": "var(--color-tile-i)",
        "tile-l": "var(--color-tile-l)",
        "tile-t": "var(--color-tile-t)",
        "tile-x": "var(--color-tile-x)",

        /* Buttons */
        "button-hover": "var(--color-button-hover)",
        "button-gray": "var(--color-button-gray)",
        "button-cyan-bg": "var(--color-button-cyan-bg)",
        "button-cyan-hover": "var(--color-button-cyan-hover)",

        /* Icons */
        "icon-red": "var(--color-icon-red)",
      },

      boxShadow: {
        "cyan-glow": "var(--shadow-cyan-glow)",
        "cyan-glow-12": "var(--shadow-cyan-glow-12)",
        "cyan-light": "var(--shadow-cyan-light)",
        "cyan-light-sm": "var(--shadow-cyan-light-sm)",
        "dark-lg": "var(--shadow-dark-lg)",
        "cyan-lg": "var(--shadow-cyan-lg)",
        "cyan-md": "var(--shadow-cyan-md)",
      },

      spacing: {
        cell: "var(--size-cell)",
        "cell-border": "var(--size-cell-border)",
        "cell-content": "var(--size-cell-content)",
        sidebar: "var(--size-sidebar-width)",
        "sidebar-item": "var(--size-sidebar-item-height)",
        indicator: "var(--size-sidebar-indicator)",
        "button-icon": "var(--size-button-icon)",
        "button-arrow": "var(--size-button-icon-arrow)",
      },
    },
  },
  plugins: [],
};
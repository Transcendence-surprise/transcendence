/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      montserrat: ['Montserrat', 'sans-serif'],
      dm: ['DM Sans', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#262626',
        'dark-tertiary': '#333333',
        'dark-accent': '#404040',
        'code-green': '#00b894',
        'code-orange': '#fdcb6e',
        'code-red': '#e74c3c',
      }
    },
  },
  plugins: [],
}

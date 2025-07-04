/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'grape': '#a472b4',
        'lilac': '#8f93cf',
        'sky':   '#86b1cc',
        'mint':  '#90ccc0',
        'sage':  '#c5dbbb',
        'primary': '#8f93cf', // lilac
        'secondary': '#86b1cc', // sky
        'accent': '#a472b4', // grape
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}

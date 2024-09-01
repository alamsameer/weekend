/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust the paths according to your project structure
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0000FF', // Primary color
        secondary: '#22BB72', // Secondary color
        bgprimary:'#151515',
        bgsecondary:'#202020'
      },
      backgroundImage: {
        'gradient-highlight': 'linear-gradient(90deg, #0000FF 0%, #22BB72 100%)', // Linear gradient
      },
    },
  },
  plugins: [],
}


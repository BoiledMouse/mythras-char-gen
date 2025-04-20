// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      backgroundImage: {
        'wood': "url('/assets/wood.jpg')",
        'parchment': "url('/assets/parchment.jpg')",
      },
      fontFamily: {
        display: ['\"Pirata One\"', 'serif'],
        body: ['\"EB Garamond\"', 'serif'],
      },
    },
  },
  plugins: [],
}

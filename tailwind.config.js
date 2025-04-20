const path = require('path');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      // (removed backgroundImage entry; using manual CSS classes instead)
      backgroundImage: {},
      fontFamily: {
        display: ['"Pirata One"', 'serif'],
        body: ['"EB Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
};

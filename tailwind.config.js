// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37', // custom color for highlights
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none', // remove default max-width so panels go full width
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

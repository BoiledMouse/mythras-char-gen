/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#bfa85e',
          light:   '#e0c46c',
          dark:    '#a78a3e'
        },
        parchment: '#f9f1dc'
      },
      fontFamily: {
        display: ['Merriweather', 'serif'],
        body:    ['Merriweather', 'serif']
      },
      backgroundImage: theme => ({
        'parchment-pattern': "url('/images/parchment-texture.png')"
      }),
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            a: {
              color: theme('colors.gold.DEFAULT'),
              '&:hover': { color: theme('colors.gold.dark') }
            },
            h1: { color: theme('colors.gold.dark'), fontFamily: theme('fontFamily.display').join(', ') },
            h2: { color: theme('colors.gold.dark'), fontFamily: theme('fontFamily.display').join(', ') },
            strong: { color: theme('colors.gray.900') },
            'blockquote p': { color: theme('colors.gray.700'), fontStyle: 'italic' }
          }
        }
      })
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};

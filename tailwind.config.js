// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        parchment: "#F5DEB3",
      },
      backgroundImage: theme => ({
        // fine diagonal wood‑grain lines
        'wood-grain': `
          repeating-linear-gradient(
            135deg,
            rgba(0,0,0,0.03) 0px,
            rgba(0,0,0,0.03) 1px,
            transparent 1px,
            transparent 4px
          )
        `,
        // you can tweak the rgba/spacing to taste
      }),
      typography: (theme) => ({
        DEFAULT: {
          css: { maxWidth: 'none' },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        tavernWood: '#3b2b1f',       // deep brown
        parchment: '#f5e1c8',        // warm parchment
        parchmentShadow: '#ceb89f',  // a little darker for texture
      },
      backgroundImage: {
        // simulate woodgrain with layered gradients
        'wood-grain': `
          linear-gradient(90deg,
            rgba(59,43,31,1) 0%,
            rgba(59,43,31,0.9) 2%,
            rgba(59,43,31,1) 4%,
            transparent 4%,
            transparent 6%,
            rgba(59,43,31,0.9) 6%,
            rgba(59,43,31,1) 8%,
            transparent 8%,
            transparent 10%,
            rgba(59,43,31,0.9) 10%,
            rgba(59,43,31,1) 12%
          ),
          repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.05),
            rgba(255,255,255,0.05) 1px,
            transparent 1px,
            transparent 3px
          )
        `,
        // subtle noise for parchment
        'parchment-texture': `
          radial-gradient(circle at top left,
            rgba(0,0,0,0.03),
            transparent 70%
          ),
          repeating-linear-gradient(
            45deg,
            rgba(0,0,0,0.02),
            rgba(0,0,0,0.02) 2px,
            transparent 2px,
            transparent 4px
          )
        `,
      },
    },
  },
  plugins: [],
}

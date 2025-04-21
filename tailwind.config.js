// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        "gold-dark": "#B7950B",
        parchment: "#F5E1C8",
        "parchment-shadow": "#CEB89F",
        "wood-grain": "#3B2B1F",
      },
      backgroundImage: {
        // a subtle repeating parchment texture via CSS
        "parchment-texture":
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.5) 2px, transparent 2px, transparent 4px)",
        // a faint wood‑grain stripe
        "wood-grain-texture":
          "repeating-linear-gradient(90deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7) 1px, transparent 1px, transparent 4px)"
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

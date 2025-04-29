// FILE: tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#00C853', // Green accent
      },
    },
  },
  plugins: [],
}

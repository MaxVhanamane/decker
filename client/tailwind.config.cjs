module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        'bg-max': 'conic-gradient(from 0deg at 50% 50%, red 0deg, blue 120deg, green 360deg)',
       
      },
      keyframes: {
        changeBgDark: {
          "0%, 100%": {  "background-image": "linear-gradient(to left, blue,#0284c7,blue)",
       
          "background-size":"200%",
          "background-position":"right"
      
        },
          "50%": { "background-image": "linear-gradient(to right,blue,#0284c7,blue)",
         
          "background-size":"200%",
          "background-position":"left"},
         
        },
        changeBgLight: {
          "0%, 100%": {  "background-image": "linear-gradient(to left, #6d28d9,#0d9488,#06b6d4)",
       
          "background-size":"200%",
          "background-position":"right"
      
        },
          "50%": { "background-image": "linear-gradient(to right,#06b6d4,#0d9488,#6d28d9)",
         
          "background-size":"200%",
          "background-position":"left"},
         
        },
        rotate: {
          "0%": { "transform":"rotate(45deg)"
      
        },
          "100%": {"transform":"rotate(405deg)"},
         
        },
      },
      
      animation: {
        changeBgLight: "changeBgLight 5s ease-in-out infinite",
        changeBgDark: "changeBgDark 5s ease-in-out infinite",
        rotate: "rotate 10s linear infinite",

      },
      
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};

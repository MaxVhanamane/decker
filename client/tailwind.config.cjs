module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
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
         
        }
      },
      
      animation: {
        changeBgLight: "changeBgLight 5s ease-in-out infinite",
        changeBgDark: "changeBgDark 5s ease-in-out infinite"

      },
      
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};

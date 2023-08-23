module.exports = {
  future: {
    // now the hover features will only be applied when it is applicable, i.e., on Desktops, Laptops or anything with a pointer really.
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        'xs': '370px',
        'ms': '400px'
      },
      keyframes: {

        rotate: {
          "0%": {
            "transform": "rotate(45deg)"

          },
          "100%": { "transform": "rotate(405deg)" },

        },
        translateFromLeftToRight: {
          "0%": {
            "transform": "translateX(-100%)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"
          },
          "100%": { 
          "transform": "translateX(0)",
          "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"

        },

        },
        translateFromRightToLeft: {
          "0%": {
            "transform": "translateX(0)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"


          },
          "100%": { 
          "transform": "translateX(-100%)",
          "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"

        },

        },
        opacity: {
          "0%": {
            "opacity": "0",
          },
      
          "100%": { 
          "opacity": "1",

        },

        }
      },

      animation: {

        rotate: "rotate 10s linear infinite",
        translateFromLeftToRight: "translateFromLeftToRight 0.3s ease-in-out 1",
        translateFromRightToLeft: "translateFromRightToLeft 0.3s ease-in-out 1",
        opacity: "opacity 0.6s linear 1",

      },

    },
  },
};

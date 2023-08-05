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
      },

      animation: {

        rotate: "rotate 10s linear infinite",

      },

    },
  },
};

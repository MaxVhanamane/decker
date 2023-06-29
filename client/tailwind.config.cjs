module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {

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
  plugins: [require('@tailwindcss/line-clamp')],
};

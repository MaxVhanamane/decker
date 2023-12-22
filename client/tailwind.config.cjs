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
      backgroundImage: ({ theme }) => ({
        BgForDarkMode: `linear-gradient(to right,${theme('colors.slate.950')},${theme('colors.slate.700')},${theme('colors.slate.900')})`,
        lightBg: `linear-gradient(to right,${theme('colors.slate.300')},${theme('colors.slate.200')},${theme('colors.slate.100')})`,
      }),
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
        translateFromLeftToRightSearch: {
          "0%": {
            "transform": "translateX(100%)",
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
        translateFromBottomToTop: {
          "0%": {
            "transform": "translateY(0)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",


          },
          "100%": {
            "transform": "translateY(-100%)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",

          },

        },

        translateFromTopToBottom: {
          "0%": {
            "transform": "translateY(-100%)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
            "opacity": "0",

          },
          "100%": {
            "transform": "translateY(0)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
            "opacity": "1",

          },

        },
        opacity: {
          "0%": {
            "opacity": "0",
          },

          "100%": {
            "opacity": "1",

          },

        },
        opacityFadeOut: {
          "0%": {
            "opacity": "1",
          },

          "100%": {
            "opacity": "0",

          },

        },
        scaleUp: {
          "0%": {
            "scale": "0",
          },

          "100%": {
            "scale": "1",

          },

        },
        scaleDown: {
          "0%": {
            "scale": "1",
          },

          "100%": {
            "scale": "0",

          },

        },
        opacityFadeOutAndSlide: {
          "0%": {
            "opacity": "1",
          },

          "50%": {
            "opacity": "0",

          },
          "100%": {
            "left": "100%",
            "opacity": "0",

          },

        },
        opacityFadeInAndSlide: {
          "0%": {
            "opacity": "0",
          },

          "50%": {
            "opacity": "1",

          },
          "100%": {
            "left": "0px",
            "opacity": "1",

          },

        },

      },

      animation: {

        rotate: "rotate 10s linear infinite",
        translateFromLeftToRight: "translateFromLeftToRight 0.3s ease-in-out 1",
        translateFromLeftToRightSearch: "translateFromLeftToRightSearch 0.3s ease-in-out 1",
        translateFromRightToLeft: "translateFromRightToLeft 0.3s ease-in-out 1",
        translateFromBottomToTop: "translateFromBottomToTop 0.5s ease-in-out 1",
        translateFromTopToBottom: "translateFromTopToBottom 0.5s ease-in-out 1",
        opacityFadeIn: "opacity 0.6s linear 1",
        scaleUp: "scaleUp 0.2s linear 1",
        scaleDown: "scaleDown 0.4s linear 1",
        quickOpacity: "opacity 0.3s linear 1",
        opacity_page_transition: "opacity 0.2s linear 1",
        opacityFadeOut: "opacityFadeOut 0.25s linear 1",
        opacityFadeOutAndSlide: "opacityFadeOutAndSlide 0.25s linear 1",
        opacityFadeInAndSlide: "opacityFadeInAndSlide 0.25s linear 1",

      },

    },
  },
};

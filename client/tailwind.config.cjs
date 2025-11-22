const plugin = require('tailwindcss/plugin')
module.exports = {

  future: {
    // now the hover features will only be applied when it is applicable, i.e., on Desktops, Laptops or anything with a pointer really.
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [
    plugin(function ({ addUtilities, addVariant }) {
      addUtilities({
        ".scrollbar-gutter": {
          "scrollbar-gutter": "stable",
        },
      });
      addVariant('sidebar-open', '.sidebar-open &');
      addVariant('sidebar-closed', '[data-sidebar="closed"] &');
    }),
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        customInter: ['customInter', 'Arial',
          'Helvetica',
          'sans-serif'],
      },

      boxShadow: {
        '4-sides': '0 0 1rem -0.15rem rgba(0,0,0,0)',
        'bulb': '0px 0px 175px 100px transparent',
      },
      screens: {
        'xs': '370px',
        'ms': '400px',
        'sm-mid': { 'min': '640px', 'max': '767px' },
      },
      backgroundImage: ({ theme }) => ({
        BgForDarkMode: `linear-gradient(to right,#020617,${theme('colors.slate.700')},${theme('colors.slate.900')})`,
        BgDarkModeSmall: `linear-gradient(135deg, ${theme('colors.slate.900')}, ${theme('colors.slate.800')}, ${theme('colors.gray.900')})`,
        lightBg: `linear-gradient(to right,${theme('colors.slate.300')},${theme('colors.slate.200')},${theme('colors.slate.100')})`,
        lightBgSmall: `linear-gradient(135deg,${theme('colors.sky.200')},${theme('colors.slate.200')},${theme('colors.sky.200')})`,
        radialGradient: 'radial-gradient(#0284c7,rgba(12, 123, 179, 0))',
      }),
      keyframes: {
        'spinner-fade': {
          from: { opacity: '1' },
          to: { opacity: '0.25' },
        },
        marquee: {
          "0%": {
            "transform": "translateX(100%)"
          },
          "100%": {
            "transform": "translateX(-100%)"
          }
        },

        rotate: {
          "0%": {
            "transform": "rotate(45deg)"

          },
          "100%": { "transform": "rotate(405deg)" },

        },
        scaleUpDown: {
          "0%": {
            "scale": "0.9"

          },
          "100%": { "scale": "1" },

        },
        translateFromLeftToRight: {
          "0%": {
            "transform": "translateX(-100%)",
          },
          "100%": {
            "transform": "translateX(0)",

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

          },
          "100%": {
            "transform": "translateX(-100%)",
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

        animateFromRightToLeftToastRight: {
          "0%": {
            "transform": "translateX(110%)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",


          },
          "100%": {
            "transform": "translateX(0)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
        animateFromLeftToRightToastRight: {
          "0%": {
            "transform": "translateX(0)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
          },
          "100%": {
            "transform": "translateX(110%)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
          },

        },
        translateToRightThenBottom: {
          "0%": {
            transform: "translateX(0)", // Start from current position
          },

          "100%": {
            transform: "translateX(calc(100vw - var(--to-right) - 100%)) translateY(calc(100vh - var(--to-bottom) - 100%)) scale(0.5)", // Move to the bottom
          },
        }
        ,


        animateFromRightToLeftToastLeft: {
          "0%": {
            "transform": "translateX(0)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
          },
          "100%": {
            "transform": "translateX(-110%)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
        animateFromLeftToRightToastLeft: {
          "0%": {
            "transform": "translateX(-110%)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
          },
          "100%": {
            "transform": "translateX(0)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
          },

        },

        animateFromRightToLeftMobile: {
          "0%": {

            "transform": "translateX(110%)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
          },
          "100%": {
            "transform": "translateX(0%)",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",

          },
        },



        progressBar: {

          "100%": {
            right: "100%"
          }
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
        scaleUp90: {
          "0%": {
            "scale": "0.9",
            "opacity": "0",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"

          },

          "100%": {
            "scale": "1",
            "opacity": "1",
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"



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
        scaleDown100: {

          "100%": {
            "scale": "1",

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
        flickerStrokeTungsten: {
          "0%": {
            stroke: "#080e2366",
          },
          "1%": {
            stroke: "#a5f3fc",
          },
          "1.001%": {
            stroke: "#080e2366",
          },
          "10%": {
            stroke: "#080e2366",
          },
          "11.001%": {
            stroke: "#a5f3fc",
          },
          "11.002%": {
            stroke: "#080e2366",
          },
          "12%": {
            stroke: "#a5f3fc",
          },
          "39.999%": {
            stroke: "#a5f3fc",
          },
          "40%": {
            stroke: "#080e2366",
          },
          "41%": {
            stroke: "#a5f3fc",
          },
          "41.001%": {
            stroke: "#080e2366",
          },
          "75%": {
            stroke: "#080e2366",
          },
          "75.5%": {
            stroke: "#a5f3fc",
          },
          "75.501%": {
            stroke: "#080e2366",
          },
          "80%": {
            stroke: "#080e2366",
          },
          "81.001%": {
            stroke: "#a5f3fc",
          },
          "81.002%": {
            stroke: "#080e2366",
          },
          "82%": {
            stroke: "#a5f3fc",
          },
          "82.001%": {
            stroke: "#a5f3fc",
          },
          "82.002%": {
            stroke: "#080e2366",
          },
          "83%": {
            stroke: "#a5f3fc",
          },
          "83.001%": {
            stroke: "#080e2366",
          },
          "83.002%": {
            stroke: "#a5f3fc",
          },
          "83.003%": {
            stroke: "#080e2366",
          },
          "88%": {
            stroke: "#a5f3fc",
          },
          "100%": {
            stroke: "#a5f3fc",
          },
        },


        flickerDark: {
          "0%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "1%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "1.001%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "10%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "11.001%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "11.002%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "12%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "39.999%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "40%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "41%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "41.001%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "75%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "75.5%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "75.501%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "80%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "81.001%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "81.002%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "82%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "82.001%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "82.002%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "83%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "83.001%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "83.002%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "83.003%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "88%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "100%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          }
        },
        flickerLight: {
          "0%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "1%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "1.001%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "10%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "11.001%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "11.002%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "12%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "39.999%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "40%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "41%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "41.001%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "75%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "75.5%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "75.501%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "80%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "81.001%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "81.002%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "82%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "82.001%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "82.002%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "83%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "83.001%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "83.002%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "83.003%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "88%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          },
          "100%": {
            "background": "#38bdf8",
            "box-shadow": "0px 0px var(--flicker-shadow-blur, 175px) var(--flicker-shadow-spread, 100px) var(--flicker-shadow-color, rgba(2, 132, 199, 1))"
          }
        },

        flickerShadowLeftExtraSmallDark: {
          "0%": {

            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "1%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "1.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "10%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "11.001%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "11.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "12%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },

          "39.999%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "40%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "41%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "41.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },

          "75%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "75.5%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "75.501%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },

          "80%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "81.001%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "81.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "82%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "82.001%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "82.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "83%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "83.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "83.002%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "83.003%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "88%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "100%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          }

        },
        flickerShadowRightExtraSmallDark: {
          "0%": {

            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "1%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "1.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "10%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "11.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "11.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "12%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },

          "39.999%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "40%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "41%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "41.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },

          "75%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "75.5%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "75.501%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },

          "80%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "81.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "81.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "82%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "82.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "82.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "83%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "83.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "83.002%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "83.003%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "88%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "100%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          }

        },
        flickerShadowRightExtraSmallLight: {
          "0%": {

            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "1%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "1.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "10%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "11.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "11.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "12%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },

          "39.999%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "40%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "41%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "41.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },

          "75%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "75.5%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "75.501%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },

          "80%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "81.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "81.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "82%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "82.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "82.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "83%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "83.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "83.002%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "83.003%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "88%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          },
          "100%": {
            "box-shadow": "-12px 12px 0px 4.5px #38bdf8"
          }

        },
        flickerShadowLeftExtraSmallLight: {
          "0%": {

            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "1%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "1.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "10%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "11.001%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "11.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "12%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },

          "39.999%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "40%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "41%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "41.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },

          "75%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "75.5%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "75.501%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },

          "80%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "81.001%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "81.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "82%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "82.001%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "82.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "83%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "83.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "83.002%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "83.003%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "88%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          },
          "100%": {
            "box-shadow": "12px 12px 0px 4.5px #38bdf8"
          }

        },
        flickerBgDark: {
          "0%": {
            "background": "#1e293b",
          },
          "1%": {
            "background": "#38bdf8",
          },
          "1.001%": {
            "background": "#1e293b",
          },
          "10%": {
            "background": "#1e293b",
          },
          "11.001%": {
            "background": "#38bdf8",
          },
          "11.002%": {
            "background": "#1e293b",
          },
          "12%": {
            "background": "#38bdf8",
          },

          "39.999%": {
            "background": "#38bdf8",
          },
          "40%": {
            "background": "#1e293b",
          },
          "41%": {
            "background": "#38bdf8",
          },
          "41.001%": {
            "background": "#1e293b",
          },

          "75%": {
            "background": "#1e293b",
          },
          "75.5%": {
            "background": "#38bdf8",
          },
          "75.501%": {
            "background": "#1e293b",
          },

          "80%": {
            "background": "#1e293b",
          },
          "81.001%": {
            "background": "#38bdf8",
          },
          "81.002%": {
            "background": "#1e293b",
          },
          "82%": {
            "background": "#38bdf8",
          },
          "82.001%": {
            "background": "#38bdf8",
          },
          "82.002%": {
            "background": "#1e293b",
          },
          "83%": {
            "background": "#38bdf8",
          },
          "83.001%": {
            "background": "#1e293b",
          },
          "83.002%": {
            "background": "#38bdf8",
          },
          "83.003%": {
            "background": "#1e293b",
          },
          "88%": {
            "background": "#38bdf8",
          },
          "100%": {
            "background": "#38bdf8",

          }

        },
        flickerBgLight: {
          "0%": {
            "background": "#9ca3af",
          },
          "1%": {
            "background": "#38bdf8",
          },
          "1.001%": {
            "background": "#9ca3af",
          },
          "10%": {
            "background": "#9ca3af",
          },
          "11.001%": {
            "background": "#38bdf8",
          },
          "11.002%": {
            "background": "#9ca3af",
          },
          "12%": {
            "background": "#38bdf8",
          },

          "39.999%": {
            "background": "#38bdf8",
          },
          "40%": {
            "background": "#9ca3af",
          },
          "41%": {
            "background": "#38bdf8",
          },
          "41.001%": {
            "background": "#9ca3af",
          },

          "75%": {
            "background": "#9ca3af",
          },
          "75.5%": {
            "background": "#38bdf8",
          },
          "75.501%": {
            "background": "#9ca3af",
          },

          "80%": {
            "background": "#9ca3af",
          },
          "81.001%": {
            "background": "#38bdf8",
          },
          "81.002%": {
            "background": "#9ca3af",
          },
          "82%": {
            "background": "#38bdf8",
          },
          "82.001%": {
            "background": "#38bdf8",
          },
          "82.002%": {
            "background": "#9ca3af",
          },
          "83%": {
            "background": "#38bdf8",
          },
          "83.001%": {
            "background": "#9ca3af",
          },
          "83.002%": {
            "background": "#38bdf8",
          },
          "83.003%": {
            "background": "#9ca3af",
          },
          "88%": {
            "background": "#38bdf8",
          },
          "100%": {
            "background": "#38bdf8",

          }

        },

        swingBulb: {
          "0%": { transform: "rotate(0deg)" },
          "10%": { transform: "rotate(-28deg)" },
          "20%": { transform: "rotate(28deg)" },
          "30%": { transform: "rotate(-25deg)" },
          "40%": { transform: "rotate(25deg)" },
          "50%": { transform: "rotate(-20deg)" },
          "60%": { transform: "rotate(20deg)" },
          "70%": { transform: "rotate(-10deg)" },
          "80%": { transform: "rotate(10deg)" },
          "90%": { transform: "rotate(-3deg)" },  // Smaller final oscillations
          "95%": { transform: "rotate(3deg)" },
          "99%": { transform: "rotate(0deg)" },  // Tiny final movement
          "100%": { transform: "rotate(0deg)" }   // Comes to a rest smoothly
        },

        triangulate: {
          "0%, 100%": { transform: "none" },
          "33.333%": { transform: "translate(120%, 175%)" },
          "66.666%": { transform: "translate(-95%, 175%)" },
        },
        grow0: {
          "0%, 100%": { transform: "scale(1.5)" },
          "20%, 70%": { transform: "none" },
        },

      },

      animation: {
        triangulate: "triangulate 1.25s ease infinite",
        grow0: "grow0 1.25s ease infinite",
        grow0Delay1: "grow0 1.25s ease -0.666s infinite",
        grow0Delay2: "grow0 1.25s ease -0.333s infinite",
        'spinner-bar': 'spinner-fade 1s linear infinite',
        marquee: "marquee 10s linear 1",
        rotate: "rotate 10s linear forwards infinite",
        translateFromLeftToRight: "translateFromLeftToRight 0.2s ease-out 1",
        translateFromLeftToRightSearch: "translateFromLeftToRightSearch 0.3s ease-out 1",
        translateFromRightToLeft: "translateFromRightToLeft 0.2s ease-out forwards 1",
        translateFromBottomToTop: "translateFromBottomToTop 0.5s ease-out 1",
        translateFromTopToBottom: "translateFromTopToBottom 0.5s ease-out 1",
        animateFromRightToLeftToastRight: "animateFromRightToLeftToastRight 0.5s forwards ease-in-out 1",
        animateFromLeftToRightToastRight: "animateFromLeftToRightToastRight 0.5s forwards ease-in-out 1",
        animateFromRightToLeftToastLeft: "animateFromRightToLeftToastLeft 0.5s forwards ease-in-out 1",
        animateFromLeftToRightToastLeft: "animateFromLeftToRightToastLeft 0.5s forwards ease-in-out 1",
        animateFromRightToLeftMobile: "animateFromRightToLeftMobile 0.5s forwards ease-in-out 1",
        translateToRightThenBottom: "translateToRightThenBottom 0.8s forwards cubic-bezier(0.8,-0.35,0.35, 1) 1",
        opacityFadeIn: "opacity 0.6s linear forwards",
        opacityFadeOut: "opacityFadeOut 0.25s linear forwards",
        scaleUp: "scaleUp 0.2s linear forwards",
        scaleUp90: "scaleUp90 0.2s forwards",
        scaleDown: "scaleDown 0.4s linear forwards ",
        scaleDown100: "scaleDown100 0.2s linear forwards ",
        quickOpacity: "opacity 0.3s linear 1",
        opacity_page_transition: "opacity 0.2s linear 1",
        opacityFadeOutAndSlide: "opacityFadeOutAndSlide 0.25s linear 1",
        opacityFadeInAndSlide: "opacityFadeInAndSlide 0.25s linear 1",
        scaleUpDown: "scaleUpDown 1.5s linear alternate infinite",
        flickerDark: "flickerDark 10s linear forwards 1",
        flickerStrokeTungsten: "flickerStrokeTungsten 10s linear forwards 1",
        flickerLight: "flickerLight 10s linear forwards 1",
        flickerShadowLeftExtraSmallDark: "flickerShadowLeftExtraSmallDark 10s forwards linear 1",
        flickerShadowRightExtraSmallDark: "flickerShadowRightExtraSmallDark 10s forwards linear 1",
        flickerShadowLeftExtraSmallLight: "flickerShadowLeftExtraSmallLight 10s forwards linear 1",
        flickerShadowRightExtraSmallLight: "flickerShadowRightExtraSmallLight 10s forwards linear 1",
        flickerBgDark: "flickerBgDark 10s linear forwards 1",
        flickerBgLight: "flickerBgLight 10s linear forwards 1",
        swingBulb: "swingBulb 10s cubic-bezier(0.42, 0, 0.58, 1) 1",
        progressBar: "progressBar 5s linear forwards",


      },

    },
  },
};

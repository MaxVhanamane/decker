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

      boxShadow: {
        '4-sides': '0 0 1rem -0.15rem transparent',
        'bulb': '0px 0px 150px 75px transparent',
      },
      screens: {
        'xs': '370px',
        'ms': '400px'
      },
      backgroundImage: ({ theme }) => ({
        BgForDarkMode: `linear-gradient(to right,#020617,${theme('colors.slate.700')},${theme('colors.slate.900')})`,
        BgDarkModeSmall: `linear-gradient(to right,${theme('colors.slate.900')},${theme('colors.slate.800')},${theme('colors.slate.700')})`,
        lightBg: `linear-gradient(to right,${theme('colors.slate.300')},${theme('colors.slate.200')},${theme('colors.slate.100')})`,
        radialGradient: 'radial-gradient(#0284c7,rgba(12, 123, 179, 0))',
      }),
      keyframes: {
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
        flickerDark: {
          "0%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "1%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
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
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "11.002%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "12%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },

          "39.999%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "40%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "41%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
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
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
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
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "81.002%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "82%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "82.001%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "82.002%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "83%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "83.001%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "83.002%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "83.003%": {
            "background": "#1e293b",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "88%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "100%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          }

        },
        flickerLight: {
          "0%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "1%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
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
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "11.002%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "12%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },

          "39.999%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "40%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "41%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
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
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
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
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "81.002%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "82%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "82.001%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "82.002%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "83%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "83.001%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "83.002%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "83.003%": {
            "background": "#9ca3af",
            "box-shadow": "0px 0px 0px 0px transparent"
          },
          "88%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          },
          "100%": {
            "background": "#0ea5e9",
            "box-shadow": "0px 0px 150px 75px #38bdf8"
          }

        },

        flickerShadowLeftExtraSmallDark: {
          "0%": {

            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "1%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "1.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "10%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "11.001%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "11.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "12%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },

          "39.999%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "40%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "41%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "41.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },

          "75%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "75.5%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "75.501%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },

          "80%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "81.001%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "81.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "82%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "82.001%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "82.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "83%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "83.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "83.002%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "83.003%": {
            "box-shadow": "12px 12px 0px 4.5px  #1e293b"
          },
          "88%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "100%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          }

        },
        flickerShadowRightExtraSmallDark: {
          "0%": {

            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "1%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "1.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "10%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "11.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "11.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "12%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },

          "39.999%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "40%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "41%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "41.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },

          "75%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "75.5%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "75.501%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },

          "80%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "81.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "81.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "82%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "82.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "82.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "83%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "83.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "83.002%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "83.003%": {
            "box-shadow": "-12px 12px 0px 4.5px  #1e293b"
          },
          "88%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "100%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          }

        },
        flickerShadowRightExtraSmallLight: {
          "0%": {

            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "1%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "1.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "10%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "11.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "11.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "12%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },

          "39.999%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "40%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "41%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "41.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },

          "75%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "75.5%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "75.501%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },

          "80%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "81.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "81.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "82%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "82.001%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "82.002%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "83%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "83.001%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "83.002%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "83.003%": {
            "box-shadow": "-12px 12px 0px 4.5px  #9ca3af"
          },
          "88%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          },
          "100%": {
            "box-shadow": "-12px 12px 0px 4.5px #0ea5e9"
          }

        },
        flickerShadowLeftExtraSmallLight: {
          "0%": {

            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "1%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "1.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "10%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "11.001%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "11.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "12%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },

          "39.999%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "40%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "41%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "41.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },

          "75%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "75.5%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "75.501%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },

          "80%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "81.001%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "81.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "82%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "82.001%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "82.002%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "83%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "83.001%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "83.002%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "83.003%": {
            "box-shadow": "12px 12px 0px 4.5px  #9ca3af"
          },
          "88%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          },
          "100%": {
            "box-shadow": "12px 12px 0px 4.5px #0ea5e9"
          }

        },
        flickerBgDark: {
          "0%": {
            "background": "#1e293b",
          },
          "1%": {
            "background": "#0ea5e9",
          },
          "1.001%": {
            "background": "#1e293b",
          },
          "10%": {
            "background": "#1e293b",
          },
          "11.001%": {
            "background": "#0ea5e9",
          },
          "11.002%": {
            "background": "#1e293b",
          },
          "12%": {
            "background": "#0ea5e9",
          },

          "39.999%": {
            "background": "#0ea5e9",
          },
          "40%": {
            "background": "#1e293b",
          },
          "41%": {
            "background": "#0ea5e9",
          },
          "41.001%": {
            "background": "#1e293b",
          },

          "75%": {
            "background": "#1e293b",
          },
          "75.5%": {
            "background": "#0ea5e9",
          },
          "75.501%": {
            "background": "#1e293b",
          },

          "80%": {
            "background": "#1e293b",
          },
          "81.001%": {
            "background": "#0ea5e9",
          },
          "81.002%": {
            "background": "#1e293b",
          },
          "82%": {
            "background": "#0ea5e9",
          },
          "82.001%": {
            "background": "#0ea5e9",
          },
          "82.002%": {
            "background": "#1e293b",
          },
          "83%": {
            "background": "#0ea5e9",
          },
          "83.001%": {
            "background": "#1e293b",
          },
          "83.002%": {
            "background": "#0ea5e9",
          },
          "83.003%": {
            "background": "#1e293b",
          },
          "88%": {
            "background": "#0ea5e9",
          },
          "100%": {
            "background": "#0ea5e9",

          }

        },
        flickerBgLight: {
          "0%": {
            "background": "#9ca3af",
          },
          "1%": {
            "background": "#0ea5e9",
          },
          "1.001%": {
            "background": "#9ca3af",
          },
          "10%": {
            "background": "#9ca3af",
          },
          "11.001%": {
            "background": "#0ea5e9",
          },
          "11.002%": {
            "background": "#9ca3af",
          },
          "12%": {
            "background": "#0ea5e9",
          },

          "39.999%": {
            "background": "#0ea5e9",
          },
          "40%": {
            "background": "#9ca3af",
          },
          "41%": {
            "background": "#0ea5e9",
          },
          "41.001%": {
            "background": "#9ca3af",
          },

          "75%": {
            "background": "#9ca3af",
          },
          "75.5%": {
            "background": "#0ea5e9",
          },
          "75.501%": {
            "background": "#9ca3af",
          },

          "80%": {
            "background": "#9ca3af",
          },
          "81.001%": {
            "background": "#0ea5e9",
          },
          "81.002%": {
            "background": "#9ca3af",
          },
          "82%": {
            "background": "#0ea5e9",
          },
          "82.001%": {
            "background": "#0ea5e9",
          },
          "82.002%": {
            "background": "#9ca3af",
          },
          "83%": {
            "background": "#0ea5e9",
          },
          "83.001%": {
            "background": "#9ca3af",
          },
          "83.002%": {
            "background": "#0ea5e9",
          },
          "83.003%": {
            "background": "#9ca3af",
          },
          "88%": {
            "background": "#0ea5e9",
          },
          "100%": {
            "background": "#0ea5e9",

          }

        },

        swingBulb: {
          "0%": {
            "transform": "rotate(0deg)"
          },
          "15%": {
            "transform": "rotate(-20deg)"
          },
          "30%": {
            "transform": "rotate(20deg)"
          },
          "45%": {
            "transform": "rotate(-20deg)"
          },
          "60%": {
            "transform": "rotate(20deg)"
          },
          "75%": {
            "transform": "rotate(-20deg)"
          },
          "90%": {
            "transform": "rotate(20deg)"
          },
          "99%": {
            "transform": "rotate(0deg)"
          },
          "99.5%": {
            "transform": "rotate(0deg)"
          },
          "100%": {
            "transform": "rotate(0deg)"
          }
        }


      },

      animation: {
        marquee: "marquee 10s linear 1",
        rotate: "rotate 10s linear forwards infinite",
        translateFromLeftToRight: "translateFromLeftToRight 0.3s ease-in-out 1",
        translateFromLeftToRightSearch: "translateFromLeftToRightSearch 0.3s ease-in-out 1",
        translateFromRightToLeft: "translateFromRightToLeft 0.3s ease-in-out forwards 1",
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
        scaleUpDown: "scaleUpDown 1.5s linear alternate infinite",
        flickerDark: "flickerDark 10s linear forwards 1",
        flickerLight: "flickerLight 10s linear forwards 1",
        flickerShadowLeftExtraSmallDark: "flickerShadowLeftExtraSmallDark 10s forwards linear 1",
        flickerShadowRightExtraSmallDark: "flickerShadowRightExtraSmallDark 10s forwards linear 1",
        flickerShadowLeftExtraSmallLight: "flickerShadowLeftExtraSmallLight 10s forwards linear 1",
        flickerShadowRightExtraSmallLight: "flickerShadowRightExtraSmallLight 10s forwards linear 1",
        flickerBgDark: "flickerBgDark 10s linear forwards 1",
        flickerBgLight: "flickerBgLight 10s linear forwards 1",
        swingBulb: "swingBulb 5s cubic-bezier(0.42, 0, 0.58, 1) 1",

      },

    },
  },
};

import { defineConfig, loadEnv } from 'vite'
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";


export default defineConfig(({ command, mode }) => {
  // In vite.config.ts we can't access env variables using import.meta.env.VITE_API_URL we have to use following code to access it.
  const env = loadEnv(mode, process.cwd())
  const API_URL = `${env.VITE_API_URL}`

  return {
    plugins: [react(), VitePWA({

      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      injectRegister: 'auto',
      // add this to cache all the imports
      workbox: {
        globDirectory: "dist",
        globPatterns: ["**/*",],
        runtimeCaching: [
          {

            urlPattern: new RegExp(`${API_URL}/decks$`), //  your API endpoint
            handler: 'NetworkFirst', //  caching strategy 
            options: {
              cacheName: 'decks-cache',
              expiration: {
                maxEntries: 1, // number of entries to store
                maxAgeSeconds: 60 * 60 * 24 * 7, // cache expiration time
              },
              cacheableResponse: {
                statuses: [200]
              }

            },

          },
          {
            urlPattern: new RegExp(`${API_URL}/cards/.+`),
            handler: 'NetworkFirst', // Caching strategy for /cards/deck_id
            options: {
              cacheName: 'cards-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // cache expiration time
              },
              cacheableResponse: {
                statuses: [200],
              },
            },

          },
          {
            urlPattern: new RegExp(`${API_URL}/decks-and-cards$`),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'search-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // cache expiration time
              },
              cacheableResponse: {
                statuses: [200],
              },
            },
          },
          {
            urlPattern: new RegExp(`${API_URL}/getuser$`),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'auth-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // cache expiration time
              },
              cacheableResponse: {
                statuses: [200, 401],
              },
            },
          },
        ]
      },
      // add this to cache all the
      // static assets in the public folder
      includeAssets: [
        "**/*",
      ],
      manifest: {
        "name": "Decker",
        "short_name": "Decker",
        "description": "Decker is a versatile web app for easy creation and management of decks. Decks contain cards with diverse content types like code blocks and formatted text. Enjoy intuitive drag-and-drop functionality for effortless organization of cards/decks. Decker works offline, ensuring access to your content even without an internet connection.",
        "icons": [
          {
            "src": "/favicons/android-chrome-transparent-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "/favicons/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          },
          {
            "src": "/favicons/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png",

          },
          {
            "src": "/favicons/apple-touch-icon.png",
            "sizes": "180x180",
            "type": "image/png"
          },
          {
            "src": "/favicons/favicon-32x32.png",
            "sizes": "32x32",
            "type": "image/png"
          },
          {
            "src": "/favicons/favicon-16x16.png",
            "sizes": "16x16",
            "type": "image/png"
          }
        ],
        "start_url": "/",
        "display": "standalone",
        "background_color": "#fcfefc",
        "theme_color": "#fcfefc",
        screenshots: [{ src: "/screenshots/smallscreen/decker_small_screen_homepage.png", form_factor: "narrow", sizes: "345x615", "type": "image/png", label: "Home page" }, { src: "/screenshots/smallscreen/decker_small_screen_cardspage.png", form_factor: "narrow", sizes: "345x615", "type": "image/png", label: "Cards page" }, { src: "/screenshots/smallscreen/decker_small_screen_fullscreen.png", form_factor: "narrow", sizes: "345x615", "type": "image/png", label: "Fullscreen card view" }, { src: "/screenshots/largescreen/decker_big_screen_image_e1.png", form_factor: "wide", sizes: "960x466", "type": "image/jpg", label: "Home page " }, { src: "/screenshots/largescreen/decker_big_screen_image_e3.png", form_factor: "wide", sizes: "960x466", "type": "image/png", label: "Cards page" }, { src: "/screenshots/largescreen/decker_big_screen_image_e2.png", form_factor: "wide", sizes: "960x466", "type": "image/png", label: "Fullscreen card view" }],
      }


    }),],
  }
})

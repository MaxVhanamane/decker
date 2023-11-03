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
                statuses: [200],
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
        "description": "Decker is a versatile web application designed to simplify the process of creating and managing decks. Each deck in Decker represents a collection of cards that can contain various types of content, including code blocks and formatted text. With Decker, you can effortlessly create decks and populate them with multiple cards. The cards within a deck offer flexibility for organizing information, such as code snippets, text with rich formatting, and more. One of the key features of Decker is its intuitive drag-and-drop functionality. You can easily rearrange the order of cards within a deck by dragging and dropping them into the desired position. Additionally, Decker allows you to edit, delete individual cards/decks, enabling seamless content management. It works offline, ensuring access to your content even when you're not connected to the internet.",
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
      }


    }),],
  }
})

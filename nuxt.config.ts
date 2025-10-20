import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1,user-scalable=no',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:ital,wght@0,100..900;1,100..900&display=swap',
        },
      ],
      meta: [
        {
          name: 'google-site-verification',
          content: process.env.GOOGLE_SITE_VERIFICATION,
        },
      ],
    },
  },

  image: {
    dir: 'assets/images',
  },

  typescript: {
    strict: false,
  },

  devtools: { enabled: false },

  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
    'nuxt-gtag',
  ],

  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID,
    enabled: process.env.NODE_ENV === 'production',
  },

  pinia: {
    disableVuex: true,
  },

  primevue: {
    options: {
      ripple: true,
      inputVariant: 'filled',
      theme: {
        preset: Aura,
        options: {
          cssLayer: {
            name: 'primevue',
            order: 'tailwind-base, primevue, tailwind-utilities',
          },
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      API_URL: process.env.API_URL,
      GOOGLE_API: process.env.GOOGLE_API,
      APP_NAME: process.env.APP_NAME,
      META_TITLE: process.env.META_TITLE,
      META_DESCRIPTION: process.env.META_DESCRIPTION,
      META_IMAGE: process.env.META_IMAGE,
      META_URL: process.env.META_URL,
      META_QUOTE: process.env.META_QUOTE,
      SECRET_KEY: process.env.SECRET_KEY,
      NUXT_PUBLIC_GTAG_ID: process.env.NUXT_PUBLIC_GTAG_ID,
      GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
      NODE_ENV: process.env.NODE_ENV,
      TIME_ZONE: process.env.TIME_ZONE,
    },
  },

  experimental: {
    externalVue: false,
  },

  routeRules: {
    '/spin/**': { ssr: true },
  },

  tailwindcss: {
    cssPath: 'assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
  },

  vite: {
    esbuild: {
      drop:
        process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    // Fix Node 22 (alias modul bawaan)
    resolve: {
      alias: {
        stream: 'node:stream',
      },
    },
  },

  // Build lebih kompatibel untuk Node 22
  nitro: {
    preset: 'node',
  },

  build: {
    transpile: ['@primeuix/utils', 'primevue'],
  },

  compatibilityDate: '2024-07-29',
})

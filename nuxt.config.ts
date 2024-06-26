// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    typeCheck: true
  },
  modules: [
    '@sidebase/nuxt-auth'
  ],
  auth: {
    baseURL: 'https://upbranched.com',
  },
  //@ts-expect-error
  scss: ['~/assets/global.scss'],
  nitro: {
    hooks: {
      'dev:reload': () => require('sharp')
    },
    plugins: [
    ]
  },
  plugins: [
    // '~/plugins/markdown-it.client.ts',
  ],
  routeRules: {
    '/': { ssr: true },
  }
})

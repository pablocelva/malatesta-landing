import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import netlify from '@astrojs/netlify'

export default defineConfig({
  site: 'https://malatesta.cl',
  output: 'static',
  adapter: netlify(),
  integrations: [sitemap()],
  vite: {
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
  },
})

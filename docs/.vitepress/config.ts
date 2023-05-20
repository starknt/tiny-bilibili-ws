import { defineConfig } from 'vitepress'
import { version } from '../../package.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/tiny-bilibili-ws/',
  title: 'Tiny Bilibili WS',
  description: 'Tiny Bilibili WebSocket/TCP Client',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/' },
        ],
      },
      {
        text: 'API Reference',
        link: '/api',
      },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Release Notes',
            link: 'https://github.com/starknt/tiny-bilibili-ws/releases',
          },
        ],
      },
    ],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' },
    //     ],
    //   },
    // ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/starknt/tiny-bilibili-ws' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-PRESENT starknt',
    },
  },
})

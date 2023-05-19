import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/tiny-bilibili-ws',
  title: 'Tiny Bilibili WS',
  description: 'Tiny Bilibili WebSocket Client Doc',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
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
  },
})

import { resolve } from 'node:path'

const alias = {
  'tiny-bilibili-ws': resolve(__dirname, 'src', 'index.ts'),
  'tiny-bilibili-ws/browser': resolve(__dirname, 'src', 'browser.ts'),
}

export default ({
  resolve: {
    alias,
  },
})

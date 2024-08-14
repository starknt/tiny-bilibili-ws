import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/apilive': {
        target: 'https://api.live.bilibili.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/apilive/, ''),
      },
      '/api': {
        target: 'https://api.bilibili.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})

import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'off',
    'no-new': 'off',
  },
  ignores: [
    'node_modules',
    'dist',
    '**/.vitepress/cache/',
    '**/*brotli.ts',
  ],
})

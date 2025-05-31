import process from 'node:process'
import { defineConfig } from 'tsdown'

export default [
  defineConfig({
    entry: './src/index.ts',
    dts: true,
    clean: true,
    format: ['cjs', 'esm'],
    platform: 'node',
    minify: process.env.PUBLISH === 'true',
  }),
  defineConfig({
    entry: './src/browser.ts',
    dts: true,
    clean: true,
    format: 'esm',
    platform: 'browser',
    minify: process.env.PUBLISH === 'true',
    target: 'chrome100',
  }),
]

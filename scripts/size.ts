import path from 'node:path'
import fs from 'node:fs/promises'
import process from 'node:process'
import { sync as brotli } from 'brotli-size'
import { gzipSizeSync as gzip } from 'gzip-size'
import { minify } from 'terser'
import { version } from '../package.json'

console.log()
console.log(`tiny-bilibili-ws v${version}`)

const browser = path.resolve(process.cwd(), 'dist/browser.js')
const node = path.resolve(process.cwd(), 'dist/index.js')

let minified = ''
const browsercode = await fs.readFile(browser, 'utf8')
minified += (await minify(browsercode)).code
console.log()
console.log(`BROWSER entry gzip    ${(gzip(minified) / 1024).toFixed(2)} KiB`)
console.log(`BROWSER entry brotli  ${(brotli(minified) / 1024).toFixed(2)} KiB`)

minified = ''
const code = await fs.readFile(node, 'utf8')
minified += (await minify(code)).code
console.log()
console.log(`NODEJS entry gzip    ${(gzip(minified) / 1024).toFixed(2)} KiB`)
console.log(`NODEJS entry brotli  ${(brotli(minified) / 1024).toFixed(2)} KiB`)

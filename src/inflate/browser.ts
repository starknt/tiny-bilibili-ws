import { inflate as _inflate } from 'pako'
import type { IZlib } from '../buffer'
import { BrotliDecode } from './brotli'

async function brotliDecompress(buf: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(BrotliDecode(new Int8Array(buf)))
}

async function inflate(buf: Uint8Array): Promise<Uint8Array> {
  return _inflate(buf)
}

const inflateAsync = inflate
const brotliDecompressAsync = brotliDecompress

export const inflates: IZlib<Uint8Array> = { inflateAsync, brotliDecompressAsync }

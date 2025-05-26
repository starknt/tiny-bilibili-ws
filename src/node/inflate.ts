import type { BrotliOptions, InputType, ZlibOptions } from 'node:zlib'
import { brotliDecompress as _brotliDecompress, inflate as _inflate } from 'node:zlib'
import type { Buffer } from 'node:buffer'
import type { IZlib } from '../base/types'

function handler(resolve: (value: Uint8Array | PromiseLike<Uint8Array>) => void, reject: (reason?: any) => void) {
  return (error: Error | null, result: Buffer) => {
    if (error)
      reject(error)
    else
      resolve(result as Uint8Array)
  }
}

function brotliDecompress(buf: InputType, options?: BrotliOptions): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    _brotliDecompress(buf, options ?? {}, handler(resolve, reject))
  })
}

function inflate(buf: InputType, options?: ZlibOptions): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    _inflate(buf, options ?? {}, handler(resolve, reject))
  })
}

const inflateAsync = inflate
const brotliDecompressAsync = brotliDecompress

export const inflates: IZlib<Uint8Array> = { inflateAsync, brotliDecompressAsync }

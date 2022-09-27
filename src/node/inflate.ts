import type { BrotliOptions, InputType, ZlibOptions } from 'node:zlib'
import { brotliDecompress as _brotliDecompress, inflate as _inflate } from 'node:zlib'
import type { IZlib } from '../types'

function handler(resolve: (value: Buffer | PromiseLike<Buffer>) => void, reject: (reason?: any) => void) {
  return (error: Error | null, result: Buffer) => {
    if (error)
      reject(error)
    else
      resolve(result)
  }
}

function brotliDecompress(buf: InputType, options?: BrotliOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    _brotliDecompress(buf, options ?? {}, handler(resolve, reject))
  })
}

function inflate(buf: InputType, options?: ZlibOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    _inflate(buf, options ?? {}, handler(resolve, reject))
  })
}

const inflateAsync = inflate
const brotliDecompressAsync = brotliDecompress

export const inflates: IZlib<Buffer> = { inflateAsync, brotliDecompressAsync }

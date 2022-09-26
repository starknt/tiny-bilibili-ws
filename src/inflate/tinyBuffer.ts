// browser
let textEncoder: TextEncoder | null

/**
 * 1. 只支持 utf-8 编码
 * 2. 只实现少量使用到的方法
 *  2.1 concat
 *  2.2 from
 *  2.3 subarray
 *  2.4 allocUnsafe
 *  2.5 writeInt16BE
 *  2.6 writeInt32BE
 */

export class TinyBuffer {
  readonly buffer: Uint8Array

  private readonly _isBuffer = true

  static isBuffer(target: TinyBuffer) {
    return target._isBuffer
  }

  get byteLength() {
    return this.buffer.byteLength
  }

  get length() {
    return this.buffer.length
  }

  get byteOffset() {
    return this.buffer.byteOffset
  }

  private constructor(buffer: Uint8Array | number) {
    if (typeof buffer === 'number')
      this.buffer = new Uint8Array(buffer)
    else
      this.buffer = buffer
  }

  copy(target: TinyBuffer, targetStart?: number, start?: number, end?: number) {
    if (!TinyBuffer.isBuffer(target))
      throw new TypeError('argument should be a Buffer')
    if (!start)
      start = 0
    if (!end && end !== 0)
      end = this.length
    if (!targetStart)
      targetStart = 0
    if (targetStart >= target.length)
      targetStart = target.length
    if (end > 0 && end < start)
      end = start

    // Copy 0 bytes; we're done
    if (end === start)
      return 0
    if (target.length === 0 || this.length === 0)
      return 0

    // Fatal error conditions
    if (targetStart < 0)
      throw new RangeError('targetStart out of bounds')

    if (start < 0 || start >= this.length)
      throw new RangeError('Index out of range')
    if (end < 0)
      throw new RangeError('sourceEnd out of bounds')

    // Are we oob?
    if (end > this.length)
      end = this.length
    if (target.length - targetStart < end - start)
      end = target.length - targetStart + start

    const len = end - start

    if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
      // Use built-in when available, missing from IE11
      this.buffer.copyWithin(targetStart, start, end)
    }
    else {
      Uint8Array.prototype.set.call(
        target.buffer,
        this.buffer.subarray(start, end),
        targetStart,
      )
    }

    return len
  }

  static alloc(length: number): TinyBuffer {
    return new TinyBuffer(length)
  }

  static allocUnsafe(length: number) {
    return new TinyBuffer(length)
  }

  static from(source: string | ArrayLike<number> | ArrayBufferLike | TinyBuffer, byteOffset?: number, length?: number) {
    if (typeof source === 'string') {
      if (!textEncoder)
        textEncoder = new TextEncoder()

      return new TinyBuffer(new Uint8Array(textEncoder.encode(source), byteOffset, length))
    }

    if (source instanceof TinyBuffer)
      return new TinyBuffer(new Uint8Array(source.buffer, source.byteOffset, source.length))

    return new TinyBuffer(new Uint8Array(source))
  }

  static concat(list: readonly Uint8Array[], totalLength?: number | undefined) {
    if (list.length === 0)
      return Buffer.alloc(0)

    const length = totalLength ?? list.reduce((sum, array) => {
      return sum + array.length
    }, 0)

    const buffer = TinyBuffer.alloc(length)
    let pos = 0

    for (const array of list) {
      if (pos + array.length > buffer.length) {
        const _buf = TinyBuffer.from(array.buffer, array.byteOffset, array.byteLength)

        _buf.copy(buffer, pos)
      }
      else {
        Uint8Array.prototype.set.call(buffer.buffer, array, pos)
      }

      pos += array.length
    }

    return buffer
  }

  subarray(begin?: number | undefined, end?: number | undefined) {
    return this.buffer.subarray(begin, end)
  }

  writeInt16BE(value: number, offset = 0) {
    this.buffer[offset] = value >>> 8
    this.buffer[offset + 1] = (value & 0xFF)

    return offset + 2
  }

  writeInt32BE(value: number, offset = 0) {
    if (value < 0)
      value = 0xFFFFFFFF + value + 1

    this.buffer[offset] = (value >>> 24)
    this.buffer[offset + 1] = (value >>> 16)
    this.buffer[offset + 2] = (value >>> 8)
    this.buffer[offset + 3] = (value & 0xFF)

    return offset + 4
  }

  readInt32BE(offset = 0) {
    offset = offset >>> 0

    if (offset + 4 > this.byteLength)
      throw new Error('out of bound')

    return (this.buffer[offset] << 24)
      | (this.buffer[offset + 1] << 16)
      | (this.buffer[offset + 2] << 8)
      | (this.buffer[offset + 3])
  }

  readInt16BE(offset = 0) {
    offset = offset >>> 0

    if (offset + 2 > this.byteLength)
      throw new Error('out of bound')

    const value = (this.buffer[offset])
      | (this.buffer[offset + 1] << 8)

    return (value & 0x8000) ? value | 0xFFFF0000 : value
  }
}

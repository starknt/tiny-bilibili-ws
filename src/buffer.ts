import type { IReader, IWriter, IZlib } from './types'
import { LiveProtocolOperation, LiveProtocolVersion } from './types'

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const readInt = function (buffer: Uint8Array, start: number, len: number) {
  let result = 0
  for (let i = len - 1; i >= 0; i--)
    result += 256 ** (len - i - 1) * buffer[start + i]

  return result
}

const writeInt = function (buffer: Uint8Array, start: number, len: number, value: number) {
  let i = 0
  while (i < len) {
    buffer[start + i] = value / 256 ** (len - i - 1)
    i++
  }
}

class BufferWriter implements IWriter {
  private _buffer: Uint8Array

  constructor(buffer: Uint8Array) {
    this._buffer = buffer
  }

  get buffer() {
    return this._buffer
  }

  get length() {
    return this._buffer.length
  }

  write(start: number, len: number, val: number): void {
    writeInt(this.buffer, start, len, val)
  }
}

class BufferReader implements IReader {
  private _buffer: Uint8Array

  constructor(buffer: Uint8Array) {
    this._buffer = buffer
  }

  get buffer() {
    return this._buffer
  }

  get length() {
    return this._buffer.length
  }

  read(start: number, len: number): number {
    return readInt(this._buffer, start, len)
  }
}

function concat(list: Uint8Array[]) {
  const total = list.reduce((sum, v) => sum + v.length, 0)

  const buffer = new Uint8Array(total)
  let pos = 0
  for (const buf of list) {
    buffer.set(buf, pos)
    pos += buf.length
  }

  return buffer
}

export function serialize(type: LiveProtocolOperation, data: string | Record<string, any>): Uint8Array {
  if (typeof data !== 'string')
    data = JSON.stringify(data)

  /// header
  const header = new BufferWriter(new Uint8Array(16))

  // headLength 固定为 16
  header.write(4, 2, 16)
  // version
  header.write(6, 2, LiveProtocolVersion.VER_1)
  // operation
  switch (type) {
    case LiveProtocolOperation.HEARTBEAT:
      header.write(8, 4, LiveProtocolOperation.HEARTBEAT)
      break
    case LiveProtocolOperation.USER_AUTHENTICATION:
      header.write(8, 4, LiveProtocolOperation.USER_AUTHENTICATION)
      break
    default:
      throw new Error('Unknown protocol type')
  }
  // sequence_id 固定为 1
  header.write(12, 4, 1)
  ///

  /// body
  const body = new BufferWriter(new Uint8Array(textEncoder.encode(data)))
  ///

  // byteLength
  header.write(0, 4, header.length + body.length)

  const result = concat([header.buffer, body.buffer])

  return result
}

const cutBuffer = (buffer: Uint8Array) => {
  const bufferPacks: Uint8Array[] = []
  let size: number

  for (let i = 0; i < buffer.length; i += size) {
    size = readInt(buffer, i, 4)
    bufferPacks.push(buffer.subarray(i, i + size))
  }

  return bufferPacks
}

export function deserialize(buffer: Uint8Array, zlib: IZlib<Uint8Array>) {
  const decoder = async (buffer: Uint8Array) => {
    const packs = await Promise.all(
      cutBuffer(buffer).map(async (buf) => {
        const header = new BufferReader(buf.slice(0, 16))
        const body = buf.slice(16)
        const protocol = header.read(6, 2)
        const operation = header.read(8, 4)

        let type = 'unknow'
        if (operation === 3)
          type = 'heartbeat'

        else if (operation === 5)
          type = 'message'

        else if (operation === 8)
          type = 'welcome'

        let data: any
        if (protocol === 0)
          data = JSON.parse(textDecoder.decode(body))

        if (protocol === 1 && body.length === 4)
          data = readInt(body, 0, 4)

        if (protocol === 2)
          data = await decoder(await zlib.inflateAsync(body))

        if (protocol === 3)
          data = await decoder(await zlib.brotliDecompressAsync(body))

        return { buf, type, protocol, data }
      }),
    )

    return packs.flatMap((pack) => {
      if (pack.protocol === 2 || pack.protocol === 3)
        return pack.data

      return pack
    })
  }

  return decoder(buffer)
}

import type { IReader, IWriter, IZlib, Message } from './types'

///

/**
 * @reference https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md
 */

/**
 * 消息操作类型
 */
export enum WS_OP {
  // 心跳
  HEARTBEAT = 2,
  // 心跳回应
  HEARTBEAT_REPLY = 3,
  // MESSAGE 消息
  MESSAGE = 5,
  // 用户进入房间
  USER_AUTHENTICATION = 7,
  // 进入房间回应
  CONNECT_SUCCESS = 8,
  // 未知操作符
  Unknown = -1,
}

/**
 * 协议版本
 */
export enum WS_BODY_PROTOCOL_VERSION {
  // 纯文本 可直接通过 JSON.stringify 解析
  NORMAL = 0,
  // 没啥用
  NUMBER = 1,
  // zlib 压缩后的数据, 需要使用 zlib 算法解压缩(inflate)
  ZLIB = 2,
  // brotli 压缩后的数据, 需要使用 brotli 算法解压缩(decode)
  BROTLI = 3,
}

// 协议头长度
const WS_PACKAGE_HEADER_TOTAL_LENGTH = 16

const WS_PACKAGE_OFFSET = 0
const WS_HEADER_OFFSET = 4
const WS_VERSION_OFFSET = 6
const WS_OPERATION_OFFSET = 8
const WS_SEQUENCE_OFFSET = 12

const INT_32 = 4
const INT_16 = 2

export interface ProtocolHeader {
  op: WS_OP
  ver: WS_BODY_PROTOCOL_VERSION
  packetLength: number
  headerLength: number
  sequence: number
}

export interface Protocol {
  header: ProtocolHeader
  body: Uint8Array
}

///

/// utils

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const readInt = function (buffer: Uint8Array, offset: number, len: number) {
  let result = 0
  for (let i = len - 1; i >= 0; i--)
    result += 256 ** (len - i - 1) * buffer[offset + i]

  return result
}

const writeInt = function (buffer: Uint8Array, offset: number, len: number, value: number) {
  let i = 0
  while (i < len) {
    buffer[offset + i] = value / 256 ** (len - i - 1)
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

  write(offset: number, len: number, val: number): void {
    writeInt(this.buffer, offset, len, val)
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

  read(offset: number, len: number): number {
    return readInt(this._buffer, offset, len)
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

function cutBuffer(buffer: Uint8Array) {
  const bufferPacks: Uint8Array[] = []
  let size: number

  for (let i = 0; i < buffer.length; i += size) {
    size = readInt(buffer, i, INT_32)
    bufferPacks.push(buffer.slice(i, i + size))
  }

  return bufferPacks
}

class HeaderReader extends BufferReader {
  readOperation(): WS_OP {
    return this.read(WS_OPERATION_OFFSET, INT_32)
  }

  readHeaderLength() {
    return this.read(WS_HEADER_OFFSET, INT_16)
  }

  readVersion(): WS_BODY_PROTOCOL_VERSION {
    return this.read(WS_VERSION_OFFSET, INT_16)
  }

  readSequence() {
    return this.read(WS_SEQUENCE_OFFSET, INT_32)
  }

  readPacketLength() {
    return this.read(WS_PACKAGE_OFFSET, INT_32)
  }

  toJSON(): ProtocolHeader {
    return {
      op: this.readOperation(),
      ver: this.readVersion(),
      sequence: this.readSequence(),
      packetLength: this.readPacketLength(),
      headerLength: this.readHeaderLength(),
    }
  }
}

async function parser(buffer: Uint8Array, zlib: IZlib): Promise<Message<any>[]> {
  const groupPacks = cutBuffer(buffer)

  const protocols = groupPacks.map<Protocol>((buffer) => {
    const header = new HeaderReader(buffer.slice(0, 16)).toJSON()
    const body = buffer.slice(16)

    return {
      header,
      body,
    }
  })

  const standardProtocolPacket = protocols.map(async (protocol) => {
    const { header, body } = protocol

    let data: any
    if (header.ver === WS_BODY_PROTOCOL_VERSION.NORMAL)
      data = JSON.parse(textDecoder.decode(body))

    if (header.ver === WS_BODY_PROTOCOL_VERSION.NUMBER && body.length === 4)
      data = readInt(body, 0, 4)

    if (header.ver === WS_BODY_PROTOCOL_VERSION.ZLIB)
      data = await parser(await zlib.inflateAsync(body), zlib)

    if (header.ver === WS_BODY_PROTOCOL_VERSION.BROTLI)
      data = await parser(await zlib.brotliDecompressAsync(body), zlib)

    return {
      meta: header,
      data,
    }
  })

  const packs = await Promise.all(
    standardProtocolPacket,
  )

  return packs.flatMap<Message<any>>((v) => {
    if (v.meta.ver === WS_BODY_PROTOCOL_VERSION.ZLIB || v.meta.ver === WS_BODY_PROTOCOL_VERSION.BROTLI)
      return v.data
    return v
  })
}

///

/// main

export function serialize(type: WS_OP, data: string | Record<string, any> = {}): Uint8Array {
  if (typeof data !== 'string')
    data = JSON.stringify(data)

  /// header
  const header = new BufferWriter(new Uint8Array(WS_PACKAGE_HEADER_TOTAL_LENGTH))

  // headLength 固定为 16
  header.write(WS_HEADER_OFFSET, INT_16, 16)
  // version
  header.write(WS_VERSION_OFFSET, INT_16, WS_BODY_PROTOCOL_VERSION.NUMBER)
  // operation
  switch (type) {
    case WS_OP.HEARTBEAT:
      header.write(WS_OPERATION_OFFSET, INT_32, WS_OP.HEARTBEAT)
      break
    case WS_OP.USER_AUTHENTICATION:
      header.write(WS_OPERATION_OFFSET, INT_32, WS_OP.USER_AUTHENTICATION)
      break
    default:
      throw new Error('Unknown operation')
  }
  // sequence_id 固定为 1
  header.write(WS_SEQUENCE_OFFSET, INT_32, 1)
  ///

  /// body
  const body = new BufferWriter(new Uint8Array(textEncoder.encode(data)))
  ///

  // packetLength
  header.write(WS_PACKAGE_OFFSET, INT_32, header.length + body.length)

  return concat([header.buffer, body.buffer])
}

export function deserialize(buffer: Uint8Array, zlib: IZlib) {
  return parser(buffer, zlib)
}

///

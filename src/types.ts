export interface IWebSocket {
  send(data: Uint8Array): void
  close(): void
}

export interface ISocket {
  write(data: Uint8Array): void
  end(): void
}

export interface LiveHelloMessage {
  clientver: `${number}.${number}.${number}`
  platform: 'web'
  protover: 2
  roomid: number
  uid: 0
  type: 2
}

export type ListenerEvents = 'msg' | 'message' | 'live' | 'close' | 'error' | 'live' | 'heartbeat' | 'DANMU_MSG'

export interface IZlib<T extends Uint8Array> {
  inflateAsync(v: T): Promise<T>
  brotliDecompressAsync(v: T): Promise<T>
}

export enum LiveProtocolVersion {
  VER_0,
  VER_1,
  VER_2,
  VER_3,
}

export enum LiveProtocolOperation {
  HEARTBEAT = 2,
  HEARTBEAT_REPLY,
  MESSAGE = 5,
  USER_AUTHENTICATION = 7,
  CONNECT_SUCCESS,
  Unknown = -1,
}

export interface ProtocolHeader {
  byteLength: number
  headLength: number
  ver: LiveProtocolVersion
  sequence_id: number
  op: LiveProtocolOperation
}

export interface LiveProtocol {
  header: ProtocolHeader
  body: any
}

export interface IWriter {
  write(offset: number, len: number, val: number): void
  // writeInt32BE(val: number, offset?: number): void
  // writeInt16BE(val: number, offset?: number): void
}

export interface IReader {
  read(offset: number, len: number): number
  // readInt16BE(offset?: number): number
  // readInt32BE(offset?: number): number
}

import type { ProtocolHeader } from './buffer'

export type BILIBILI_HOST = string

// @ts-expect-error PartialByKeys pk
export type PartialByKeys<O extends Record<string, any>, U = keyof O, UU = U extends keyof O ? U : never, PO = Partial<Pick<O, UU>>> =
  PO & {
    [K in keyof O as K extends U ? never : K]: O[K]
  }

// @ts-expect-error RequiredByKeys pk
export type RequiredByKeys<O extends Record<string, any>, U = keyof O, UU = U extends keyof O ? U : never, PO = Required<Pick<O, UU>>> = PO & Omit<O, UU>

// reference https://stackoverflow.com/questions/49682569/typescript-merge-object-types
export type Merge<A, B> = {
  [K in keyof A | keyof B]:
  K extends keyof A & keyof B
    ? A[K] | B[K]
    : K extends keyof B
      ? B[K]
      : K extends keyof A
        ? A[K]
        : never
}

export type Nullable<T> = null | undefined | T

export interface ISocket {
  type: 'tcp'
  write: (data: Uint8Array) => void
  end: () => void
  reconnect: () => void
}

export interface IWebSocket {
  type: 'websocket'
  send: (data: Uint8Array) => void
  close: () => void
  reconnect: () => void
}

type Options = PartialByKeys<WSOptions, keyof AuthOptions | keyof ConnectionOptions>

export interface RoomResponse {
  code: number
  msg: string
  message: string
  data: {
    room_id: number
    short_id: number
    uid: number
    need_p2p: number
    is_hidden: boolean
    is_locked: boolean
    is_portrait: boolean
    live_status: number
    hidden_till: number
    lock_till: number
    encrypted: boolean
    pwd_verified: boolean
    live_time: number
    room_shield: number
    is_sp: number
    special_type: number
  }
}

export interface DanmuConfResponse {
  code: number
  message: string
  data: {
    refresh_row_factor: number
    refresh_rate: number
    max_delay: number
    host_list: HostList[]
    token: string
  }
}

export interface BuvidConfResponse {
  code: number
  message: string
  data: {
    b_3: string
    b_4: string
  }
}

export interface ServerList {
  host: string
  port: number
}

export interface HostList {
  host: string
  port: number
  wss_port: number
  ws_port: number
}

export interface WbiKeys {
  img_key: string
  sub_key: string
}

export const DEFAULT_WS_OPTIONS: Options = {
  raw: false,
  stub: true,
  ssl: true,
  keepalive: true,
  reconnectTime: 5 * 1000,
  heartbeatTime: 30 * 1000,
  platform: 'web',
  protover: 3,
  type: 2,
}

export interface BaseLiveClientOptions<B extends Uint8Array> extends Options {
  socket: ISocket | IWebSocket
  room: number | string
  zlib: IZlib<B>
}

export interface BaseOptions {
  /**
   * 是否获取原始消息
   * @default false
   */
  raw?: boolean
  /**
   * 是否获取全部信息
   *  如果关闭 stub, 监听 `msg` 消息将不生效
   * @default true
   */
  stub?: boolean
  /**
   * 保持连接, 当发生错误和断开连接时自动重新连接
   * @default true
   */
  keepalive?: boolean
  /**
   * 重新连接到服务器的时间间隔
   * @default 5000
   */
  reconnectTime?: number
  /**
   * 心跳时间
   * @default 300000
   */
  heartbeatTime?: number
}

export interface AuthOptions {
  authBody?: Uint8Array
  key?: any
}

export interface ConnectionOptions {
  url?: string
  host?: BILIBILI_HOST
  port?: number
  path?: string
}

interface CustomWebSocket {
  (url: string): WebSocket | Promise<WebSocket>
}

export interface WSOptions extends BaseOptions, AuthOptions, ConnectionOptions {
  headers?: { [key: string]: string } | undefined

  ssl?: boolean
  platform?: 'web' | string
  protover?: 1 | 2 | 3
  uid?: number
  type?: number
  key?: string
  buvid?: string

  customWebSocket?: CustomWebSocket
}

export interface TCPOptions extends WSOptions {}

export interface LiveHelloMessage {
  platform?: 'web' | 'android' | string
  protover?: 1 | 2 | 3
  roomid: number
  uid?: number
  type?: number
  key?: string
  buvid?: string
}

export interface MessageMeta extends ProtocolHeader {}

export interface Message<T> {
  meta: MessageMeta
  data: T
}

export interface IZlib<T extends Uint8Array = Uint8Array> {
  inflateAsync: (v: T) => Promise<T>
  brotliDecompressAsync: (v: T) => Promise<T>
}

export interface IWriter {
  write: (offset: number, len: number, val: number) => void
}

export interface IReader {
  read: (offset: number, len: number) => number
}

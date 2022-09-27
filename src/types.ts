import type { ProtocolHeader } from './buffer'

export interface ISocket {
  write(data: Uint8Array): void
  end(): void
}

export interface IWebSocket {
  send(data: Uint8Array): void
  close(): void
}

export interface RoomResponse {
  code: number
  msg: string
  message: string
  data: {
    room_id: number
    short_id: number
    uid: number
    need_p2p: 0
    is_hidden: false
    is_locked: false
    is_portrait: false
    live_status: 1
    hidden_till: 0
    lock_till: 0
    encrypted: false
    pwd_verified: false
    live_time: number
    room_shield: 1
    is_sp: 0
    special_type: 0
  }
}

export const DEFAULT_WS_OPTIONS: WSOptions = {
  ssl: true,
  clientVer: '2.0.11',
  platform: 'web',
  protover: 2,
  uid: 0,
  type: 2,
}

export interface BaseLiveClientOptions extends WSOptions {
  socket: ISocket | IWebSocket
  room: number
  zlib: IZlib
}

export interface WSOptions {
  ssl?: boolean
  clientVer?: `${number}.${number}.${number}` | `${number}.${number}.${number}.${number}`
  platform?: 'web'
  protover?: 1 | 2 | 3
  uid?: number
  type?: number
}

export interface TCPOptions extends WSOptions {

}

export interface LiveHelloMessage {
  clientver: `${number}.${number}.${number}` | `${number}.${number}.${number}.${number}`
  platform: 'web'
  protover: 1 | 2 | 3
  roomid: number
  uid: number
  type: number
}

export type ListenerEvents =
  'msg' | 'message' | 'close' | 'error' | 'live' | 'heartbeat' | 'closed'
  | MESSAGE_CMD

export type MESSAGE_CMD
  =
    'INTERACT_WORD' | 'LIKE_INFO_V3_UPDATE'
    | 'STOP_LIVE_ROOM_LIST' | 'ONLINE_RANK_COUNT' | 'HOT_RANK_CHANGED' | 'HOT_RANK_CHANGED_V2'
    | 'LIKE_INFO_V3_CLICK' | 'LIVE_INTERACTIVE_GAME'
    | 'WATCHED_CHANGE' // 看过
    | 'DANMU_MSG' | 'WELCOME_GUARD' | 'ENTRY_EFFECT' | 'WELCOME' // 弹幕
    | 'SUPER_CHAT_MESSAGE_JPN' | 'SUPER_CHAT_MESSAGE' // sc
    | 'SEND_GIFT' | 'COMBO_SEND' // 礼物
    | 'ANCHOR_LOT_START' | 'ANCHOR_LOT_END' | 'ANCHOR_LOT_AWARD' // 天选之人
    | 'GUARD_BUY' | 'USER_TOAST_MSG' | 'NOTICE_MSG' // 舰长
    | 'ACTIVITY_BANNER_UPDATE_V2' // 小时榜变动
    | 'ROOM_REAL_TIME_MESSAGE_UPDATE' // 粉丝关注变动

export interface MessageMeta extends ProtocolHeader {

}

export interface Message<T> {
  meta: MessageMeta
  data: T
}

export interface _DANMU_MSG {
  cmd: 'DANMU_MSG'
  info: any[]
}

export type DANMU_MSG = Message<_DANMU_MSG>

export interface IZlib<T extends Uint8Array = Uint8Array> {
  inflateAsync(v: T): Promise<T>
  brotliDecompressAsync(v: T): Promise<T>
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

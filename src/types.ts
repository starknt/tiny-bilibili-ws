import type { ProtocolHeader } from './buffer'

// @ts-expect-error PartialByKeys pk
export type PartialByKeys<O extends Record<string, any>, U = keyof O, UU = U extends keyof O ? U : never, PO = Partial<Pick<O, UU>>> =
  PO & {
    [K in keyof O as K extends U ? never : K]: O[K]
  }

export interface ISocket {
  write(data: Uint8Array): void
  end(): void
}

export interface IWebSocket {
  send(data: Uint8Array): void
  close(): void
}

type Options = PartialByKeys<Required<WSOptions>, keyof AuthOptions | keyof ConnectionOptions>

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

export const DEFAULT_WS_OPTIONS: Options = {
  ssl: true,
  clientVer: '2.0.11',
  platform: 'web',
  protover: 2,
  uid: 0,
  type: 2,
}

export interface BaseLiveClientOptions extends Options {
  socket: ISocket | IWebSocket
  room: number
  zlib: IZlib
}

export interface AuthOptions {
  authBody?: Uint8Array
  key?: any
}

export interface ConnectionOptions {
  url?: string
}

export interface WSOptions extends AuthOptions, ConnectionOptions {
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
  key?: any
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

export interface SEND_GIFT {
  cmd: 'SEND_GIFT'
  data: {
    'giftName': string
    'num': number
    'uname': string
    'face': string
    'guard_level': number
    'rcost': number
    'uid': number
    'top_list': any[]
    'timestamp': number
    'giftId': number
    'giftType': number
    'action': '喂食'
    'super': number
    'super_gift_num': number
    'price': number
    'rnd': string
    'newMedal': number
    'newTitle': number
    'medal': any[]
    'title': string
    'beatId': string
    'biz_source': string
    'metadata': string
    'remain': number
    'gold': number
    'silver': number
    'eventScore': number
    'eventNum': number
    'smalltv_msg': []
    'specialGift': null
    'notice_msg': string[]
    'capsule': null
    'addFollow': number
    'effect_block': number
    'coin_type': string
    'total_coin': number
    'effect': number
    'tag_image': string
    'user_count': number
  }
}

export interface WATCHED_CHANGE {
  cmd: 'WATCHED_CHANGE'
  data: {
    num: number
    text_small: string
    text_large: string
  }
}

export interface ENTRY_EFFECT {
  cmd: 'ENTRY_EFFECT'
  data: {
    id: number
    uid: number
    target_id: number
    mock_effect: number
    face: string
    privilege_type: number
    copy_writing: string
    copy_color: string
    highlight_color: string
    priority: number
    basemap_url: string
    show_avatar: number
    effective_time: number
    web_basemap_url: string
    web_effective_time: number
    web_effect_close: number
    web_close_time: number
    business: number
    copy_writing_v2: string
    icon_list: any[]
    max_delay_time: number
    trigger_time: number
    identities: number
    effect_silent_time: number
    effective_time_new: number
    web_dynamic_url_webp: string
    web_dynamic_url_apng: string
    mobile_dynamic_url_webp: string
  }
}

export interface INTERACT_WORD {
  cmd: 'INTERACT_WORD'
  data: {
    contribution: {
      grade: number
    }
    dmscore: number
    fans_medal: {
      anchor_roomid: number
      guard_level: number
      icon_id: number
      is_lighted: number
      medal_color: number
      medal_color_border: number
      medal_color_end: number
      medal_color_start: number
      medal_level: number
      medal_name: string
      score: number
      special: string
      target_id: number
    }
    identities: number[]
    is_spread: number
    msg_type: number
    privilege_type: number
    roomid: number
    score: number
    spread_desc: string
    spread_info: string
    tail_icon: number
    timestamp: number
    trigger_time: number
    uid: number
    uname: string
    uname_color: string
  }
}

export interface COMBO_SEND {
  cmd: 'COMBO_SEND'
  data: {
    action: string
    batch_combo_id: string
    batch_combo_num: number
    combo_id: string
    combo_num: number
    combo_total_coin: number
    dmscore: number
    gift_id: number
    gift_name: string
    gift_num: number
    is_show: number
    medal_info: MedalInfo
    name_color: string
    r_uname: string
    ruid: number
    send_master?: any
    total_num: number
    uid: number
    uname: string
  }
}

export interface MedalInfo {
  anchor_roomid: number
  anchor_uname: string
  guard_level: number
  icon_id: number
  is_lighted: number
  medal_color: string
  medal_color_border: number
  medal_color_end: number
  medal_color_start: number
  medal_level: number
  medal_name: string
  special: string
  target_id: number
}

export interface SUPER_CHAT_MESSAGE {
  cmd: 'SUPER_CHAT_MESSAGE'
  data: {
    background_bottom_color: string
    background_color: string
    background_color_end: string
    background_color_start: string
    background_icon: string
    background_image: string
    background_price_color: string
    color_point: number
    dmscore: number
    end_time: number
    gift: {
      gift_id: number
      gift_name: string
      num: number
    }
    id: number
    is_ranked: number
    is_send_audit: number
    medal_info: MedalInfo
    message: string
    message_font_color: string
    message_trans: string
    price: number
    rate: number
    start_time: number
    time: number
    token: string
    trans_mark: number
    ts: number
    uid: number
    user_info: {
      face: string
      face_frame: string
      guard_level: number
      is_main_vip: number
      is_svip: number
      is_vip: number
      level_color: string
      manager: number
      name_color: string
      title: string
      uname: string
      user_level: number
    }
  }
  roomid: number
}

export interface SUPER_CHAT_MESSAGE_JPN {
  cmd: 'SUPER_CHAT_MESSAGE_JPN'
  data: {
    background_bottom_color: string
    background_color: string
    background_color_end: string
    background_color_start: string
    background_icon: string
    background_image: string
    background_price_color: string
    color_point: number
    dmscore: number
    end_time: number
    gift: {
      gift_id: number
      gift_name: string
      num: number
    }
    id: number
    is_ranked: number
    is_send_audit: number
    medal_info: MedalInfo
    message: string
    message_font_color: string
    message_trans: string
    price: number
    rate: number
    start_time: number
    time: number
    token: string
    trans_mark: number
    ts: number
    uid: number
    user_info: {
      face: string
      face_frame: string
      guard_level: number
      is_main_vip: number
      is_svip: number
      is_vip: number
      level_color: string
      manager: number
      name_color: string
      title: string
      uname: string
      user_level: number
    }
  }
  roomid: number
}

export interface GUARD_BUY {
  cmd: 'GUARD_BUY'
  data: {
    uid: number
    username: string
    guard_level: number
    num: number
    price: number
    gift_id: number
    gift_name: string
    start_time: number
    end_time: number
  }
}

export interface _NOTICE_MSG {
  cmd: 'NOTICE_MSG'
  id: number
  name: string
  full: {
    head_icon: string
    tail_icon: string
    head_icon_fa: string
    tail_icon_fa: string
    head_icon_fan: number
    tail_icon_fan: number
    background: string
    color: string
    highlight: string
    time: number
  }
  half: {
    head_icon: string
    tail_icon: string
    background: string
    color: string
    highlight: string
    time: number
  }
  side: {
    head_icon: string
    background: string
    color: string
    highlight: string
    border: string
  }
  roomid: number
  real_roomid: number
  msg_common: string
  msg_self: string
  link_url: string
  msg_type: number
  shield_uid: number
  business_id: string
  scatter: {
    min: number
    max: number
  }
  marquee_id: string
  notice_type: number
}

export type DANMU_MSG = Message<_DANMU_MSG>
export type SEND_GIFT_MSG = Message<SEND_GIFT>
export type WATCHED_CHANGE_MSG = Message<WATCHED_CHANGE>
export type ENTRY_EFFECT_MSG = Message<ENTRY_EFFECT>
export type INTERACT_WORD_MSG = Message<INTERACT_WORD>
export type COMBO_SEND_MSG = Message<COMBO_SEND>
export type SUPER_CHAT_MSG = Message<SUPER_CHAT_MESSAGE>
export type SUPER_CHAT_MSG_JPN = Message<SUPER_CHAT_MESSAGE_JPN>
export type GUARD_BUY_MSG = Message<GUARD_BUY>
export type NOTICE_MSG = Message<_NOTICE_MSG>

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

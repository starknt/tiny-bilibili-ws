import type { Message } from './types'

export interface DANMU_MSG {
  cmd: 'DANMU_MSG'
  info: [
    [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      string,
      number,
      number,
      number,
      string,
      number,
      string,
      string,
      {
        'mode': number
        'show_player_type': number
        /** json */
        'extra': string
      },
      {
        'activity_identity': string
        'activity_source': number
        'not_show': number
      },
    ],
    string,
    [
      number,
      string,
      number,
      number,
      number,
      number,
      number,
      string,
    ],
    [
      number,
      string,
      string,
      number,
      number,
      string,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ],
    [
      number,
      number,
      number,
      string,
      number,
    ],
    [
      string,
      string,
    ],
    number,
    number,
    any,
    {
      ts: number
      ct: string
    },
    0,
    0,
    any,
    any,
    number,
    number,
  ]
  /** Base64 String */
  dm_v2: string
}

export interface SEND_GIFT {
  cmd: 'SEND_GIFT'
  data: {
    giftName: string
    num: number
    uname: string
    face: string
    guard_level: number
    rcost: number
    uid: number
    top_list: any[]
    timestamp: number
    giftId: number
    giftType: number
    action: string
    super: number
    super_gift_num: number
    price: number
    rnd: string
    newMedal: number
    newTitle: number
    medal: any[]
    title: string
    beatId: string
    biz_source: string
    metadata: string
    remain: number
    gold: number
    silver: number
    eventScore: number
    eventNum: number
    smalltv_msg: []
    specialGift: null
    notice_msg: string[]
    capsule: null
    addFollow: number
    effect_block: number
    coin_type: string
    total_coin: number
    effect: number
    tag_image: string
    user_count: number
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

export interface NOTICE_MSG {
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

export interface HOT_RANK_CHANGED {
  cmd: 'HOT_RANK_CHANGED'
  data: {
    rank: number
    trend: number
    countdown: number
    timestamp: number
    web_url: string
    blink_url: string
    live_link_url: string
    pc_link_url: string
    icon: string
    area_name: string
    rank_desc: string
  }
}

export interface HOT_RANK_CHANGED_V2 {
  cmd: 'HOT_RANK_CHANGED_V2'
  data: {
    rank: number
    trend: number
    countdown: number
    timestamp: number
    web_url: string
    live_url: string
    blink_url: string
    live_link_url: string
    pc_link_url: string
    icon: string
    area_name: string
    rank_desc: string
  }
}

export interface ONLINE_RANK_COUNT {
  cmd: 'ONLINE_RANK_COUNT'
  data: {
    count: number
  }
}

export interface STOP_LIVE_ROOM_LIST {
  cmd: 'STOP_LIVE_ROOM_LIST'
  data: {
    room_id_list: number[]
  }
}

export interface SPECIAL_GIFT {
  cmd: 'SPECIAL_GIFT'
  data: {
    number: {
      action: string
      content: string
      hadJoin: number
      id: string
      num: number
      storm_gif: string
      time: number
    }
  }
}

export interface SUPER_CHAT_MESSAGE_DELETE {
  cmd: 'SUPER_CHAT_MESSAGE_DELETE'
  data: {
    ids: Array<number>
  }
  roomid: number
}

export interface USER_TOAST_MSG {
  cmd: 'USER_TOAST_MSG'
  data: {
    anchor_show: boolean
    color: `#${string}`
    dmscore: number
    effect_id: number
    end_time: number
    guard_level: number
    is_show: number
    num: number
    op_type: number
    payflow_id: string
    price: number
    role_name: string
    start_time: number
    svga_block: number
    target_guard_count: number
    toast_msg: string
    uid: number
    unit: string
    user_show: boolean
    username: string
  }
}

export interface POPULARITY_RED_POCKET_NEW {
  cmd: 'POPULARITY_RED_POCKET_NEW'
  data: {
    lot_id: number
    start_time: number
    current_time: number
    wait_num: number
    uname: string
    uid: number
    action: string
    num: number
    gift_name: string
    gift_id: number
    price: number
    name_color: `#${string}`
    medal_info: MedalInfo
  }
}

export interface RED_POCKET_GIFT {
  gift_id: number
  gift_name: string
  gift_pic: string
  num: number
}

export interface RED_POCKET_GIFT_WINNER {
  uid: number
  name: string
  user_type: number
  award_type: number
  award_id: number
  award_name: string
  award_pic: string
  award_big_pic: string
  award_price: number
  bag_id: number
  gift_id: number
  gift_num: number
}

export interface POPULARITY_RED_POCKET_START {
  cmd: 'POPULARITY_RED_POCKET_START'
  data: {
    lot_id: number
    sender_uid: number
    sender_name: string
    sender_face: string
    join_requirement: number
    danmu: string
    current_time: number
    start_time: number
    end_time: number
    last_time: number
    remove_time: number
    replace_time: number
    lot_status: number
    h5_url: string
    user_status: number
    awards: Array<RED_POCKET_GIFT>
    lot_config_id: number
    total_price: number
    wait_num: number
  }
}

export interface POPULARITY_RED_POCKET_WINNER_LIST {
  cmd: 'POPULARITY_RED_POCKET_WINNER_LIST'
  data: {
    lot_id: number
    total_num: number
    winner_info: Array<RED_POCKET_GIFT_WINNER>
  }
}

export interface PREPARING {
  cmd: 'PREPARING'
  round: number
  roomid: string
}

export interface LIVE {
  cmd: 'LIVE'
  live_key: string
  voice_background: string
  sub_session_key: string
  live_platform: string
  live_model: number
  live_time: number
  roomid: number
}

export interface WARNING {
  cmd: 'WARNING'
  msg: string
  roomid: number
}

export interface CUT_OFF {
  cmd: 'CUT_OFF'
  msg: string
  roomid: number
}

export interface CHANGE_ROOM_INFO {
  cmd: 'CHANGE_ROOM_INFO'
  background: string
  roomid: number
}

export interface ROOM_CHANGE {
  cmd: 'ROOM_CHANGE'
  data: {
    title: string
    area_id: number
    parent_area_id: number
    area_name: string
    parent_area_name: string
    live_key: string
    sub_session_key: string
  }
}

export interface ROOM_REAL_TIME_MESSAGE_UPDATE {
  cmd: 'ROOM_REAL_TIME_MESSAGE_UPDATE'
  data: {
    roomid: number
    fans: number
    red_notice: number
    fans_club: number
  }
}

export interface ROOM_SKIN_MSG {
  'cmd': 'ROOM_SKIN_MSG'
  'skin_id': number
  'status': number
  'end_time': number
  'current_time': number
  'only_local': boolean
  'scatter': {
    'min': number
    'max': number
  }
  'skin_config': {
    'android': {
      '1': {
        'zip': string
        'md5': string
      }
    }
    'ios': {
      '1': {
        'zip': string
        'md5': string
      }
    }
    'ipad': {
      '1': {
        'zip': string
        'md5': string
      }
    }
    'web': {
      '1': {
        'zip': string
        'md5': string
        'platform': string
        'version': string
        'headInfoBgPic': string
        'giftControlBgPic': string
        'rankListBgPic': string
        'mainText': `#${string}`
        'normalText': `#${string}`
        'highlightContent': `#${string}`
        'border': `#${string}`
        'buttonText': `#${string}`
      }
    }
  }
}

export interface ROOM_SILENT_ON {
  'cmd': 'ROOM_SILENT_ON'
  'data': {
    'type': string
    'level': number
    'second': number
  }
}

export interface ROOM_SILENT_OFF {
  'cmd': 'ROOM_SILENT_OFF'
  'data': {
    'type': string
    'level': number
    'second': number
  }
}

export interface ROOM_BLOCK_MSG {
  'cmd': 'ROOM_BLOCK_MSG'
  'data': {
    'dmscore': number
    'operator': number
    'uid': number
    'uname': string
  }
  'uid': string
  'uname': string
}

export interface ROOM_ADMINS {
  'cmd': 'ROOM_ADMINS'
  'uids': number[]
}

export interface room_admin_entrance {
  'cmd': 'room_admin_entrance'
  'dmscore': number
  'level': number
  'msg': string
  'uid': number
}

export interface ROOM_ADMIN_REVOKE {
  'cmd': 'ROOM_ADMIN_REVOKE'
  'msg': string
  'uid': number
}

export interface ONLINE_RANK_V2 {
  'cmd': 'ONLINE_RANK_V2'
  'data': {
    'list': ({
      'uid': number
      'face': string
      'score': string
      'uname': string
      'rank': number
      'guard_level': number
    })[]
    'rank_type': string
  }
}

export interface ONLINE_RANK_TOP3 {
  'cmd': 'ONLINE_RANK_TOP3'
  'data': {
    'dmscore': number
    'list': ({
      'msg': string
      'rank': number
    })[]
  }
}

export interface HOT_RANK_SETTLEMENT {
  'cmd': 'HOT_RANK_SETTLEMENT'
  'data': {
    'area_name': string
    'cache_key': string
    'dm_msg': string
    'dmscore': number
    'face': string
    'icon': string
    'rank': number
    'timestamp': number
    'uname': string
    'url': string
  }
}

export interface HOT_RANK_SETTLEMENT_V2 {
  'cmd': 'HOT_RANK_SETTLEMENT_V2'
  'data': {
    'rank': number
    'uname': string
    'face': string
    'timestamp': number
    'icon': string
    'area_name': string
    'url': string
    'cache_key': string
    'dm_msg': string
  }
}

export interface WIDGET_BANNER {
  'cmd': 'WIDGET_BANNER'
  'data': {
    'timestamp': number
    'widget_list': {
      number: {
        'id': number
        'title': string
        'cover': string
        'web_cover': string
        'tip_text': string
        'tip_text_color': '#F9F8F8'
        'tip_bottom_color': '#F95E5E'
        'jump_url': string
        'url': string
        'stay_time': number
        'site': number
        'platform_in': string[]
        'type': number
        'band_id': 100356
        'sub_key': string
        'sub_data': string
        'is_add': boolean
      }
    }
  }
}

export interface WIDGET_WISH_LIST {
  'cmd': 'WIDGET_WISH_LIST'
  'data': {
    'wish': ({
      'type': number
      'gift_id': number
      'gift_name': string
      'gift_img': string
      'gift_price': number
      'target_num': number
      'current_num': number
    })[]
    'wish_status': number
    'sid': number
    'wish_status_info': ({
      'wish_status_msg': string
      'wish_status_img': string
      'wish_status': number
    })[]
    'wish_name': string
  }
}

export interface ANCHOR_LOT_CHECKSTATUS {
  'cmd': 'ANCHOR_LOT_CHECKSTATUS'
  'data': {
    'id': number
    'reject_reason': string
    'status': number
    'uid': number
  }
}

export interface ANCHOR_LOT_START {
  'cmd': 'ANCHOR_LOT_START'
  'data': {
    'asset_icon': string
    'award_image': string
    'award_name': string
    'award_num': number
    'cur_gift_num': number
    'current_time': number
    'danmu': string
    'gift_id': number
    'gift_name': string
    'gift_num': number
    'gift_price': number
    'goaway_time': number
    'goods_id': number
    'id': number
    'is_broadcast': number
    'join_type': number
    'lot_status': number
    'max_time': number
    'require_text': string
    'require_type': number
    'require_value': number
    'room_id': number
    'send_gift_ensure': number
    'show_panel': number
    'start_dont_popup': number
    'status': number
    'time': number
    'url': string
    'web_url': string
  }
}

export interface ANCHOR_LOT_END {
  'cmd': 'ANCHOR_LOT_END'
  'data': {
    'id': number
  }
}

export interface ANCHOR_LOT_AWARD {
  'cmd': 'ANCHOR_LOT_AWARD'
  'data': {
    'award_dont_popup': number
    'award_image': string
    'award_name': string
    'award_num': number
    'award_users': ({
      'uid': number
      'uname': string
      'face': string
      'level': number
      'color': number
    })[]
    'id': number
    'lot_status': number
    'url': string
    'web_url': string
  }
}

export interface VIDEO_CONNECTION_JOIN_START {
  'cmd': 'VIDEO_CONNECTION_JOIN_START'
  'data': {
    'status': number
    'invited_uid': number
    'channel_id': string
    'invited_uname': string
    'invited_face': string
    'start_at': number
    'current_time': number
  }
  'roomid': number
}

export interface VIDEO_CONNECTION_MSG {
  'cmd': 'VIDEO_CONNECTION_MSG'
  'data': {
    'channel_id': string
    'current_time': number
    'dmscore': number
    'toast': string
  }
}

export interface VIDEO_CONNECTION_JOIN_END {
  'cmd': 'VIDEO_CONNECTION_JOIN_END'
  'data': {
    'channel_id': string
    'start_at': number
    'toast': string
    'current_time': number
  }
  'roomid': number
}

export interface FULL_SCREEN_SPECIAL_EFFECT {
  'cmd': 'FULL_SCREEN_SPECIAL_EFFECT'
  'data': {
    'type': number
    'ids': number[]
    'queue': number
    'platform_in': number[]
  }
}

export interface COMMON_NOTICE_DANMAKU {
  'cmd': 'COMMON_NOTICE_DANMAKU'
  'data': {
    'content_segments': ({
      'font_color': `#${string}`
      'text': string
      'type': number
    })[]
    'dmscore': number
    'terminals': number[]
  }
}

interface _BuiltinEvent {
  LIVE: LIVE
  PREPARING: PREPARING
  WARNING: WARNING
  CUT_OFF: CUT_OFF

  CHANGE_ROOM_INFO: CHANGE_ROOM_INFO
  ROOM_CHANGE: ROOM_CHANGE
  ROOM_REAL_TIME_MESSAGE_UPDATE: ROOM_REAL_TIME_MESSAGE_UPDATE
  ROOM_SKIN_MSG: ROOM_SKIN_MSG

  ROOM_SILENT_ON: ROOM_SILENT_ON
  ROOM_SILENT_OFF: ROOM_SILENT_OFF
  ROOM_BLOCK_MSG: ROOM_BLOCK_MSG

  ROOM_ADMINS: ROOM_ADMINS
  room_admin_entrance: room_admin_entrance
  ROOM_ADMIN_REVOKE: ROOM_ADMIN_REVOKE

  // 弹幕
  DANMU_MSG: DANMU_MSG
  NOTICE_MSG: NOTICE_MSG
  COMMON_NOTICE_DANMAKU: COMMON_NOTICE_DANMAKU

  // 礼物
  SEND_GIFT: SEND_GIFT
  COMBO_SEND: COMBO_SEND
  SPECIAL_GIFT: SPECIAL_GIFT

  // SC
  SUPER_CHAT_MESSAGE: SUPER_CHAT_MESSAGE
  SUPER_CHAT_MESSAGE_JPN: SUPER_CHAT_MESSAGE_JPN
  SUPER_CHAT_MESSAGE_DELETE: SUPER_CHAT_MESSAGE_DELETE

  // 红包
  POPULARITY_RED_POCKET_NEW: POPULARITY_RED_POCKET_NEW
  POPULARITY_RED_POCKET_START: POPULARITY_RED_POCKET_START
  POPULARITY_RED_POCKET_WINNER_LIST: POPULARITY_RED_POCKET_WINNER_LIST

  // 大航海
  GUARD_BUY: GUARD_BUY
  USER_TOAST_MSG: USER_TOAST_MSG

  HOT_RANK_CHANGED: HOT_RANK_CHANGED
  HOT_RANK_CHANGED_V2: HOT_RANK_CHANGED_V2
  HOT_RANK_SETTLEMENT: HOT_RANK_SETTLEMENT
  HOT_RANK_SETTLEMENT_V2: HOT_RANK_SETTLEMENT_V2

  // 石油榜
  ONLINE_RANK_COUNT: ONLINE_RANK_COUNT
  ONLINE_RANK_V2: ONLINE_RANK_V2
  ONLINE_RANK_TOP3: ONLINE_RANK_TOP3

  WIDGET_BANNER: WIDGET_BANNER
  WIDGET_WISH_LIST: WIDGET_WISH_LIST

  ANCHOR_LOT_CHECKSTATUS: ANCHOR_LOT_CHECKSTATUS
  ANCHOR_LOT_START: ANCHOR_LOT_START
  ANCHOR_LOT_END: ANCHOR_LOT_END
  ANCHOR_LOT_AWARD: ANCHOR_LOT_AWARD

  VIDEO_CONNECTION_JOIN_START: VIDEO_CONNECTION_JOIN_START

  STOP_LIVE_ROOM_LIST: STOP_LIVE_ROOM_LIST
  VIDEO_CONNECTION_MSG: VIDEO_CONNECTION_MSG
  VIDEO_CONNECTION_JOIN_END: VIDEO_CONNECTION_JOIN_END

  ENTRY_EFFECT: ENTRY_EFFECT
  FULL_SCREEN_SPECIAL_EFFECT: FULL_SCREEN_SPECIAL_EFFECT

  INTERACT_WORD: INTERACT_WORD
  WATCHED_CHANGE: WATCHED_CHANGE
  WELCOME_GUARD: any
  WELCOME: any
}

export type ReplaceVToMessage<E extends Record<string, any>> = {
  [K in keyof E]: Message<E[K]>
}

export type BuiltinEvent = ReplaceVToMessage<_BuiltinEvent>

/* eslint-disable @typescript-eslint/no-redeclare */
import type { Message } from './types'

export interface _DANMU_MSG {
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
      'ts': number
      'ct': string
    },
    0,
    0,
    any,
    any,
    number,
    number,
  ]
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
export type HOT_RANK_CHANGED_MSG = Message<HOT_RANK_CHANGED>
export type HOT_RANK_CHANGED_V2_MSG = Message<HOT_RANK_CHANGED_V2>
export type ONLINE_RANK_COUNT_MSG = Message<ONLINE_RANK_COUNT>
export type STOP_LIVE_ROOM_LIST_MSG = Message<STOP_LIVE_ROOM_LIST>

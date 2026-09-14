import { decodeBase64, decodeProtobufFields, getProtobufBytes, getProtobufString, getProtobufVarint } from './protobuf'

export interface SendGiftV2MedalInfo {
  target_id: number
  anchor_roomid: number
  medal_level: number
  medal_name: string
}

export interface SendGiftV2BlindGift {
  original_gift_name: string
  original_gift_price: number
}

export interface SendGiftV2Gift {
  gift_id: number
  gift_name: string
  num: number
  gift_type: number
  price: number
  total_coin: number
  coin_type: string
  tid: string
  timestamp: number
  rnd: string
  action: string
  gift_img_basic: string
}

export interface SendGiftV2Broadcast {
  uid: number
  uname: string
  face: string
  guard_level: number
  medal_info: SendGiftV2MedalInfo
  blind_gift: SendGiftV2BlindGift
  gift_list: SendGiftV2Gift[]
}

export interface SendGiftV2Message extends SendGiftV2Gift {
  uid: number
  uname: string
  face: string
  guard_level: number
  medal_level: number
  medal_name: string
  medal_room_id: number
  medal_ruid: number
  blind_gift_name: string
  blind_price: number
}

function decodeMedalInfo(buffer?: Uint8Array): SendGiftV2MedalInfo {
  const fields = buffer ? decodeProtobufFields(buffer) : []
  return {
    target_id: getProtobufVarint(fields, 1),
    anchor_roomid: getProtobufVarint(fields, 4),
    medal_level: getProtobufVarint(fields, 5),
    medal_name: getProtobufString(fields, 6),
  }
}

function decodeBlindGift(buffer?: Uint8Array): SendGiftV2BlindGift {
  const fields = buffer ? decodeProtobufFields(buffer) : []
  return {
    original_gift_name: getProtobufString(fields, 3),
    original_gift_price: getProtobufVarint(fields, 6),
  }
}

function decodeGift(buffer: Uint8Array): SendGiftV2Gift {
  const fields = decodeProtobufFields(buffer)
  const giftInfo = getProtobufBytes(fields, 35)
  return {
    gift_id: getProtobufVarint(fields, 1),
    gift_name: getProtobufString(fields, 2),
    num: getProtobufVarint(fields, 3),
    gift_type: getProtobufVarint(fields, 4),
    price: getProtobufVarint(fields, 5),
    total_coin: getProtobufVarint(fields, 7),
    coin_type: getProtobufString(fields, 8),
    tid: getProtobufString(fields, 9),
    timestamp: getProtobufVarint(fields, 10),
    rnd: getProtobufString(fields, 12),
    action: getProtobufString(fields, 18),
    gift_img_basic: giftInfo ? getProtobufString(decodeProtobufFields(giftInfo), 1) : '',
  }
}

/** Decode the protobuf payload carried by a SEND_GIFT_V2 command. */
export function decodeSendGiftV2(pb: string): SendGiftV2Broadcast {
  const fields = decodeProtobufFields(decodeBase64(pb))
  return {
    uid: getProtobufVarint(fields, 1),
    uname: getProtobufString(fields, 2),
    face: getProtobufString(fields, 3),
    guard_level: getProtobufVarint(fields, 5),
    medal_info: decodeMedalInfo(getProtobufBytes(fields, 8)),
    blind_gift: decodeBlindGift(getProtobufBytes(fields, 9)),
    gift_list: fields
      .filter(field => field.number === 10 && field.wireType === 2 && field.value instanceof Uint8Array)
      .map(field => decodeGift(field.value as Uint8Array)),
  }
}

/** Convert every gift item in a SEND_GIFT_V2 payload to the legacy gift-message shape. */
export function parseSendGiftV2(pb: string): SendGiftV2Message[] {
  const broadcast = decodeSendGiftV2(pb)
  return broadcast.gift_list.map(gift => ({
    ...gift,
    uid: broadcast.uid,
    uname: broadcast.uname,
    face: broadcast.face,
    guard_level: broadcast.guard_level,
    medal_level: broadcast.medal_info.medal_level,
    medal_name: broadcast.medal_info.medal_name,
    medal_room_id: broadcast.medal_info.anchor_roomid,
    medal_ruid: broadcast.medal_info.target_id,
    blind_gift_name: broadcast.blind_gift.original_gift_name,
    blind_price: broadcast.blind_gift.original_gift_price,
  }))
}

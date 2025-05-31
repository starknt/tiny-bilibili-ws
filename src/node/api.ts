import type { BaseLiveClientOptions, BuvidConfResponse, DanmuConfResponse, RoomResponse, WbiKeys } from '../base/types'
import { retry } from '../base/utils'
import { WbiSign } from './sign'

export const cachedRoomInfo: Map<number, RoomResponse> = new Map()
export const cachedDanmuConf: Map<number, DanmuConfResponse> = new Map()
let fingerprint: string | undefined

function request(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...options.headers,
    },
    ...options,
  })
}

export async function getLongRoomId(room: number, headers?: Record<string, string>): Promise<RoomResponse> {
  const res = await request(`https://api.live.bilibili.com/room/v1/Room/mobileRoomInit?id=${room}`, {
    headers,
  })

  if (!res.ok)
    throw new Error(`Failed to get long room id: ${res.statusText}`)

  const data = await res.json()

  return data
}

export async function getDanmuConf(query: string, headers?: Record<string, string>): Promise<DanmuConfResponse> {
  const res = await request(`https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?${query}`, {
    headers,
  })

  if (!res.ok)
    throw new Error(`Failed to get danmu conf: ${res.statusText}`)

  const data = await res.json()

  return data
}

export async function getBuvidConf(headers?: Record<string, string>): Promise<BuvidConfResponse> {
  const res = await request('https://api.bilibili.com/x/frontend/finger/spi', {
    headers,
  })

  if (!res.ok)
    throw new Error(`Failed to get buvid conf: ${res.statusText}`)

  const data = await res.json()

  return data
}

export async function getCachedInfo(room: number, options: BaseLiveClientOptions<any>): Promise<[RoomResponse, DanmuConfResponse, string]> {
  let roomInfo: RoomResponse | undefined
  let danmuInfo: DanmuConfResponse | undefined
  if (cachedRoomInfo.has(room)) {
    roomInfo = cachedRoomInfo.get(room)!
  }
  else {
    const info = await retry(() => getLongRoomId(room, options.headers), 2, 200)
    cachedRoomInfo.set(room, info)
    roomInfo = info
  }

  if (cachedDanmuConf.has(roomInfo.data.room_id)) {
    danmuInfo = cachedDanmuConf.get(roomInfo.data.room_id)!
  }
  else {
    const query = {
      id: roomInfo.data.room_id,
      type: 0,
      wts: Math.floor(Date.now() / 1000),
    }
    const signedQuery = await WbiSign(query)
    const info = await retry(() => getDanmuConf(signedQuery, options.headers), 2, 200)
    cachedDanmuConf.set(roomInfo.data.room_id, info)
    danmuInfo = info
  }

  if (!fingerprint) {
    const info = await retry(() => getBuvidConf(options.headers), 2, 200)
    fingerprint = info.data.b_3
  }

  return [roomInfo, danmuInfo, fingerprint]
}

// 获取最新的 img_key 和 sub_key
export async function getWbiKeys(): Promise<WbiKeys> {
  const resp = await request('https://api.bilibili.com/x/web-interface/nav')

  if (!resp.ok)
    throw new Error(`Failed to get wbi keys: ${resp.statusText}`)

  const data = await resp.json()

  const img_url = data.data.wbi_img.img_url
  const sub_url = data.data.wbi_img.sub_url

  return {
    img_key: img_url.slice(
      img_url.lastIndexOf('/') + 1,
      img_url.lastIndexOf('.'),
    ),
    sub_key: sub_url.slice(
      sub_url.lastIndexOf('/') + 1,
      sub_url.lastIndexOf('.'),
    ),
  }
}

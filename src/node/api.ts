import https from 'node:https'
import type { BaseLiveClientOptions, BuvidConfResponse, DanmuConfResponse, RoomResponse } from '../base/types'
import { retry } from '../base/utils'
import { WbiSign } from './sign'

const decoder = new TextDecoder()
export const cachedRoomInfo: Map<number, RoomResponse> = new Map()
export const cachedDanmuConf: Map<number, DanmuConfResponse> = new Map()
let fingerprint: string | undefined

export function getLongRoomId(room: number, headers?: Record<string, string>): Promise<RoomResponse> {
  return new Promise((resolve, reject) => {
    https.get(`https://api.live.bilibili.com/room/v1/Room/mobileRoomInit?id=${room}`, {
      headers,
    }, (res) => {
      let data = new Uint8Array()

      res.on('data', (chunk) => {
        data = new Uint8Array([...data, ...chunk])
      })

      res.once('end', () => {
        resolve(JSON.parse(decoder.decode(data)))
      })
    })
      .on('error', err => reject(err))
  })
}

export function getDanmuConf(query: string, headers?: Record<string, string>): Promise<DanmuConfResponse> {
  return new Promise((resolve, reject) => {
    https.get(`https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?${query}`, {
      headers,
    }, (res) => {
      let data = new Uint8Array()

      res.on('data', (chunk) => {
        data = new Uint8Array([...data, ...chunk])
      })

      res.once('end', () => {
        resolve(JSON.parse(decoder.decode(data)))
      })
    })
      .on('error', err => reject(err))
  })
}

export function getBuvidConf(headers?: Record<string, string>): Promise<BuvidConfResponse> {
  return new Promise((resolve, reject) => {
    https.get('https://api.bilibili.com/x/frontend/finger/spi', {
      headers,
    }, (res) => {
      let data = new Uint8Array()

      res.on('data', (chunk) => {
        data = new Uint8Array([...data, ...chunk])
      })
      res.once('end', () => {
        resolve(JSON.parse(decoder.decode(data)))
      })
    })
      .on('error', err => reject(err))
  })
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

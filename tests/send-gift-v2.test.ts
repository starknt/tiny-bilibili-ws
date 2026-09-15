import type { BaseLiveClientOptions, IWebSocket, IZlib, Message } from '../src/base/types'
import { describe, expect, it } from 'vitest'
import { LiveClient, MESSAGE_EVENT } from '../src/base/base'
import { serialize, WS_OP } from '../src/base/buffer'
import { decodeSendGiftV2, parseSendGiftV2 } from '../src/base/send-gift-v2'

const PB = 'CKaMnwUSCeaaruiJsjMxMhpKaHR0cHM6Ly9pMS5oZHNsYi5jb20vYmZzL2ZhY2UvMWE2ODc3M2U3YzE1MDZiOWZlMTIxMDU5NzNjZWIxN2ZjNTFkMDgyNy5qcGdCAFKkBQi88gESCeWwj+iKseiKsRgBIAEoZDBkOGRCBGdvbGRKEzQ4MTY4NDI0Mjg2NTA2NzU3MTJQxrae1QZYAWI6YmF0Y2g6Z2lmdDpjb21ib19pZDoxMDk5NTIzODo4ODc4MjE5OjMxMDM2OjE3ODkzNjkxNTguNjQxNmgKcGR4BYUBAACAP4gBAZIBBuaKleWWgsABobrdAeoBGQoS5ZCD6JuL5oye55qE5oqY5qOSEIvxnQSKAv8BCIvxnQQS9wEKEuWQg+ibi+aMnueahOaKmOajkhJKaHR0cHM6Ly9pMS5oZHNsYi5jb20vYmZzL2ZhY2UvZGUxOGQ0ZmY1YzBiNWRjNGM3NmE1NmE0ZmZkZTZiZWU5Y2VhNmJlZi5qcGcyYAoS5ZCD6JuL5oye55qE5oqY5qOSEkpodHRwczovL2kxLmhkc2xiLmNvbS9iZnMvZmFjZS9kZTE4ZDRmZjVjMGI1ZGM0Yzc2YTU2YTRmZmRlNmJlZTljZWE2YmVmLmpwZzozCAESL2JpbGliaWxpIOefpeWQjea4uOaIj1VQ5Li744CB55u05pKt6auY6IO95Li75pKtkgIAmgLlAQpKaHR0cHM6Ly9zMS5oZHNsYi5jb20vYmZzL2xpdmUvNTEyNjk3Mzg5MjYyNWYzYTQzYTgyOTBiZTZiNjI1YjVlNTQyNjFhNS5wbmcSS2h0dHBzOi8vaTAuaGRzbGIuY29tL2Jmcy9saXZlLzI4MzU3YmE0Y2Q1NjY0MTg3MzBjYTI5ZGEyYzU1MmVmYTdlNGEzOTAud2VicCpKaHR0cHM6Ly9pMC5oZHNsYi5jb20vYmZzL2xpdmUvYzgwNmVlMjkzOTRhYWI0ODc3ZmEzZDUzNWRhY2E1YzY2YzYzMTMwNi5naWaqAgBYAWoCCBZ6xQEIpoyfBRK9AQoJ5pqu6ImyMzEyEkpodHRwczovL2kxLmhkc2xiLmNvbS9iZnMvZmFjZS8xYTY4NzczZTdjMTUwNmI5ZmUxMjEwNTk3M2NlYjE3ZmM1MWQwODI3LmpwZzJXCgnmmq7oibIzMTISSmh0dHBzOi8vaTEuaGRzbGIuY29tL2Jmcy9mYWNlLzFhNjg3NzNlN2MxNTA2YjlmZTEyMTA1OTczY2ViMTdmYzUxZDA4MjcuanBnOgsg////////////AQ=='

describe('send gift v2', () => {
  it('decodes the protobuf broadcast and all gift items', () => {
    const broadcast = decodeSendGiftV2(PB)

    expect(broadcast.uid).toBe(10995238)
    expect(broadcast.uname).toBe('暮色312')
    expect(broadcast.gift_list).toHaveLength(1)
    expect(broadcast.gift_list[0]).toMatchObject({
      gift_id: 31036,
      gift_name: '小花花',
      num: 1,
      price: 100,
      total_coin: 100,
      coin_type: 'gold',
      action: '投喂',
    })
  })

  it('flattens broadcast metadata into each gift message', () => {
    expect(parseSendGiftV2(PB)[0]).toMatchObject({
      uid: 10995238,
      uname: '暮色312',
      gift_name: '小花花',
      medal_level: 0,
      blind_gift_name: '',
    })
  })

  it('emits a parsed SEND_GIFT_V2 event', async () => {
    const socket = {
      type: 'websocket',
      send() {},
      close() {},
      reconnect() {},
    } as IWebSocket
    const client = new LiveClient({
      room: 1,
      stub: false,
      socket,
      zlib: {} as IZlib,
    } as BaseLiveClientOptions<Uint8Array>)
    const gift = new Promise<Message<any>>(resolve => client.once('SEND_GIFT_V2', resolve))
    const packet = serialize(WS_OP.MESSAGE, {
      cmd: 'SEND_GIFT_V2',
      danmu: { area: 1 },
      data: { dmscore: 672, pb: PB },
    })
    // serialize() uses protocol version 1; JSON messages from the server use version 0.
    packet[7] = 0

    client.emit(MESSAGE_EVENT, packet)

    await expect(gift).resolves.toMatchObject({
      data: {
        cmd: 'SEND_GIFT_V2',
        danmu: { area: 1 },
        data: {
          dmscore: 672,
          uid: 10995238,
          gift_name: '小花花',
          num: 1,
        },
      },
    })
  })
})

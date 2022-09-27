# tiny-bilibili-ws

[![NPM version](https://img.shields.io/npm/v/tiny-bilibili-ws?color=a1b858&label=)](https://www.npmjs.com/package/tiny-bilibili-ws)

## 特点

- 轻松支持浏览器
- 轻量
- 类型安全

## 安装

```bash
    npm install --save-dev tiny-bilibili-ws
```

## 简单使用

```typescript
/**
 * 通常情况下你只需要第一个参数 roomId
 * KeepLiveTCP, KeepLiveWS 第一个参数均为 roomId
 */

// In Node Environment
import { KeepLiveTCP, KeepLiveWS, getLongRoomId } from "tiny-bilibili-ws";

// 当 短ID 获取不到弹幕信息时, 你可以尝试使用 getLongRoomId, 获取 room_id
const res = await getLongRoomId(650)

new KeepLiveTCP(res.room_id)

// or browser
import { KeepLiveWS, getLongRoomId } from 'tiny-bilibili-ws/browser'

// 当 短ID 获取不到弹幕信息时, 你可以尝试使用 getLongRoomId, 获取 room_id
const res = await getLongRoomId(650)

new KeepLiveWS(res.room_id)
```

## Typescript 支持

```typescript
import { KeepLiveTCP, getLongRoomId, ListenerEvents, Message } from "tiny-bilibili-ws";

const res = await getLongRoomId(650)

const live = new KeepLiveTCP(res.room_id)

live.on<ListenerEvents>('msg', (data: Message<any>) => {
    console.log(data)
    /**
     * 可能会打印出类似于这样信息
     * 
     * {
     *  meta: { op: 5, headerLength: 16, packetLength: 256, sequence: 1: ver: 3 }
     *  data: {
         cmd: "SEND_GIFT",
         data: {
           giftName: '辣条',
            num: 1,
            uname: 'simon3000',
            face: 'http://i1.hdslb.com/bfs/facec26b9f670b10599ad105e2a7fea4b5f21c0f0bcf.jpg',
            guard_level: 0,
            rcost: 2318827,
            uid: 3499295,
            top_list: [],
            timestamp: 1555690631,
            giftId: 1,
            giftType: 0,
            action: '喂食',
            super: 0,
            super_gift_num: 0,
            price: 100,
            rnd: '1555690616',
            newMedal: 0,
            newTitle: 0,
            medal: [],
            title: '',
            beatId: '0',
            biz_source: 'live',
            metadata: '',
            remain: 6,
            gold: 0,
            silver: 0,
            eventScore: 0,
            eventNum: 0,
            smalltv_msg: [],
            specialGift: null,
            notice_msg: [],
            capsule: null,
            addFollow: 0,
            effect_block: 1,
            coin_type: 'silver',
            total_coin: 100,
            effect: 0,
            tag_image: '',
            user_count: 0
     *    }
     *  }
     * }
     */
})
```

## API

`API` 基本与 [bilibili-live-ws](https://github.com/simon300000/bilibili-live-ws) 的 `API` 兼容

- live.on('live')

- live.on('heartbeat', online /** 人气值 */ => {})

收到服务器心跳包，会在30秒之后自动发送心跳包。

- live.on('msg')

会监听到所有的消息

- live.on('message', buffer /** `Uint8Array` */ => {})

会监听到所有的消息, 获得信息原始数据(`Uint8Array`)

- live.on(cmd, (message) => {})

监听特定的 `cmd`

- live.on('error', err => {})

监听错误消息

## License

[MIT](./LICENSE) License © 2022 [starknt](https://github.com/starknt)

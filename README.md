# tiny-bilibili-ws

[![NPM version](https://img.shields.io/npm/v/tiny-bilibili-ws?color=a1b858&label=npm)](https://www.npmjs.com/package/tiny-bilibili-ws)

为啥会有这个项目？[bilibili-live-ws](https://github.com/simon300000/bilibili-live-ws) 这个项目已经很久没有维护了, 并且浏览器支持操作比较繁琐。

## 特点

- 轻松支持浏览器
- 轻量
- 类型安全

## Working

- [ ] 类型
- [x] Auth Field
- [x] 自定义连接地址

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
     {
        "meta": { "op": 5, "headerLength": 16, "packetLength": 256, "sequence": 1, "ver": 3 },
        "data": {
            "cmd": "SEND_GIFT",
            "data": {
                "giftName": "辣条",
                "num": 1,
                "uname": "simon3000",
                "face": "http://i1.hdslb.com/bfs/facec26b9f670b10599ad105e2a7fea4b5f21c0f0bcf.jpg",
                "guard_level": 0,
                "rcost": 2318827,
                "uid": 3499295,
                "top_list": [],
                "timestamp": 1555690631,
                "giftId": 1,
                "giftType": 0,
                "action": "喂食",
                "super": 0,
                "super_gift_num": 0,
                "price": 100,
                "rnd": "1555690616",
                "newMedal": 0,
                "newTitle": 0,
                "medal": [],
                "title": "",
                "beatId": "0",
                "biz_source": "live",
                "metadata": "",
                "remain": 6,
                "gold": 0,
                "silver": 0,
                "eventScore": 0,
                "eventNum": 0,
                "smalltv_msg": [],
                "specialGift": null,
                "notice_msg": [],
                "capsule": null,
                "addFollow": 0,
                "effect_block": 1,
                "coin_type": "silver",
                "total_coin": 100,
                "effect": 0,
                "tag_image": "",
                "user_count": 0
            }
        }
    }
     */
})
```

## 参考资料

Bilibili API: [https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md](https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md)

## API

`API` 基本与 [bilibili-live-ws](https://github.com/simon300000/bilibili-live-ws) 的 `API` 兼容

- live.on('live')

连接成功后触发

- live.on('heartbeat', online /** 人气值 */ => {})

收到服务器心跳包，会在30秒之后自动发送心跳包。

- live.on('msg')

会监听到所有的 `cmd` 消息

- live.on('message', buffer /** `Uint8Array` */ => {})

会监听到所有的消息, 获得信息原始数据 `Uint8Array`

- live.on(cmd, (message /** Message\<any\> */) => {})

监听特定的 `cmd`, 关于 `cmd` [详见于此](https://github.com/simon300000/bilibili-live-ws)

- live.runWhenConnected(() => {})

等到连接成功后('live' 事件触发时)，才会执行传入的函数

- live.getOnline()

立即调用 live.heartbeat() 刷新人气数值，并且返回 Promise.resolve 人气刷新后数值

- live.onlyListener(events /** string[] */)

选择你需要监听 `cmd` 事件，可能会提高执行效率。 如果你调用了这个方法, 你就只能监听到你传入的 `cmd` 事件。举个例子:

```typescript
live.onlyListener(['DANMU_MSG'])

live.on('DANMU_MSG', (message: Message<any>) => { // 有弹幕会被触发
    console.log(message)
})

live.on('SEND_GIFT', (message: Message<any>) => {  // 有礼物, 但不会被触发
    console.log(message)
})

live.on('msg', (message: Message<any>) => { // 只有弹幕能触发
    console.log(message)
})

live.on('message', (buffer: Uint8Array) => { // DANMU_MSG 和 SEND_GIFT 都会被触发
    console.log(buffer)
})
```

- live.send(op /**WS_OP */, data /** string | Record\<string, any\>*/)

发送消息到服务器, `send` 会自动序列化数据, 如果你不想这样, 你应该使用下文提到的 `live.ws` 或者 `live.tcpSocket` 来发送数据。

- live.close()

主动关闭连接，应该会监听到 `close` 事件

最后，你还可以通过 `live.ws` 或者是 `live.tcpSocket`，获取原始的 `socket` 实例。

## License

[MIT](./LICENSE) License © 2022 [starknt](https://github.com/starknt)

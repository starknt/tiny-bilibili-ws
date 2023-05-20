---
title: Guide
description: Getting started with Tiny-Bilibili-WS
---

## 安装

```bash
  npm install tiny-bilibili-ws
```

## 食用方法

### 在 Nodejs 中使用

```typescript
import { KeepLiveTCP, toMessageData, getLongRoomId } from 'tiny-bilibili-ws'

const { data } = await getLongRoomId(652581)
const room = data.room_id
const tcp = new KeepLiveTCP(room)

tcp.runWhenConnected(() => {
  console.log(`正在监听 ${room}`)
})

tcp.on('heartbeat', (online) => {
  console.log('人气值: ', online)
})

tcp.on('DANMU_MSG', (danmu) => {
  console.log(toMessageData(danmu))
})

tcp.on('error', (e) => {
  console.error('错误: ', e)
})

tcp.on('close', () => {
  console.log(`退出监听 ${room}`)
})
```

### 在浏览器中使用

```typescript
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'

// getLongRoomId API 在浏览器无法使用 #2

const room = 652581
const ws = new KeepLiveWS(room)

ws.runWhenConnected(() => {
  console.log(`正在监听 ${room}`)
})

ws.on('heartbeat', (online) => {
  console.log('人气值: ', online)
})

ws.on('DANMU_MSG', (danmu) => {
  console.log(toMessageData(danmu))
})

ws.on('error', (e) => {
  console.error('错误: ', e)
})

ws.on('close', () => {
  console.log(`退出监听 ${room}`)
})
```

## 高级用法

```typescript
import { KeepLiveTCP, KeepLiveWS, getLongRoomId, serialize, deserialize, WS_OP, WS_BODY_PROTOCOL_VERSION, Message } from "tiny-bilibili-ws"

// 扩展内置的 BILIBILI CMD 类型

const res = await getLongRoomId(650)

const live = new KeepLiveTCP<{
    A_BILIBILI_CMD: Uint8Array
    B_BILIBILI_CMD: void
    C_BILIBILI_CMD: [Message<any>, number] /* 当前最多支持十个参数 */
}>(res.data.room_id)

live.on('A_BILIBILI_CMD', (arg1 /* Uint8Array */) => {
    console.log(arg1) // Uint8Array[]
})

live.on('B_BILIBILI_CMD', () => {
    console.log('B_BILIBILI_CMD') // B_BILIBILI_CMD
})

live.on('C_BILIBILI_CMD', (arg1 /* Message<any> */, arg2 /* number */) => {
    console.log(arg1, arg2) // Message 2
})

live.emit('A_BILIBILI_CMD', serialize(WS_OP.MESSAGE, "test"))
live.emit('B_BILIBILI_CMD')
live.emit('C_BILIBILI_CMD', { meta: { op: WS_OP.MESSAGE, ver: WS_BODY_PROTOCOL_VERSION.NORMAL, packetLength: 17, headerLength: 16, sequence: 1 }, data: 1 }, 2)
```

---
title: 食用指南
description: Tiny-Bilibili-WS 的开始教程
---

## 安装

```bash
  npm install tiny-bilibili-ws
```

## 食用方法

### 在 Nodejs 中使用

```typescript
import { KeepLiveWS, toMessageData } from 'tiny-bilibili-ws'

const room = 652581
const live = new KeepLiveWS(room, {
  // 触发风控后，你会无法获取弹幕发送者的用户名，详情可见：https://github.com/ddiu8081/blive-message-listener/issues/29， 传入以下参数即可解除
  headers: {
    Cookie: 'xxx', // 从 Bilibili 网页版获取
  },
  uid: 0, // 你的 Cookie 对应的 UID
})

live.runWhenConnected(() => {
  console.log(`正在监听 ${room}`) // 连接成功后才会触发
})

live.on('heartbeat', (online) => {
  console.log('人气值: ', online)
})

live.on('DANMU_MSG', (danmu) => {
  console.log(toMessageData(danmu))
})

live.on('error', (e) => {
  console.error('错误: ', e)
})

live.on('close', () => {
  console.log(`退出监听 ${room}`)
})
```

### 在浏览器中使用

```typescript
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'

// 因为存在跨域问题, Bilibili API 不能在浏览器中访问，现在需要手动传入 key 和 url
// 例子可以参考 https://github.com/starknt/tiny-bilibili-ws/blob/master/playground/src/App.vue#L13
const room = 652581
const live = new KeepLiveWS(room, {
  url: 'xxx',
  key: 'xxx',
})

live.runWhenConnected(() => {
  console.log(`正在监听 ${room}`) // 连接成功后才会触发
})

live.on('heartbeat', (online) => {
  console.log('人气值: ', online)
})

live.on('DANMU_MSG', (danmu) => {
  console.log(toMessageData(danmu))
})

live.on('error', (e) => {
  console.error('错误: ', e)
})

live.on('close', () => {
  console.log(`退出监听 ${room}`)
})
```

## 高级用法

```typescript
import { KeepLiveTCP, KeepLiveWS, Message, WS_BODY_PROTOCOL_VERSION, WS_OP, deserialize, serialize } from 'tiny-bilibili-ws'

// 扩展内置的 BILIBILI CMD 类型

const room = 652581

const live = new KeepLiveTCP<{
  A_BILIBILI_CMD: Uint8Array
  B_BILIBILI_CMD: void
  C_BILIBILI_CMD: [Message<any>, number] /* 当前最多支持十个参数 */
}>(room)

live.on('A_BILIBILI_CMD', (arg1 /* Uint8Array */) => {
  console.log(arg1) // Uint8Array[]
})

live.on('B_BILIBILI_CMD', () => {
  console.log('B_BILIBILI_CMD') // B_BILIBILI_CMD
})

live.on('C_BILIBILI_CMD', (arg1 /* Message<any> */, arg2 /* number */) => {
  console.log(arg1, arg2) // Message 2
})

live.emit('A_BILIBILI_CMD', serialize(WS_OP.MESSAGE, 'test'))
live.emit('B_BILIBILI_CMD')
live.emit('C_BILIBILI_CMD', { meta: { op: WS_OP.MESSAGE, ver: WS_BODY_PROTOCOL_VERSION.NORMAL, packetLength: 17, headerLength: 16, sequence: 1 }, data: 1 }, 2)
```

# tiny-bilibili-ws

[![Version](https://img.shields.io/npm/v/tiny-bilibili-ws?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/tiny-bilibili-ws)
[![Build Size](https://img.shields.io/bundlephobia/minzip/jotai?label=bundle%20size&style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/result?p=tiny-bilibili-ws)

## 特点

- 同时支持浏览器和NodeJs环境
- 开箱即用的 Typescript 类型提示
- 轻量级的包体积

## 文档

阅读 [文档](https://starknt.github.io/tiny-bilibili-ws) 查看更多信息.

## 安装

```bash
    npm install tiny-bilibili-ws
```

## 简单使用

```typescript
// In Nodejs environment
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

// or browser environment
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'

// 因为存在跨域问题, getLongRoomId 这个 API 不能在浏览器运行

new KeepLiveWS(652581) // Now Long Room id: 4350043
```

## API 文档

- live.on('live')

连接成功后触发

- live.on('heartbeat', online => {})

收到服务器心跳包，会在30秒之后自动发送心跳包, `online` 是当前直播间的人气值。

- live.on('msg')

会监听到所有的 `cmd` 消息

- live.on('message', buffer => {})

会监听到所有的消息, 获得信息原始数据 `Uint8Array`, 但是你必须设置 `raw` 为 `true`，你才可以监听到该消息。
一个简单的例子如下：

```typescript
const res = await getLongRoomId(650)

const live = new KeepLiveTCP(res.room_id, {
    raw: true
})

live.on('message', (buffer: Uint8Array) => {
    console.log(buffer)
})
```

- live.on(cmd, (message /** Message\<any\> */) => {})

监听特定的 `cmd`, 关于 `cmd`, 例如 `DANMU_MSG`

- live.runWhenConnected(() => {})

等到连接成功后('live' 事件触发时)，才会执行传入的函数

- live.getOnline()

立即调用 live.heartbeat() 刷新人气数值，并且返回人气刷新后的值

- live.onlyListener(events)

选择你需要监听 `cmd` 事件，可能会提高执行效率。 如果你调用了这个方法, 你就只能监听到你传入的 `cmd` 事件。举个例子:

```typescript
live.onlyListener(['DANMU_MSG'])

live.on('DANMU_MSG', (message) => { // 有弹幕会被触发
    console.log(message)
})

live.on('SEND_GIFT', (message) => {  // 有礼物, 但不会被触发
    console.log(message)
})

live.on('msg', (message) => { // 只有弹幕能触发
    console.log(message)
})

// 需要设置 `raw`
live.on('message', (buffer) => { // DANMU_MSG 和 SEND_GIFT 都会被触发
    console.log(buffer)
})
```

- live.send(op /**WS_OP */, data /** string | Record\<string, any\>*/)

发送消息到服务器, `send` 会自动序列化数据, 如果你不想这样, 你应该使用下文提到的 `live.ws` 或者 `live.tcpSocket` 来发送数据。

- live.close()

主动关闭连接，应该会监听到 `close` 事件

最后，你还可以通过 `live.ws` 或者是 `live.tcpSocket`，获取原始的 `socket` 实例。

## Credits

Inspired by [https://github.com/simon300000/bilibili-live-ws](https://github.com/simon300000/bilibili-live-ws)

## 参考资料

Bilibili API: [https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md](https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md)

## License

[MIT](./LICENSE) License ©2022 [starknt](https://github.com/starknt)

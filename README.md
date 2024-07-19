# tiny-bilibili-ws

[![Version](https://img.shields.io/npm/v/tiny-bilibili-ws?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/tiny-bilibili-ws)
[![Build Size](https://img.shields.io/bundlephobia/minzip/jotai?label=bundle%20size&style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/result?p=tiny-bilibili-ws)
[![jsDocs.io](https://img.shields.io/badge/jsDocs.io-reference-blue)](https://www.jsdocs.io/package/tiny-bilibili-ws)

## 特点

- 同时支持浏览器和NodeJs环境
- 开箱即用的 Typescript 类型提示
- 轻量级的包体积

## 文档

阅读 [文档](https://starknt.github.io/tiny-bilibili-ws) 查看更多信息.

## 安装

### Npm

```bash
npm install --save tiny-bilibili-ws
```

### Yarn

```bash
yarn add tiny-bilibili-ws
```

### Pnpm

```bash
pnpm install tiny-bilibili-ws
```

## 简单使用

```typescript
// In Nodejs environment
import { KeepLiveTCP, getLongRoomId, toMessageData } from 'tiny-bilibili-ws'

// or browser environment
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'

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

// 因为存在跨域问题, getLongRoomId 这个 API 不能在浏览器中运行

new KeepLiveWS(652581) // Now Long Room id: 4350043
```

## Credits

Inspired by [https://github.com/simon300000/bilibili-live-ws](https://github.com/simon300000/bilibili-live-ws)

## 参考资料

Bilibili API: [https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md](https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md)

## License

[MIT](./LICENSE) License ©2022 [starknt](https://github.com/starknt)

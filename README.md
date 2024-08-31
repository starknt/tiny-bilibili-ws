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

## Credits

Inspired by [https://github.com/simon300000/bilibili-live-ws](https://github.com/simon300000/bilibili-live-ws)

## 参考资料

Bilibili API: [https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md](https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md)

## License

[MIT](./LICENSE) License ©2022 [starknt](https://github.com/starknt)

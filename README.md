# tiny-bilibili-ws

[![NPM version](https://img.shields.io/npm/v/tiny-bilibili-ws?color=a1b858&label=)](https://www.npmjs.com/package/tiny-bilibili-ws)

## Future

- support browser environment
- tiny
- type-safe

## Install

```bash
    npm install --save-dev tiny-bilibili-ws
```

## Usage

```typescript
// In Node Environment
import { KeepLiveTCP } from "tiny-bilibili-ws";

new KeepLiveTCP(1017)

// or browser
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'

new KeepLiveWS(1017)
```

## License

[MIT](./LICENSE) License © 2022 [starknt](https://github.com/starknt)

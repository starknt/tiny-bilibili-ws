import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, OPEN_EVENT, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base'
import type { BaseLiveClientOptions, WSOptions } from './types'
import { DEFAULT_WS_OPTIONS } from './types'
import { inflates } from './browser/inflate'

export class KeepLiveWS extends LiveClient {
  ws: WebSocket

  constructor(roomId: number, options: WSOptions = DEFAULT_WS_OPTIONS) {
    options = Object.assign({}, DEFAULT_WS_OPTIONS, options)

    const socket = new WebSocket(options.ssl ? WEBSOCKET_SSL_URL : WEBSOCKET_URL)
    socket.binaryType = 'arraybuffer'

    socket.addEventListener('open', () => this.emit(OPEN_EVENT))
    socket.addEventListener('close', () => this.emit(CLOSE_EVENT))
    socket.addEventListener('error', (...params: any[]) => this.emit(ERROR_EVENT, ...params))
    socket.addEventListener('message', (e: MessageEvent<ArrayBuffer>) => this.emit(MESSAGE_EVENT, new Uint8Array(e.data)))

    const liveOptions: BaseLiveClientOptions = {
      ...options,
      socket,
      room: roomId,
      zlib: inflates,
    }

    super(liveOptions)

    this.ws = socket
  }
}


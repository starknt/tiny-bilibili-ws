import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, OPEN_EVENT, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base'
import type { BaseLiveClientOptions, ListenerEvents, WSOptions } from './types'
import { DEFAULT_WS_OPTIONS } from './types'
import { inflates } from './browser/inflate'

export class KeepLiveWS<T extends string = ListenerEvents> extends LiveClient<T> {
  ws: WebSocket

  constructor(roomId: number, options: WSOptions = DEFAULT_WS_OPTIONS) {
    const resolvedOptions = Object.assign({}, DEFAULT_WS_OPTIONS, options)
    const url = resolvedOptions.url ?? options.ssl ? WEBSOCKET_SSL_URL : WEBSOCKET_URL
    const socket = new WebSocket(url)
    socket.binaryType = 'arraybuffer'

    socket.addEventListener('open', () => this.emit(OPEN_EVENT))
    socket.addEventListener('close', () => this.emit(CLOSE_EVENT))
    socket.addEventListener('error', (...params: any[]) => this.emit(ERROR_EVENT, ...params))
    socket.addEventListener('message', (e: MessageEvent<ArrayBuffer>) => this.emit(MESSAGE_EVENT, new Uint8Array(e.data)))

    const liveOptions: BaseLiveClientOptions = {
      ...resolvedOptions,
      socket,
      room: roomId,
      zlib: inflates,
    }

    super(liveOptions)

    this.ws = socket
  }
}


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, OPEN_EVENT, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base/base'
import type { BaseLiveClientOptions, Merge, WSOptions } from './base/types'
import { DEFAULT_WS_OPTIONS } from './base/types'
import { inflates } from './browserlib/inflate'
import type { EventKey } from './base/eventemitter'

export interface WSEvents {
  // [OPEN_EVENT]: void
  // [MESSAGE_EVENT]: Uint8Array
  // [ERROR_EVENT]: Event
  // [CLOSE_EVENT]: CloseEvent

  error: Event
  close: CloseEvent
  message: Uint8Array
}

export class KeepLiveWS<E extends Record<EventKey, any> = { }> extends LiveClient<Merge<WSEvents, E>> {
  ws: WebSocket

  constructor(roomId: number, options: WSOptions = DEFAULT_WS_OPTIONS) {
    const resolvedOptions = Object.assign({}, DEFAULT_WS_OPTIONS, options)
    const url = resolvedOptions.url ?? options.ssl ? WEBSOCKET_SSL_URL : WEBSOCKET_URL
    const socket = new WebSocket(url)
    socket.binaryType = 'arraybuffer'

    socket.addEventListener('open', () => this.emit(OPEN_EVENT))
    socket.addEventListener('close', e => this.emit(CLOSE_EVENT, e))
    socket.addEventListener('error', e => this.emit(ERROR_EVENT, e))
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

export { WS_OP, WS_BODY_PROTOCOL_VERSION, serialize, deserialize } from './base/buffer'
export { EventEmitter } from './base/eventemitter'
export { fromEvent, toMessageData } from './base/utils'

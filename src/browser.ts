import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, OPEN_EVENT, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base/base'
import type { BaseLiveClientOptions, IWebSocket, Merge, WSOptions } from './base/types'
import { DEFAULT_WS_OPTIONS } from './base/types'
import { parser } from './base/buffer'
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

    const liveOptions: BaseLiveClientOptions = {
      ...resolvedOptions,
      socket: {
        type: 'websocket',
        send: (data) => {
          this.ws.send(data)
        },
        close: () => {
          this.ws.close()
        },
        reconnect: () => {
          this.ws?.close()
          this.ws = null!
          const socket = new WebSocket(resolvedOptions.url ?? options.ssl ? WEBSOCKET_SSL_URL : WEBSOCKET_URL)
          socket.binaryType = 'arraybuffer'
          this.ws = socket
          this._bindEvent(socket)
        },
      } as IWebSocket,
      timeout: 30 * 1000, // 30s
      room: roomId,
      zlib: inflates,
    }

    super(liveOptions)

    this.ws = socket
  }

  private _bindEvent(socket: WebSocket) {
    // @ts-expect-error emit event
    socket.addEventListener('open', () => this.emit(OPEN_EVENT))
    // @ts-expect-error emit event
    socket.addEventListener('close', e => this.emit(CLOSE_EVENT, e))
    // @ts-expect-error emit event
    socket.addEventListener('error', e => this.emit(ERROR_EVENT, e))
    // @ts-expect-error emit event
    socket.addEventListener('message', (e: MessageEvent<ArrayBuffer>) => this.emit(MESSAGE_EVENT, new Uint8Array(e.data)))
  }
}

export function deserialize(buffer: Uint8Array) {
  return parser(buffer, inflates)
}
export { WS_OP, WS_BODY_PROTOCOL_VERSION, serialize } from './base/buffer'
export { EventEmitter } from './base/eventemitter'
export { fromEvent, toMessageData } from './base/utils'

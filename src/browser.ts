import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, OPEN_EVENT, SOCKET_HOSTS, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base/base'
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
    const ssl = !!resolvedOptions.ssl
    const url = resolvedOptions.url
      ?? (
        ssl
          ? WEBSOCKET_SSL_URL(resolvedOptions.host ?? SOCKET_HOSTS.DEFAULT, resolvedOptions.port, resolvedOptions.path)
          : WEBSOCKET_URL(SOCKET_HOSTS.DEFAULT, resolvedOptions.port, resolvedOptions.path)
      )
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
        reconnect: (_url?: string) => {
          this.ws?.close()
          this.ws = null!
          const socket = new WebSocket(_url ?? url)
          socket.binaryType = 'arraybuffer'
          this.ws = socket
          this._bindEvent(socket)
        },
      } as IWebSocket,
      room: roomId,
      zlib: inflates,
    }

    super(liveOptions)

    this.ws = socket
    this._bindEvent(socket)
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

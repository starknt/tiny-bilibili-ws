import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, NOOP, OPEN_EVENT, SOCKET_HOSTS, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base/base'
import type { BaseLiveClientOptions, HostServerList, IWebSocket, Merge, WSOptions } from './base/types'
import { DEFAULT_WS_OPTIONS } from './base/types'
import { parser } from './base/buffer'
import { inflates } from './browserlib/inflate'
import type { EventKey } from './base/eventemitter'
import { parseRoomId, randomElement } from './base/utils'

export interface WSEvents {
  // [OPEN_EVENT]: void
  // [MESSAGE_EVENT]: Uint8Array
  // [ERROR_EVENT]: Event
  // [CLOSE_EVENT]: CloseEvent

  error: Event
  close: CloseEvent
  message: Uint8Array
}

const DEFAULT_HOST_LIST: Array<HostServerList> = [
  {
    host: 'broadcastlv.chat.bilibili.com',
    port: 2243,
    wss_port: 443,
    ws_port: 2244,
  },
]

export class KeepLiveWS<E extends Record<EventKey, any> = object> extends LiveClient<Merge<WSEvents, E>> {
  ws!: WebSocket

  constructor(roomId: number, options: WSOptions = DEFAULT_WS_OPTIONS) {
    const resolvedOptions = Object.assign({}, DEFAULT_WS_OPTIONS, options)

    const liveOptions: BaseLiveClientOptions<any> = {
      ...resolvedOptions,
      socket: {
        type: 'websocket',
        send: (data) => {
          this.ws.send(data)
        },
        close: () => {
          this.ws.close()
        },
        reconnect: NOOP,
      } as IWebSocket,
      room: roomId,
      zlib: inflates,
    }

    super(liveOptions)

    this.init(liveOptions)
  }

  private async getWebSocketUrl(ssl: boolean, _: number) {
    const host = randomElement(DEFAULT_HOST_LIST)

    return ssl
      ? WEBSOCKET_SSL_URL(
        this.options.host ?? host.host,
        this.options.port ?? host.wss_port,
        this.options.path,
      )
      : WEBSOCKET_URL(
        this.options.host ?? host.host,
        this.options.port ?? host.ws_port,
        this.options.path,
      )
  }

  private async init(options: BaseLiveClientOptions<any>) {
    const roomId = parseRoomId(options.room)
    this.roomId = roomId

    const ssl = !!options.ssl
    const url = await this.getWebSocketUrl(ssl, roomId)
    this.options.room = roomId
    this.options.url = url

    options.socket.reconnect = (reconnectUrl?: string) => {
      this.ws?.close()
      this.ws = null!
      let socket: WebSocket | undefined
      const _url = reconnectUrl ?? url
      if (options.customWebSocket) {
        const ws = options.customWebSocket(_url)
        if (ws instanceof Promise) {
          ws.then((socket) => {
            socket.binaryType = 'arraybuffer'
            this.ws = socket
            this._bindEvent(socket)
          })
        }
        else {
          socket = ws
          ws.binaryType = 'arraybuffer'
        }
      }
      else {
        socket = new WebSocket(_url)
        socket.binaryType = 'arraybuffer'
      }
      if (socket) {
        this.ws = socket
        this._bindEvent(socket)
      }
    }

    let socket: WebSocket | undefined
    if (options.customWebSocket) {
      const ws = options.customWebSocket(url)
      if (ws instanceof Promise) {
        ws.then((socket) => {
          socket.binaryType = 'arraybuffer'
          this.ws = socket
          this._bindEvent(socket)
        })
      }
      else {
        socket = ws
        ws.binaryType = 'arraybuffer'
      }
    }
    else {
      socket = new WebSocket(url)
      socket.binaryType = 'arraybuffer'
    }

    if (socket) {
      this.ws = socket
      this._bindEvent(socket)
    }
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

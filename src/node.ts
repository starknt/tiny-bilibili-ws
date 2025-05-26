import type { Socket } from 'node:net'
import { connect } from 'node:net'
import type { CloseEvent, ErrorEvent } from 'ws'
import WebSocket from 'ws'
import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, NODE_SOCKET_PORT, NOOP, OPEN_EVENT, SOCKET_HOST, WEBSOCKET_PORT, WEBSOCKET_SSL_PORT, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base/base'
import { inflates } from './node/inflate'
import type { BaseLiveClientOptions, HostList, ISocket, IWebSocket, Merge, TCPOptions, WSOptions } from './base/types'
import { DEFAULT_WS_OPTIONS } from './base/types'
import type { EventKey } from './base/eventemitter'
import { parser, readInt32BE } from './base/buffer'
import { parseRoomId, randomElement } from './base/utils'
import { cachedRoomInfo, getCachedInfo } from './node/api'

export interface TCPEvents {
  // [OPEN_EVENT]: void
  // [MESSAGE_EVENT]: Buffer
  // [ERROR_EVENT]: Error
  // [CLOSE_EVENT]: void

  error: Error
  close: boolean
  message: Uint8Array
}

export class KeepLiveTCP<E extends Record<EventKey, any> = object> extends LiveClient<Merge<TCPEvents, E>> {
  private buffer: Uint8Array = new Uint8Array()
  private i = 0
  tcpSocket!: Socket

  constructor(roomId: number, options: TCPOptions = DEFAULT_WS_OPTIONS) {
    const resolvedOptions = Object.assign({}, DEFAULT_WS_OPTIONS, options)

    const liveOptions: BaseLiveClientOptions<any> = {
      ...resolvedOptions,
      socket: {
        type: 'tcp',
        write: (data) => {
          this.tcpSocket.write(data)
        },
        reconnect: NOOP,
        end: () => {
          this.tcpSocket.end()
        },
      } as ISocket,
      zlib: inflates,
      room: roomId,
    }

    super(liveOptions)

    this.init(liveOptions)
  }

  private async getSocketUrl(roomId: number): Promise<{
    host?: string
    port?: number
  }> {
    let host: HostList | undefined
    try {
      const [_, danmu, fingerprint] = await getCachedInfo(roomId, this.options)
      if (!this.options.key)
        this.options.key = danmu.data.token
      // ref: https://github.com/SocialSisterYi/bilibili-API-collect/issues/933
      if (!this.options.buvid) {
        this.options.buvid = fingerprint
      }
      host = randomElement(danmu.data.host_list)
    }
    catch (error) {
      console.error(error)
    }

    return {
      host: host?.host,
      port: host?.port,
    }
  }

  private async init(options: BaseLiveClientOptions<any>) {
    const roomId = parseRoomId(options.room)

    const url = options.url ? options.url : await this.getSocketUrl(roomId)
    const room = cachedRoomInfo.get(roomId)?.data?.room_id || roomId
    this.options.room = room
    this.roomId = room

    const socket = typeof url === 'string'
      ? connect(url)
      : connect(url.port ?? NODE_SOCKET_PORT, url.host ?? SOCKET_HOST)

    this.options.socket.reconnect = () => {
      this.tcpSocket?.end()
      this.tcpSocket = null!
      const socket = typeof url === 'string'
        ? connect(url)
        : connect(url.port ?? NODE_SOCKET_PORT, url.host ?? SOCKET_HOST)
      this.tcpSocket = socket
      this._bindEvent(socket)
    }
    this.tcpSocket = socket
    this._bindEvent(socket)
  }

  private _bindEvent(socket: Socket) {
    // @ts-expect-error emit event
    socket.on('ready', () => this.emit(OPEN_EVENT))
    // @ts-expect-error emit event
    socket.on('close', hadError => this.emit(CLOSE_EVENT, hadError))
    // @ts-expect-error emit event
    socket.on('error', e => this.emit(ERROR_EVENT, e))
    socket.on('data', (buffer) => {
      this.buffer = new Uint8Array([...this.buffer, ...buffer])
      this.splitBuffer()
    })
  }

  private splitBuffer() {
    while (this.buffer.length >= 4 && readInt32BE(this.buffer, 0) <= this.buffer.length) {
      const size = readInt32BE(this.buffer, 0)
      const pack = this.buffer.subarray(0, size)
      this.buffer = this.buffer.subarray(size)
      this.i++
      if (this.i > 5) {
        this.i = 0
        this.buffer = new Uint8Array(this.buffer)
      }
      // @ts-expect-error emit event
      this.emit(MESSAGE_EVENT, pack)
    }
  }
}

export interface WSEvents {
  // [OPEN_EVENT]: void
  // [MESSAGE_EVENT]: Buffer
  // [ERROR_EVENT]: ErrorEvent
  // [CLOSE_EVENT]: CloseEvent

  error: ErrorEvent | Error
  close: CloseEvent
  message: Uint8Array
}

export class KeepLiveWS<E extends Record<EventKey, any> = object> extends LiveClient<Merge<WSEvents, E>> {
  ws!: WebSocket

  constructor(roomId: number, options: WSOptions = DEFAULT_WS_OPTIONS) {
    const resolvedOptions = Object.assign({}, DEFAULT_WS_OPTIONS, options)

    const liveOptions: BaseLiveClientOptions<Uint8Array> = {
      ...resolvedOptions,
      socket: {
        type: 'websocket',
        send: (data) => {
          this.ws.send(data, (err) => {
            if (err)
            // @ts-expect-error emit event
              this.emit(ERROR_EVENT, err)
          })
        },
        close: () => {
          this.ws.close()
        },
        reconnect: NOOP,
      } as IWebSocket,
      zlib: inflates,
      room: roomId,
    }

    super(liveOptions)

    this.init(liveOptions)
  }

  private async getWebSocketUrl(ssl: boolean, roomId: number) {
    let host: HostList | undefined
    try {
      const [_, danmu, fingerprint] = await getCachedInfo(roomId, this.options)
      if (!this.options.key)
        this.options.key = danmu.data.token
      // ref: https://github.com/SocialSisterYi/bilibili-API-collect/issues/933
      if (!this.options.buvid) {
        this.options.buvid = fingerprint
      }
      host = randomElement(danmu.data.host_list)
    }
    catch (error) {
      console.error(error)
    }

    return ssl
      ? WEBSOCKET_SSL_URL(
        this.options?.host ?? host?.host,
        this.options?.port ?? WEBSOCKET_SSL_PORT,
        this.options.path,
      )
      : WEBSOCKET_URL(
        this.options?.host ?? host?.host,
        this.options?.port ?? WEBSOCKET_PORT,
        this.options.path,
      )
  }

  private async init(options: BaseLiveClientOptions<Uint8Array>) {
    const roomId = parseRoomId(options.room)

    const ssl = !!options.ssl
    const url = await this.getWebSocketUrl(ssl, roomId)
    const room = cachedRoomInfo.get(roomId)?.data?.room_id || roomId
    this.options.room = room
    this.roomId = room
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
            // @ts-expect-error ignore
            this.ws = socket
            // @ts-expect-error ignore
            this._bindEvent(socket)
          })
        }
        else {
          // @ts-expect-error ignore
          socket = ws
          ws.binaryType = 'arraybuffer'
        }
      }
      else {
        socket = new WebSocket(_url, {
          headers: options.headers,
        })
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
          // @ts-expect-error ignore
          this.ws = socket
          // @ts-expect-error ignore
          this._bindEvent(socket)
        })
      }
      else {
        // @ts-expect-error ignore
        socket = ws
        ws.binaryType = 'arraybuffer'
      }
    }
    else {
      socket = new WebSocket(url, {
        headers: options.headers,
      })
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
    socket.addEventListener('message', e => this.emit(MESSAGE_EVENT, new Uint8Array(e.data)))
    // @ts-expect-error emit event
    socket.addEventListener('error', e => this.emit(ERROR_EVENT, e))
    // @ts-expect-error emit event
    socket.addEventListener('close', e => this.emit(CLOSE_EVENT, e))
  }
}

export function deserialize(buffer: Uint8Array) {
  return parser(buffer, inflates)
}

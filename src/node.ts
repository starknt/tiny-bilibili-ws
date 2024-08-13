import type { Socket } from 'node:net'
import { connect } from 'node:net'
import https from 'node:https'
import { Buffer } from 'node:buffer'
import type { CloseEvent, ErrorEvent } from 'ws'
import WebSocket from 'ws'
import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, NODE_SOCKET_PORT, NOOP, OPEN_EVENT, SOCKET_HOST, WEBSOCKET_PORT, WEBSOCKET_SSL_PORT, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base/base'
import { inflates } from './node/inflate'
import type { BaseLiveClientOptions, BuvidConfResponse, DanmuConfResponse, HostServerList, ISocket, IWebSocket, Merge, RoomResponse, TCPOptions, WSOptions } from './base/types'
import { DEFAULT_WS_OPTIONS } from './base/types'
import type { EventKey } from './base/eventemitter'
import { parser } from './base/buffer'
import { parseRoomId, randomElement, retry } from './base/utils'

export function getLongRoomId(room: number): Promise<RoomResponse> {
  return new Promise((resolve, reject) => {
    https.get(`https://api.live.bilibili.com/room/v1/Room/mobileRoomInit?id=${room}`, (res) => {
      let data = Buffer.alloc(0)

      res.on('data', (chunk) => {
        data += chunk
      })

      res.once('end', () => {
        resolve(JSON.parse(Buffer.from(data).toString()))
      })
    })
      .on('error', err => reject(err))
  })
}

export function getDanmuConf(room: number, signal?: AbortSignal): Promise<DanmuConfResponse> {
  return new Promise((resolve, reject) => {
    https.get(`https://api.live.bilibili.com/room/v1/Danmu/getConf?room_id=${room}&platform=pc&player=web`, { signal }, (res) => {
      let data = Buffer.alloc(0)

      res.on('data', (chunk) => {
        data += chunk
      })

      res.once('end', () => {
        resolve(JSON.parse(Buffer.from(data).toString()))
      })
    })
      .on('error', err => reject(err))
  })
}

export function getBuvidConf(): Promise<BuvidConfResponse> {
  return new Promise((resolve, reject) => {
    https.get('https://api.bilibili.com/x/frontend/finger/spi', (res) => {
      let data = Buffer.alloc(0)

      res.on('data', (chunk) => {
        data += chunk
      })
      res.once('end', () => {
        resolve(JSON.parse(Buffer.from(data).toString()))
      })
    })
      .on('error', err => reject(err))
  })
}

export interface TCPEvents {
  // [OPEN_EVENT]: void
  // [MESSAGE_EVENT]: Buffer
  // [ERROR_EVENT]: Error
  // [CLOSE_EVENT]: void

  error: Error
  close: boolean
  message: Buffer
}

const cachedRoomInfo: Map<number, RoomResponse> = new Map()
const cachedDanmuConf: Map<number, DanmuConfResponse> = new Map()
let fingerprint: string | undefined

async function getCachedInfo(room: number): Promise<[RoomResponse, DanmuConfResponse, string]> {
  let roomInfo: RoomResponse | undefined
  let danmuInfo: DanmuConfResponse | undefined
  if (cachedRoomInfo.has(room)) {
    roomInfo = cachedRoomInfo.get(room)!
  }
  else {
    const info = await retry(() => getLongRoomId(room), 2, 200)
    cachedRoomInfo.set(room, info)
    roomInfo = info
  }

  if (cachedDanmuConf.has(roomInfo.data.room_id)) {
    danmuInfo = cachedDanmuConf.get(roomInfo.data.room_id)!
  }
  else {
    const info = await retry(() => getDanmuConf(roomInfo.data.room_id), 2, 200)
    cachedDanmuConf.set(roomInfo.data.room_id, info)
    danmuInfo = info
  }

  if (!fingerprint) {
    const info = await retry(() => getBuvidConf(), 2, 200)
    fingerprint = info.data.b_3
  }

  return [roomInfo, danmuInfo, fingerprint]
}

export class KeepLiveTCP<E extends Record<EventKey, any> = object> extends LiveClient<Merge<TCPEvents, E>> {
  private buffer: Buffer = Buffer.alloc(0)
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
    let host: HostServerList | undefined
    try {
      const [_, danmu, fingerprint] = await getCachedInfo(roomId)
      if (!this.options.key)
        this.options.key = danmu.data.token
      // ref: https://github.com/SocialSisterYi/bilibili-API-collect/issues/933
      if (!this.options.buvid) {
        this.options.buvid = fingerprint
      }
      host = randomElement(danmu.data.host_server_list)
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
      this.buffer = Buffer.concat([this.buffer, buffer])
      this.splitBuffer()
    })
  }

  private splitBuffer() {
    while (this.buffer.length >= 4 && this.buffer.readInt32BE(0) <= this.buffer.length) {
      const size = this.buffer.readInt32BE(0)
      const pack = this.buffer.subarray(0, size)
      this.buffer = this.buffer.subarray(size)
      this.i++
      if (this.i > 5) {
        this.i = 0
        this.buffer = Buffer.from(this.buffer)
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
  message: Buffer
}

export class KeepLiveWS<E extends Record<EventKey, any> = object> extends LiveClient<Merge<WSEvents, E>> {
  ws!: WebSocket

  constructor(roomId: number, options: WSOptions = DEFAULT_WS_OPTIONS) {
    const resolvedOptions = Object.assign({}, DEFAULT_WS_OPTIONS, options)

    const liveOptions: BaseLiveClientOptions<Buffer> = {
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
    let host: HostServerList | undefined
    try {
      const [_, danmu, fingerprint] = await getCachedInfo(roomId)
      if (!this.options.key)
        this.options.key = danmu.data.token
      // ref: https://github.com/SocialSisterYi/bilibili-API-collect/issues/933
      if (!this.options.buvid) {
        this.options.buvid = fingerprint
      }
      host = randomElement(danmu.data.host_server_list)
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

  private async init(options: BaseLiveClientOptions<Buffer>) {
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
    socket.addEventListener('message', e => this.emit(MESSAGE_EVENT, Buffer.from(e.data as Buffer)))
    // @ts-expect-error emit event
    socket.addEventListener('error', e => this.emit(ERROR_EVENT, e))
    // @ts-expect-error emit event
    socket.addEventListener('close', e => this.emit(CLOSE_EVENT, e))
  }
}

export function deserialize(buffer: Buffer) {
  return parser(buffer, inflates)
}

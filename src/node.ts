// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Socket } from 'node:net'
import { connect } from 'node:net'
import https from 'node:https'
import { Buffer } from 'node:buffer'
import type { CloseEvent, ErrorEvent } from 'ws'
import WebSocket from 'ws'
import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, NODE_SOCKET_PORT, OPEN_EVENT, SOCKET_HOST, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base/base'
import { inflates } from './node/inflate'
import type { BaseLiveClientOptions, Merge, RoomResponse, TCPOptions, WSOptions } from './base/types'
import { DEFAULT_WS_OPTIONS } from './base/types'
import type { EventKey } from './base/eventemitter'

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

export interface TCPEvents {
  [OPEN_EVENT]: void
  [MESSAGE_EVENT]: Buffer
  [ERROR_EVENT]: Error
  [CLOSE_EVENT]: void

  error: Error
  close: void
  message: Buffer
}

export class KeepLiveTCP<E extends Record<EventKey, any> = { }> extends LiveClient<Merge<TCPEvents, E>> {
  private buffer: Buffer = Buffer.alloc(0)
  private i = 0
  tcpSocket: Socket

  constructor(roomId: number, options: TCPOptions = DEFAULT_WS_OPTIONS) {
    const resolvedOptions = Object.assign({}, DEFAULT_WS_OPTIONS, options)

    const socket = resolvedOptions.url ? connect(resolvedOptions.url) : connect(NODE_SOCKET_PORT, SOCKET_HOST)

    socket.on('ready', () => this.emit(OPEN_EVENT))
    socket.on('close', () => this.emit(CLOSE_EVENT))
    socket.on('error', e => this.emit(ERROR_EVENT, e))
    socket.on('data', (buffer) => {
      this.buffer = Buffer.concat([this.buffer, buffer])
      this.splitBuffer()
    })

    const liveOptions: BaseLiveClientOptions = {
      ...resolvedOptions,
      socket,
      zlib: inflates,
      room: roomId,
    }

    super(liveOptions)

    this.tcpSocket = socket
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
      this.emit(MESSAGE_EVENT, pack)
    }
  }
}

export interface WSEvents {
  [OPEN_EVENT]: void
  [MESSAGE_EVENT]: Buffer
  [ERROR_EVENT]: ErrorEvent
  [CLOSE_EVENT]: CloseEvent

  error: ErrorEvent
  close: CloseEvent
  message: Buffer
}

export class KeepLiveWS<E extends Record<EventKey, any> = { }> extends LiveClient<Merge<WSEvents, E>> {
  ws: WebSocket

  constructor(roomId: number, options: WSOptions = DEFAULT_WS_OPTIONS) {
    const resolvedOptions = Object.assign({}, DEFAULT_WS_OPTIONS, options)

    const socket = new WebSocket(options.ssl ? WEBSOCKET_SSL_URL : WEBSOCKET_URL)

    const liveOptions: BaseLiveClientOptions = {
      ...resolvedOptions,
      socket,
      zlib: inflates,
      room: roomId,
    }

    socket.addEventListener('open', () => this.emit(OPEN_EVENT))
    socket.addEventListener('message', e => this.emit(MESSAGE_EVENT, Buffer.from(e.data as Buffer)))
    socket.addEventListener('error', e => this.emit(ERROR_EVENT, e))
    socket.addEventListener('close', e => this.emit(CLOSE_EVENT, e))

    super(liveOptions)

    this.ws = socket
  }
}

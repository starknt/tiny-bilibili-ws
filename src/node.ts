import type { Socket } from 'node:net'
import { connect } from 'node:net'
import https from 'node:https'
import { Buffer } from 'node:buffer'
import WebSocket from 'ws'
import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, NODE_SOCKET_PORT, OPEN_EVENT, SOCKET_HOST, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base'
import { inflates } from './node/inflate'
import type { BaseLiveClientOptions, ListenerEvents, RoomResponse, TCPOptions, WSOptions } from './types'
import { DEFAULT_WS_OPTIONS } from './types'

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

export class KeepLiveTCP<T extends string = ListenerEvents> extends LiveClient<T> {
  private buffer: Buffer = Buffer.alloc(0)
  private i = 0
  tcpSocket: Socket

  constructor(roomId: number, options: TCPOptions = DEFAULT_WS_OPTIONS) {
    const resolvedOptions = Object.assign({}, DEFAULT_WS_OPTIONS, options)

    const socket = resolvedOptions.url ? connect(resolvedOptions.url) : connect(NODE_SOCKET_PORT, SOCKET_HOST)

    socket.on('ready', () => this.emit(OPEN_EVENT))
    socket.on('close', hadError =>
      this.emit(CLOSE_EVENT, hadError),
    )
    socket.on('error', (...params: any[]) => this.emit(ERROR_EVENT, ...params))
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

export class KeepLiveWS<T extends string = ListenerEvents> extends LiveClient<T> {
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

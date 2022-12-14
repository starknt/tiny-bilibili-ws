import EventEmitter from 'eventemitter3'
import { WS_OP, deserialize, serialize } from './buffer'
import type { BaseLiveClientOptions, ISocket, IWebSocket, IZlib, ListenerEvents, LiveHelloMessage, Message } from './types'
import { fromEvent } from './utils'

/// const

export const MESSAGE_EVENT = Symbol('')
export const OPEN_EVENT = Symbol('')
export const ERROR_EVENT = Symbol('')
export const CLOSE_EVENT = Symbol('')

export const SOCKET_HOST = 'broadcastlv.chat.bilibili.com'
export const NODE_SOCKET_PORT = 2243
export const WEBSOCKET_SSL_URL = `wss://${SOCKET_HOST}:2245/sub`
export const WEBSOCKET_URL = `ws://${SOCKET_HOST}:2244/sub`

///

export class LiveClient<T extends string = ListenerEvents> extends EventEmitter<T | ListenerEvents | symbol> {
  roomId: number
  /** 人气值 */
  online = 0
  closed = true

  private socket: ISocket | IWebSocket
  private timeout: any
  private zlib: IZlib
  private live = false
  private firstMessage: LiveHelloMessage

  private skipMessage: string[] = []

  constructor(readonly options: BaseLiveClientOptions) {
    if (typeof options.room !== 'number' || Number.isNaN(options.room))
      throw new Error(`roomId ${options.room} must be Number not NaN`)

    super()

    this.firstMessage = {
      roomid: options.room,
      clientver: options.clientVer,
      protover: options.protover,
      uid: options.uid,
      platform: options.platform,
      type: options.type,
    }

    if (options.key)
      this.firstMessage.key = options.key

    this.socket = options.socket
    this.roomId = options.room
    this.zlib = options.zlib

    this.bindEvent()
  }

  onlyListener(events: string[]) {
    for (const event of events) {
      if (!this.skipMessage.includes(event))
        this.skipMessage.push(event)
    }
  }

  clearOnlyListener(events: string[]) {
    for (const event of events) {
      if (this.skipMessage.includes(event))
        this.skipMessage.splice(this.skipMessage.findIndex(v => event === v), 1)
    }
  }

  private rawSend(data: Uint8Array) {
    if ('write' in this.socket)
      this.socket.write(data)
    else
      this.socket.send(data)
  }

  private bindEvent() {
    this.on(OPEN_EVENT, () => {
      this.closed = false
      this.emit('open')
      if (this.options.authBody)
        this.rawSend(this.options.authBody)
      else
        this.send(WS_OP.USER_AUTHENTICATION, this.firstMessage)
    })

    this.on(MESSAGE_EVENT, async (buffer: Uint8Array) => {
      if (this.options.raw)
        this.emit('message', buffer)

      const packs = await deserialize(buffer, this.zlib)

      for (const packet of packs) {
        if (packet.meta.op === WS_OP.MESSAGE) {
          const cmd: string = packet.data?.cmd || (packet.data?.msg && packet.data?.msg?.cmd)
          if (this.skipMessage.length > 0 && !this.skipMessage.includes(cmd))
            continue

          if (this.options.stub)
            this.emit('msg', packet)

          if (cmd.includes('DANMU_MSG'))
            this.emit('DANMU_MSG', packet)
          else
            this.emit(cmd as any, packet)

          continue
        }

        if (packet.meta.op === WS_OP.HEARTBEAT_REPLY) {
          this.online = packet.data
          clearTimeout(this.timeout)

          this.timeout = setTimeout(() => this.heartbeat(), 1000 * 30)

          this.emit('heartbeat', packet)

          continue
        }

        if (packet.meta.op === WS_OP.CONNECT_SUCCESS) {
          this.emit('live')
          this.live = true

          this.send(WS_OP.HEARTBEAT)
        }
      }
    })

    this.on(ERROR_EVENT, (error: any) => {
      this.emit('error', error)
    })

    this.on(CLOSE_EVENT, () => {
      this.close()
    })
  }

  send(op: WS_OP, data: Record<string, any> | string = {}) {
    this.rawSend(serialize(op, data))
  }

  async runWhenConnected(...fns: (() => void)[]) {
    if (!this.live)
      await fromEvent(this, 'live')

    for (const fn of fns)
      fn()
  }

  heartbeat() {
    this.send(WS_OP.HEARTBEAT)
  }

  async getOnline() {
    if (!this.live)
      await fromEvent(this, 'live')
    else
      this.heartbeat()

    return new Promise<number>(resolve => this.once('heartbeat', (msg: Message<number>) => resolve(msg.data)))
  }

  close() {
    this.emit('close')

    if (!this.live)
      return
    this.live = false
    clearTimeout(this.timeout)

    if ('end' in this.socket)
      this.socket.end()
    else
      this.socket.close()
    this.closed = true
  }
}


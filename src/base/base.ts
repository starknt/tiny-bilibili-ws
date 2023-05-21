import { WS_OP, deserialize, serialize } from './buffer'
import type { BuiltinEvent } from './cmd'
import { fromEvent } from './utils'
import type { BaseLiveClientOptions, ISocket, IWebSocket, IZlib, LiveHelloMessage, Merge, Message } from './types'
import { EventEmitter } from './eventemitter'
import type { EventKey } from './eventemitter'

/// const

export const MESSAGE_EVENT = '__message__'
export const OPEN_EVENT = '__open__'
export const ERROR_EVENT = '__error__'
export const CLOSE_EVENT = '__close__'

export const SOCKET_HOST = 'broadcastlv.chat.bilibili.com'
export const NODE_SOCKET_PORT = 2243
export const WEBSOCKET_SSL_URL = `wss://${SOCKET_HOST}/sub`
export const WEBSOCKET_URL = `ws://${SOCKET_HOST}:2244/sub`

///

interface BilibiliLiveEvent extends BuiltinEvent {
  open: void
  msg: Message<any>
  live: void
  heartbeat: number
}

export class LiveClient<E extends Record<EventKey, any>> extends EventEmitter<Merge<BilibiliLiveEvent, E>> {
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
    let room = 0
    if (typeof options.room === 'string')
    // @ts-expect-error transform string
      room = +(options.room.trim())
    else
      room = options.room
    if (typeof room !== 'number' || Number.isNaN(room))
      throw new Error(`roomId ${room} must be Number not NaN`)

    super()

    this.firstMessage = {
      roomid: room,
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

  onlyListener(events: string[] | string) {
    for (const event of (Array.isArray(events) ? events : [events])) {
      if (!this.skipMessage.includes(event))
        this.skipMessage.push(event)
    }
  }

  clearOnlyListener(events: string[] | string) {
    for (const event of (Array.isArray(events) ? events : [events])) {
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
    // @ts-expect-error open event
    this.on(OPEN_EVENT, () => {
      this.closed = false

      // @ts-expect-error open event
      this.emit('open')
      if (this.options.authBody)
        this.rawSend(this.options.authBody)
      else
        this.send(WS_OP.USER_AUTHENTICATION, this.firstMessage)
    })

    // @ts-expect-error message event
    this.on(MESSAGE_EVENT, async (buffer: Uint8Array) => {
      if (this.options.raw)
      // @ts-expect-error message event
        this.emit('message', buffer)

      const packs = await deserialize(buffer, this.zlib)

      for (const packet of packs) {
        if (packet.meta.op === WS_OP.MESSAGE) {
          const cmd: string = packet.data?.cmd || (packet.data?.msg && packet.data?.msg?.cmd)
          if (this.skipMessage.length > 0 && !this.skipMessage.includes(cmd))
            continue

          if (this.options.stub)
          // @ts-expect-error message event
            this.emit('msg', packet)

          if (cmd.includes('DANMU_MSG'))
          // @ts-expect-error bulk danmu msg event
            this.emit('DANMU_MSG', packet)
          else
          // @ts-expect-error any event
            this.emit(cmd as any, packet)

          continue
        }

        if (packet.meta.op === WS_OP.HEARTBEAT_REPLY) {
          this.online = packet.data
          clearTimeout(this.timeout)

          this.timeout = setTimeout(() => this.heartbeat(), 1000 * 30)

          // @ts-expect-error heartbeat event allow
          this.emit('heartbeat', this.online)

          continue
        }

        if (packet.meta.op === WS_OP.CONNECT_SUCCESS) {
          // @ts-expect-error live event allow
          this.emit('live')
          this.live = true

          this.send(WS_OP.HEARTBEAT)
        }
      }
    })

    // @ts-expect-error Error Event ok
    this.on(ERROR_EVENT, (error: any) => {
      // @ts-expect-error Error Event ok
      this.emit('error', error)
    })

    // @ts-expect-error CLOSE Event ok
    this.on(CLOSE_EVENT, (e) => {
      // @ts-expect-error close event
      this.emit('close', e)
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

    // @ts-expect-error heartbeat event
    return new Promise<number>(resolve => this.once('heartbeat', (msg: Message<number>) => resolve(msg.data)))
  }

  close() {
    // @ts-expect-error close event
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

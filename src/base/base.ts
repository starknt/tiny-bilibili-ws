import { WS_OP, deserialize, serialize } from './buffer'
import type { BuiltinEvent } from './cmd'
import { excludeNil, fromEvent, normalizeWebsocketPath } from './utils'
import type { BILIBILI_HOST, BaseLiveClientOptions, ISocket, IWebSocket, IZlib, LiveHelloMessage, Merge, Message } from './types'
import { EventEmitter } from './eventemitter'
import type { EventKey } from './eventemitter'

/// const
export enum SOCKET_HOSTS {
  DEFAULT = 'zj-cn-live-comet.chat.bilibili.com',
}

export const MESSAGE_EVENT = '__message__'
export const OPEN_EVENT = '__open__'
export const ERROR_EVENT = '__error__'
export const CLOSE_EVENT = '__close__'

export function NOOP() {}

export const SOCKET_HOST = SOCKET_HOSTS.DEFAULT
export const NODE_SOCKET_PORT = 2243
export const WEBSOCKET_PORT = 2244
export const WEBSOCKET_SSL_PORT = 2245
export const WEBSOCKET_PATH = 'sub'
export const WEBSOCKET_SSL_URL = (host: BILIBILI_HOST = SOCKET_HOST, port = WEBSOCKET_SSL_PORT, path?: string) => `wss://${host}${port === 443 ? '' : `:${port}`}${normalizeWebsocketPath(path ?? WEBSOCKET_PATH)}`
export const WEBSOCKET_URL = (host: BILIBILI_HOST = SOCKET_HOST, port = WEBSOCKET_PORT, path?: string) => `ws://${host}:${port}${normalizeWebsocketPath(path ?? WEBSOCKET_PATH)}`

///

interface BilibiliLiveEvent extends BuiltinEvent {
  'open': void
  'msg': Message<any>
  'live': void
  'heartbeat': number
  'reconnect': boolean

  'deserialize:error': Error
}

export class LiveClient<E extends Record<EventKey, any>> extends EventEmitter<Merge<BilibiliLiveEvent, E>> {
  /** 人气值 */
  online: number = 0
  closed: boolean = true
  roomId: number = 0

  private close_func_called = false
  private socket: ISocket | IWebSocket
  private timeout: any
  private readonly HEARTBEAT_TIME: number
  private readonly RECONNECT_TIME: number
  private zlib: IZlib
  private live = false

  private skipMessage: string[] = []

  constructor(readonly options: BaseLiveClientOptions<any>) {
    super()

    this.HEARTBEAT_TIME = options.heartbeatTime ?? 30 * 1000
    this.RECONNECT_TIME = options.reconnectTime ?? 5 * 1000

    this.socket = options.socket
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
      if (this.options.authBody) {
        this.rawSend(this.options.authBody)
      }
      else {
        const msg = {
          uid: this.options.uid,
          roomid: this.roomId,
          protover: this.options.protover,
          platform: this.options.platform,
          type: this.options.type,
          key: this.options.key,
          buvid: this.options.buvid,
        } satisfies LiveHelloMessage

        this.send(WS_OP.USER_AUTHENTICATION, excludeNil(msg))
      }
    })

    // @ts-expect-error message event
    this.on(MESSAGE_EVENT, async (buffer: Uint8Array) => {
      if (this.options.raw)
      // @ts-expect-error message event
        this.emit('message', buffer)

      const packs = await deserialize(buffer, this.zlib)
        .catch<Array<Message<any>>>((err) => {
          if (err instanceof Error)
          // @ts-expect-error emit error
            this.emit('deserialize:error', err)

          return []
        })

      for (const packet of packs) {
        if (packet.meta.op === WS_OP.MESSAGE) {
          const cmd: string = packet.data?.cmd || (packet.data?.msg && packet.data?.msg?.cmd)
          if (this.skipMessage.length > 0 && this.skipMessage.includes(cmd))
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

          this.timeout = setTimeout(() => this.heartbeat(), this.HEARTBEAT_TIME)

          // @ts-expect-error heartbeat event allow
          this.emit('heartbeat', this.online)

          continue
        }

        if (packet.meta.op === WS_OP.CONNECT_SUCCESS) {
          if (typeof packet.data === 'object' && packet.data?.code !== 0) {
            console.warn(`连接失败: `, packet.data)
          }
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

      if (this.options.keepalive && !this.close_func_called) {
        // @ts-expect-error emit reconnect event
        this.emit('reconnect', true) // Warning:  reconnect to bilibili server

        const timer = setTimeout(() => {
          clearTimeout(timer)
          this.closed = true
          this.online = 0
          this.live = false
          clearTimeout(this.timeout)
          this.socket.reconnect()
        }, this.RECONNECT_TIME)
      }
      else {
        this.closed = true
        this.online = 0
        this.live = false
        this.close_func_called = false
        clearTimeout(this.timeout)
      }
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

    return new Promise<number>((resolve) => {
      // @ts-expect-error heartbeat event
      this.once('heartbeat', (data: number | Message<number>) => {
        if (typeof data === 'number')
          resolve(data)
        else
          resolve(data.data)
      })

      this.heartbeat()
    })
  }

  close() {
    // issue: https://github.com/ddiu8081/blive-message-listener/issues/24
    // this.emit('close', this.socket.type === 'tcp' ? false : { code: 0, reason: 'close', wasClean: true })
    if (!this.live)
      return false

    this.close_func_called = true

    clearTimeout(this.timeout)

    if ('end' in this.socket)
      this.socket.end()
    else
      this.socket.close()
    return true
  }

  reconnect() {
    this.closed = true
    this.online = 0
    this.live = false
    clearTimeout(this.timeout)
    this.close_func_called = false
    // @ts-expect-error emit reconnect event
    this.emit('reconnect', false)
    this.socket.reconnect()
  }
}

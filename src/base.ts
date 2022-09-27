import EventEmitter from 'eventemitter3'
import { WS_OP, deserialize, serialize } from './buffer'
import type { BaseLiveClientOptions, ISocket, IZlib, ListenerEvents, LiveHelloMessage } from './types'

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

export class LiveClient extends EventEmitter<string | symbol> {
  roomId: number

  private socket: ISocket
  private timeout: any
  private zlib: IZlib
  private live = false
  private online = 0
  private firstMessage: LiveHelloMessage

  constructor(options: BaseLiveClientOptions) {
    super()

    this.firstMessage = {
      roomid: options.room,
      clientver: options.clientVer!,
      protover: options.protover!,
      uid: options.uid!,
      platform: options.platform!,
      type: options.type!,
    }

    this.socket = options.socket
    this.roomId = options.room
    this.zlib = options.zlib

    this.bindEvent()
  }

  private bindEvent() {
    this.on(OPEN_EVENT, () => {
      this.socket.write(serialize(WS_OP.USER_AUTHENTICATION, this.firstMessage))
      this.emit('live')
    })

    this.on(MESSAGE_EVENT, async (buffer: Uint8Array) => {
      this.emit('message', buffer)

      const packs = await deserialize(buffer, this.zlib)

      packs.forEach((packet) => {
        if (packet.meta.op === WS_OP.CONNECT_SUCCESS) {
          this.emit('live')

          this.socket.write(serialize(WS_OP.HEARTBEAT))
        }

        if (packet.meta.op === WS_OP.HEARTBEAT_REPLY) {
          this.timeout = setTimeout(() => this.heartbeat(), 1000 * 30)

          this.emit('heartbeat', this.online)
        }

        if (packet.meta.op === WS_OP.MESSAGE) {
          this.emit('msg', packet)
          const cmd = packet.data?.cmd || (packet.data?.msg && packet.data?.msg?.cmd)
          if (cmd) {
            if (cmd.includes('DANMU_MSG'))
              this.emit('DANMU_MSG', packet)
            else
              this.emit(cmd, packet)
          }
        }
      })
    })

    this.on(ERROR_EVENT, (error: any) => {
      this.emit('error', error)
    })

    this.on(CLOSE_EVENT, () => {
      this.emit('close')
    })
  }

  heartbeat() {
    this.socket.write(serialize(WS_OP.HEARTBEAT))
  }

  getOnline() {
    this.heartbeat()

    return new Promise<number>(resolve => this.once('heartbeat', resolve))
  }

  close() {
    if (!this.live)
      return
    this.live = false
    clearTimeout(this.timeout)
    this.socket.end()
    this.emit('closed')
  }
}


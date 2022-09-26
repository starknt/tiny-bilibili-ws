import EventEmitter from 'eventemitter3'
import type { IZlib } from './buffer'
import { LiveProtocolOperation, deserialize, serialize } from './buffer'
import type { ISocket } from './types'

export interface LiveHelloMessage {
  clientver: `${number}.${number}.${number}`
  platform: 'web'
  protover: 2
  roomid: number
  uid: 0
  type: 2
}

export const MESSAGE_EVENT = Symbol('')
export const OPEN_EVENT = Symbol('')
export const ERROR_EVENT = Symbol('')
export const CLOSE_EVENT = Symbol('')

export type ListenerEvents = 'msg' | 'message' | 'open' | 'close' | 'error' | 'live'

export class Live extends EventEmitter<ListenerEvents | symbol | string> {
  readonly roomId: number

  timeout: any

  constructor(roomId: number, private readonly _socket: ISocket, readonly zlib: IZlib<Buffer>) {
    if (typeof roomId !== 'number' || Number.isNaN(roomId))
      throw new Error(`roomId ${roomId} must be Number not NaN`)

    super()

    this.on(OPEN_EVENT, () => {
      const helloMessage: LiveHelloMessage = {
        clientver: '2.0.11',
        platform: 'web',
        protover: 2,
        roomid: this.roomId,
        uid: 0,
        type: 2,
      }

      this._socket.write(serialize(LiveProtocolOperation.USER_AUTHENTICATION, helloMessage))
      this.emit('live')
    })

    this.roomId = roomId
    this.bindEvent()
  }

  private bindEvent() {
    this.on(MESSAGE_EVENT, async (buffer: Uint8Array) => {
      const packs = await deserialize(buffer, this.zlib)

      packs.forEach(({ type, data }) => {
        if (type === 'welcome') {
          this.emit('live')
          this._socket.write(serialize(LiveProtocolOperation.HEARTBEAT, {}))
        }
        if (type === 'heartbeat')
          this.timeout = setTimeout(() => this.heartbeat(), 1000 * 30)
          // this.emit('heartbeat', this.online)

        if (type === 'message') {
          console.log(data)
          this.emit('msg', data)
          const cmd = data?.cmd || (data?.msg && data?.msg?.cmd)
          if (cmd) {
            if (cmd.includes('DANMU_MSG'))

              this.emit('DANMU_MSG', data)

            else this.emit(cmd, data)
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
    this._socket.write(serialize(LiveProtocolOperation.HEARTBEAT, {}))
  }

  getOnline() {
    this.heartbeat()
    // return new Promise<number>(resolve => this.once('heartbeat', resolve))
  }
}

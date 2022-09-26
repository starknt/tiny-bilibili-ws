import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, OPEN_EVENT } from './base'
import type { ISocket } from './types'
import { inflates } from './browser/inflate'

export class KeepLiveTCP extends LiveClient {
  private socket: WebSocket
  i = 0

  constructor(roomId: number) {
    const socket = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub')
    socket.binaryType = 'arraybuffer'
    const _socket: ISocket = {
      write(buffer) {
        socket.send(new Uint8Array(buffer))
      },
      end() {
        socket.close()
      },
    }

    socket.addEventListener('open', () => this.emit(OPEN_EVENT))
    socket.addEventListener('close', () => this.emit(CLOSE_EVENT))
    socket.addEventListener('error', (...params: any[]) => this.emit(ERROR_EVENT, ...params))
    socket.addEventListener('message', (e: MessageEvent<ArrayBuffer>) => {
      this.emit(MESSAGE_EVENT, new Uint8Array(e.data))
    })

    super(roomId, _socket, inflates as any)

    this.socket = socket
  }
}


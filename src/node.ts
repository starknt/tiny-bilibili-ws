import type { Socket } from 'node:net'
import { connect } from 'node:net'
import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, OPEN_EVENT } from './base'
import { inflates } from './node/inflate'

export class KeepLiveTCP extends LiveClient {
  private socket: Socket
  private buffer: Buffer = Buffer.alloc(0)
  private i = 0

  constructor(roomId: number) {
    const socket = connect(2243, 'broadcastlv.chat.bilibili.com')

    socket.on('ready', () => this.emit(OPEN_EVENT))
    socket.on('close', hadError =>
      this.emit(CLOSE_EVENT, hadError),
    )
    socket.on('error', (...params: any[]) => {
      console.error(...params)

      this.emit(ERROR_EVENT, ...params)
    })
    socket.on('data', (buffer) => {
      this.buffer = Buffer.concat([this.buffer, buffer])
      this.splitBuffer()
    })

    super(roomId, socket, inflates)

    this.socket = socket
  }

  splitBuffer() {
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

new KeepLiveTCP(1017)

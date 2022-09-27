import { CLOSE_EVENT, ERROR_EVENT, LiveClient, MESSAGE_EVENT, OPEN_EVENT, WEBSOCKET_SSL_URL, WEBSOCKET_URL } from './base'
import type { BaseLiveClientOptions, ISocket, RoomResponse, WSOptions } from './types'
import { DEFAULT_WS_OPTIONS } from './types'
import { inflates } from './browser/inflate'

export async function getLongRoomId(room: number): Promise<RoomResponse> {
  const res = await fetch(`https://api.live.bilibili.com/room/v1/Room/mobileRoomInit?id=${room}`)
  return await res.json()
}

export class KeepLiveWS extends LiveClient {
  ws: WebSocket

  constructor(roomId: number, options: WSOptions = DEFAULT_WS_OPTIONS) {
    options = Object.assign({}, DEFAULT_WS_OPTIONS, options)

    const websocket = new WebSocket(options.ssl ? WEBSOCKET_SSL_URL : WEBSOCKET_URL)
    websocket.binaryType = 'arraybuffer'

    const socket: ISocket = {
      write(buffer) {
        websocket.send(new Uint8Array(buffer))
      },
      end() {
        websocket.close()
      },
    }

    websocket.addEventListener('open', () => this.emit(OPEN_EVENT))
    websocket.addEventListener('close', () => this.emit(CLOSE_EVENT))
    websocket.addEventListener('error', (...params: any[]) => this.emit(ERROR_EVENT, ...params))
    websocket.addEventListener('message', (e: MessageEvent<ArrayBuffer>) => this.emit(MESSAGE_EVENT, new Uint8Array(e.data)))

    const liveOptions: BaseLiveClientOptions = {
      ...options,
      socket,
      room: roomId,
      zlib: inflates,
    }

    super(liveOptions)

    this.ws = websocket
  }
}


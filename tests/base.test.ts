import type { BaseLiveClientOptions, IWebSocket, IZlib } from '../src/base/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CLOSE_EVENT, LiveClient, MESSAGE_EVENT, OPEN_EVENT } from '../src/base/base'
import { serialize, WS_OP } from '../src/base/buffer'

function createClient() {
  const socket = {
    type: 'websocket',
    send: vi.fn(),
    close: vi.fn(),
    reconnect: vi.fn(),
  } as IWebSocket

  const options = {
    room: 1,
    keepalive: true,
    reconnectTime: 100,
    socket,
    zlib: {} as IZlib,
  } as BaseLiveClientOptions<Uint8Array>

  const client = new LiveClient(options)

  socket.close = vi.fn(() => client.emit(CLOSE_EVENT, { code: 1000, reason: 'close', wasClean: true } as CloseEvent))
  return { client, socket }
}

async function open(client: LiveClient<any>) {
  const live = new Promise<void>(resolve => client.once('live', () => resolve()))
  client.emit(OPEN_EVENT)
  client.emit(MESSAGE_EVENT, serialize(WS_OP.CONNECT_SUCCESS, { code: 0 }))
  await live
}

describe('live client', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not reconnect after user closes during reconnect delay', async () => {
    vi.useFakeTimers()

    const { client, socket } = createClient()
    await open(client)

    client.emit(CLOSE_EVENT, { code: 1006, reason: 'network', wasClean: false } as CloseEvent)
    expect(client.close()).toBe(true)

    vi.advanceTimersByTime(100)

    expect(socket.reconnect).not.toHaveBeenCalled()
  })
})

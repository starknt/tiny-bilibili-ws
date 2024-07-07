import type { EventEmitter } from './eventemitter'
import type { Message } from './types'

export function fromEvent<T>(emitter: EventEmitter<any>, event: string, timeout?: number) {
  return new Promise<T>((resolve, reject) => {
    emitter.once(event, (arg: T) => {
      resolve(arg)
    })

    if (timeout) {
      const t = setTimeout(() => {
        clearTimeout(t)
        reject(new Error('timeout'))
      })
    }
  })
}

export function toMessageData(message: Message<any>) {
  return message.data
}

export function normalizeWebsocketPath(path: string) {
  return path[0] === '/' ? path : `/${path}`
}

export function randomElement<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function parseRoomId(roomId: string | number, fallback?: number | (() => number)) {
  const room = Number(roomId)

  if (Number.isNaN(room)) {
    if (typeof fallback === 'function')
      return fallback()
    if (typeof fallback === 'number')
      return fallback
    throw new Error('roomId must be Number')
  }

  return room
}

export function excludeNil<T extends object>(obj: T) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))
}

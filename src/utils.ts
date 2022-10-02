import type EventEmitter from 'eventemitter3'

export function fromEvent<T>(emitter: EventEmitter, event: string, timeout?: number) {
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

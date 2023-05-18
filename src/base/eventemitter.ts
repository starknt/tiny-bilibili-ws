export type Nil = undefined | void | null
export type EventKey = string
export type Listener<O extends Record<string | number, any>, K extends keyof O, V = O[K]> =
  V extends Array<any>
    ? V extends [infer Arg] ? (arg1: Arg) => void | Promise<void>
      : V extends [infer Arg1, infer Arg2] ? (arg1: Arg1, arg2: Arg2) => void | Promise<void>
        : V extends [infer Arg1, infer Arg2, infer Arg3] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3) => void | Promise<void>
          : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4) => void | Promise<void>
            : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5) => void | Promise<void>
              : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6) => void | Promise<void>
                : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6, infer Arg7] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6, arg7: Arg7) => void | Promise<void>
                  : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6, infer Arg7, infer Arg8] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6, arg7: Arg7, arg8: Arg8) => void | Promise<void>
                    : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6, infer Arg7, infer Arg8, infer Arg9] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6, arg7: Arg7, arg8: Arg8, arg9: Arg9) => void | Promise<void>
                      : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6, infer Arg7, infer Arg8, infer Arg9, infer Arg10] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6, arg7: Arg7, arg8: Arg8, arg9: Arg9, arg10: Arg10) => void | Promise<void>
                        : (...args: any[]) => void | Promise<void>
    : V extends Nil
      ? () => void | Promise<void>
      : (arg: V) => void | Promise<void>

export class EventEmitter<E extends Record<EventKey, any>> {
  private readonly eventListeners: Map<keyof E, Listener<E, any>[]> = new Map()

  get eventNames() {
    return this.eventListeners.keys()
  }

  on<N extends keyof E>(eventName: N, listener: Listener<E, N>) {
    if (!this.eventListeners.has(eventName))
      this.eventListeners.set(eventName, [listener])
    this.eventListeners.get(eventName)!.push(listener)
    return this
  }

  once<N extends keyof E>(eventName: N, listener: Listener<E, N>) {
    const _listener = async (...args: any[]) => {
      // @ts-expect-error rest parameter allow
      await listener(...args)
      // @ts-expect-error rest parameter allow
      this.off(eventName, _listener)
    }
    // @ts-expect-error rest parameter allow
    this.on(eventName, _listener)
    return this
  }

  addListener<N extends keyof E>(eventName: N, listener: Listener<E, N>) {
    this.on(eventName, listener)
    return this
  }

  off<N extends keyof E>(eventName: N, listener: Listener<E, N>): this {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName)!.filter(
        l => l !== listener,
      )
      this.eventListeners.set(eventName, listeners)
    }
    return this
  }

  emit<N extends keyof E>(eventName: N, ...args: Parameters<Listener<E, N>>) {
    for (const callback of (this.eventListeners.get(eventName) ?? [])) {
      // @ts-expect-error rest parameter allow
      callback(...args)
        ?.then(() => { /* ignore void */ })
        ?.catch(() => { /* ignore error */ })
    }
    return this
  }

  removeListener<N extends keyof E>(eventName: N, listener: Listener<E, N>): this {
    return this.off(eventName, listener)
  }

  prependListener<N extends keyof E>(eventName: N, listener: Listener<E, N>): this {
    if (this.eventListeners.has(eventName))
      this.eventListeners.get(eventName)?.unshift(listener)
    else
      this.eventListeners.set(eventName, [listener])

    return this
  }

  removeAllListeners<N extends keyof E>(eventName?: N) {
    if (eventName)
      this.eventListeners.delete(eventName)
    else
      this.eventListeners.clear()
  }

  listenerCount<N extends keyof E>(eventName: N): number {
    return this.eventListeners.get(eventName)?.length ?? 0
  }
}

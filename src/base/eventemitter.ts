import E3 from 'eventemitter3'

export type Nil = undefined | void | null
export type EventKey = string | symbol
export type ListenerResult = void | Promise<void>
export type Listener<O extends Record<EventKey, any>, K extends keyof O, V = O[K]> =
  V extends Array<any>
    ? V extends [infer Arg] ? (arg1: Arg) => ListenerResult
      : V extends [infer Arg1, infer Arg2] ? (arg1: Arg1, arg2: Arg2) => ListenerResult
        : V extends [infer Arg1, infer Arg2, infer Arg3] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3) => ListenerResult
          : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4) => ListenerResult
            : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5) => ListenerResult
              : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6) => ListenerResult
                : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6, infer Arg7] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6, arg7: Arg7) => ListenerResult
                  : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6, infer Arg7, infer Arg8] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6, arg7: Arg7, arg8: Arg8) => ListenerResult
                    : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6, infer Arg7, infer Arg8, infer Arg9] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6, arg7: Arg7, arg8: Arg8, arg9: Arg9) => ListenerResult
                      : V extends [infer Arg1, infer Arg2, infer Arg3, infer Arg4, infer Arg5, infer Arg6, infer Arg7, infer Arg8, infer Arg9, infer Arg10] ? (arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4, arg5: Arg5, arg6: Arg6, arg7: Arg7, arg8: Arg8, arg9: Arg9, arg10: Arg10) => ListenerResult
                        : (...args: any[]) => ListenerResult
    : V extends Nil
      ? () => ListenerResult
      : V extends boolean ? (arg: boolean) => ListenerResult
        : (arg: V) => ListenerResult

export class EventEmitter<E extends Record<EventKey, any>> extends E3 {
  on<N extends keyof E>(eventName: N, listener: Listener<E, N>) {
    return super.on(eventName as EventKey, listener)
  }

  once<N extends keyof E>(eventName: N, listener: Listener<E, N>) {
    return super.once(eventName as EventKey, listener)
  }

  addListener<N extends keyof E>(eventName: N, listener: Listener<E, N>) {
    return this.on(eventName, listener)
  }

  off<N extends keyof E>(eventName: N, listener: Listener<E, N>): this {
    return super.off(eventName as EventKey, listener)
  }

  emit<N extends keyof E>(eventName: N, ...args: Parameters<Listener<E, N>>) {
    return super.emit(eventName as EventKey, ...args)
  }

  removeListener<N extends keyof E>(eventName: N, listener: Listener<E, N>): this {
    return this.off(eventName, listener)
  }

  removeAllListeners<N extends keyof E>(eventName?: N) {
    return super.removeAllListeners(eventName as EventKey)
  }

  listenerCount<N extends keyof E>(eventName?: N): number {
    if (!eventName)
      return super.eventNames().length
    return super.listenerCount(eventName as EventKey)
  }
}

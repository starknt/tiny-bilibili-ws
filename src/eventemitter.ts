export class EventEmitter<E extends Record<string | number, any>> {
  private readonly eventListeners: Map<keyof E, ((arg: any) => void | Promise<void>)[]> = new Map()

  get eventNames() {
    return this.eventListeners.keys()
  }

  on<N extends keyof E>(eventName: N, listener: (arg: E[typeof eventName]) => void | Promise<void>) {
    if (!this.eventListeners.has(eventName))
      this.eventListeners.set(eventName, [listener])
    this.eventListeners.get(eventName)!.push(listener)
    return this
  }

  once<N extends keyof E>(eventName: N, listener: (arg: E[typeof eventName]) => void | Promise<void>) {
    const _listener = async (arg: E[typeof eventName]) => {
      await listener(arg)
      this.off(eventName, _listener)
    }
    this.on(eventName, _listener)
    return this
  }

  addListener<N extends keyof E>(eventName: N, listener: (arg: E[typeof eventName]) => void | Promise<void>) {
    this.on(eventName, listener)
    return this
  }

  off<N extends keyof E>(eventName: N, listener: (arg: E[typeof eventName]) => void | Promise<void>): this {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName)!.filter(
        l => l !== listener,
      )
      this.eventListeners.set(eventName, listeners)
    }
    return this
  }

  emit<N extends keyof E>(eventName: N, data?: E[typeof eventName]) {
    for (const callback of (this.eventListeners.get(eventName) ?? [])) {
      callback(data)
        ?.then(() => { /* ignore void */ })
        ?.catch(() => { /* ignore error */ })
    }
    return this
  }

  removeListener<N extends keyof E>(eventName: N, listener: (arg: E[typeof eventName]) => void | Promise<void>): this {
    return this.off(eventName, listener)
  }

  prependListener<N extends keyof E>(eventName: N, listener: (arg: E[typeof eventName]) => void | Promise<void>): this {
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
